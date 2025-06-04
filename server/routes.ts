import { v2 as cloudinaryV2 } from 'cloudinary';
import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';
import { insertInquirySchema, insertNearbyFacilitySchema, insertPropertySchema } from "../shared/schema";
import authRouter from "./auth";
import { sendInquiryNotification } from "./email";
import { storage } from "./storage";

// Initialize cloudinary and create upload middleware
const cloudinary = cloudinaryV2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Debug: Check Cloudinary configuration
console.log("🔧 Cloudinary Configuration:");
console.log("   CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ Missing");
console.log("   API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ Missing");
console.log("   API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ Missing");

// Extend Multer File interface to include Cloudinary properties
interface CloudinaryFile extends Express.Multer.File {
  cloudinaryId?: string;
  cloudinaryUrl?: string;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Cloudinary config check middleware
const checkCloudinaryConfig = (req: any, res: any, next: any) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({ 
      error: "Cloudinary configuration missing. Please check environment variables." 
    });
  }
  next();
};

const deleteFromCloudinary = async (publicId: string, resourceType: 'image' | 'video' = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  app.use('/api/auth', authRouter);

  // Middleware to check authentication
  const ensureAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user) {
      return next();
    }
    res.status(401).json({ message: 'Not authenticated' });
  };

  // Middleware to check admin role
  const ensureAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
      return next();
    }
    res.status(403).json({ message: 'Admin access required' });
  };

  // Middleware to ensure user is a superadmin
  function ensureSuperAdmin(req: any, res: any, next: any) {
    if (req.isAuthenticated() && req.user.role === 'superadmin') {
      return next();
    }
    res.status(403).json({ message: 'Access denied - requires superadmin role' });
  }

  // Middleware to ensure user is staff, admin, or superadmin
  function ensureStaff(req: any, res: any, next: any) {
    if (req.isAuthenticated() && 
        (req.user.role === 'staff' || req.user.role === 'admin' || req.user.role === 'superadmin')) {
      return next();
    }
    res.status(403).json({ message: 'Access denied - requires staff role or higher' });
  }

  // User management routes - Superadmin only
  app.get('/api/admin/users', ensureSuperAdmin, async (req: any, res: any) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.post('/api/admin/users', ensureSuperAdmin, async (req: any, res: any) => {
    try {
      const { username, email, password, role } = req.body;
      
      // Validate role
      if (!['staff', 'admin', 'superadmin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be staff, admin, or superadmin' });
      }
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      // Import hash function from auth module
      const { hashPassword } = await import('./auth');
      
      // Create the user with hashed password
      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role
      });
      
      // Remove password before sending response
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  app.delete("/api/admin/users/:userId", ensureSuperAdmin, async (req: any, res: any) => {
    const userId = parseInt(req.params.userId, 10);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    if (req.user.id === userId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    try {
      const deleted = await storage.deleteUser(userId);
      if (deleted) {
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/users/:userId", ensureSuperAdmin, async (req: any, res: any) => {
    const userId = parseInt(req.params.userId, 10);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      // Extract updateable fields from request body
      const { username, email, role } = req.body;
      
      // Validate that at least one field is provided
      if (!username && !email && !role) {
        return res.status(400).json({ message: "At least one field must be provided for update" });
      }
      
      // Build update object with only provided fields
      const updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (updatedUser) {
        // Remove password from response
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Property routes - Public
  app.get("/api/properties", async (req, res) => {
    try {
      console.log("Fetching properties with filters...");
      
      // Extract filter parameters from query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      const status = req.query.status as string;
      const category = req.query.category as string;
      const propertyType = req.query.propertyType as string;
      const subType = req.query.subType as string;
      const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined;
      const minArea = req.query.minArea ? parseInt(req.query.minArea as string) : undefined;
      const maxArea = req.query.maxArea ? parseInt(req.query.maxArea as string) : undefined;
      const bedrooms = req.query.bedrooms ? parseInt(req.query.bedrooms as string) : undefined;
      const bathrooms = req.query.bathrooms ? parseInt(req.query.bathrooms as string) : undefined;
      const furnishedStatus = req.query.furnishedStatus as string;
      const parking = req.query.parking as string;
      const facing = req.query.facing as string;
      const search = req.query.search as string;
      
      // Build comprehensive filters object with proper type assertions
      const filters = {
        page,
        limit,
        status: status as "sale" | "rent" | undefined,
        category: category as "residential" | "commercial" | undefined,
        propertyType: propertyType as "apartment" | "independent-house" | "villa" | "farm-house" | "shop" | "basement" | undefined,
        subType: subType as "1rk" | "1bhk" | "2bhk" | "3bhk" | "4bhk" | "plot" | "other" | undefined,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        bedrooms,
        bathrooms,
        furnishedStatus: furnishedStatus as "furnished" | "semi-furnished" | "unfurnished" | undefined,
        parking: parking as "car" | "two-wheeler" | "both" | "none" | undefined,
        facing: facing as "east" | "west" | "north" | "south" | "road" | "park" | "greenery" | undefined,
        search
      };
      
      console.log("Using enhanced filters:", filters);
      
      // Fetch properties with comprehensive filtering
      const { properties, total } = await storage.getPropertiesWithPagination(filters);
      console.log(`Found ${properties.length} properties out of ${total} total.`);
      
      // Calculate total pages
      const totalPages = Math.ceil(total / limit);
      
      res.json({
        properties,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });
  
  // Get featured properties for home page
  app.get("/api/featured-properties", async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      
      const { properties } = await storage.getPropertiesWithPagination({ 
        isActive: true,
        limit,
        page: 1
      });
      
      res.json(properties);
    } catch (error) {
      console.error("Error fetching featured properties:", error);
      res.status(500).json({ error: "Failed to fetch featured properties" });
    }
  });

  app.get("/api/properties/:slug", async (req, res, next) => {
    try {
      const property = await storage.getPropertyBySlug(req.params.slug);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      next(error);
    }
  });
  
  // Search for nearby facilities based on property location
  app.get("/api/properties/:id/nearby-facilities", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const { radius = '1', facilityType } = req.query;
      const searchRadius = parseFloat(radius as string) || 1; // Default to 1 km radius
      const searchRadiusMeters = searchRadius * 1000; // Convert km to meters for comparison
      
      const facilities = await storage.getNearbyFacilities(id);
      
      // Filter by radius (using distanceValue in meters)
      const filteredByRadius = facilities.filter(facility => {
        // If the facility has a distanceValue field, use it for filtering
        // Otherwise fall back to parsed distance field
        if (facility.distanceValue !== undefined && facility.distanceValue !== null) {
          return facility.distanceValue <= searchRadiusMeters;
        } else if (typeof facility.distance === 'string') {
          // Try to extract numeric value from distance string (e.g., "2.5 km" -> 2.5)
          const distanceMatch = facility.distance.match(/^(\d+(\.\d+)?)/);
          if (distanceMatch) {
            const distanceValue = parseFloat(distanceMatch[1]);
            // Assume distance is in km if not specified
            return distanceValue <= searchRadius;
          }
        }
        return false;
      });
      
      // Filter by facility type if provided
      const result = facilityType
        ? filteredByRadius.filter(f => f.facilityType === facilityType)
        : filteredByRadius;
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Inquiry submission
  app.post("/api/inquiries", async (req, res, next) => {
    try {
      console.log('📝 Inquiry submission started');
      console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
      console.log('📋 Content-Type:', req.headers['content-type']);
      
      console.log('🔍 Validating inquiry data...');
      console.log('insertInquirySchema exists:', !!insertInquirySchema);
      console.log('About to parse request body...');
      
      const validatedData = insertInquirySchema.parse(req.body);
      console.log('✅ Inquiry data validated:', validatedData);
      
      console.log('💾 Creating inquiry in database...');
      console.log('🔍 Checking storage object...');
      console.log('Storage object exists:', !!storage);
      console.log('createInquiry method exists:', typeof storage.createInquiry);
      console.log('Storage object type:', typeof storage);
      console.log('Storage object constructor:', storage.constructor.name);
      
      const inquiry = await storage.createInquiry(validatedData);
      console.log('✅ Inquiry created with ID:', inquiry.id);
      
      console.log('📧 Preparing email notification...');
      // Fetch property details if propertyId is provided
      let property = null;
      if (inquiry.propertyId) {
        console.log('🏠 Fetching property details for ID:', inquiry.propertyId);
        try {
          property = await storage.getPropertyById(inquiry.propertyId);
          console.log('✅ Property details fetched:', property?.title || 'No title');
        } catch (propError) {
          console.warn('⚠️  Failed to fetch property details:', propError);
        }
      }
      
      // Send email notification with property details
      await sendInquiryNotification(inquiry, property);
      console.log('✅ Email notification processed');
      
      const response = inquiry;
      console.log('✅ Inquiry submission completed:', response);
      res.status(201).json(response);
    } catch (error) {
      console.error('❌ Inquiry submission error:', error);
      
      // Check if it's a validation error
      if (error instanceof Error && (error as any).name === 'ZodError') {
        console.error('❌ Validation errors:', (error as any).issues);
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: (error as any).issues 
        });
      }
      
      next(error);
    }
  });

  // Property type lookup
  app.get("/api/property-types", async (req, res) => {
    res.json({
      propertyTypes: ["apartment", "independent-house", "villa", "farm-house", "shop", "basement"],
      propertyCategories: ["residential", "commercial"],
      status: ["sale", "rent"],
      subTypes: ["1rk", "1bhk", "2bhk", "3bhk", "4bhk", "plot", "other"],
      areaUnits: ["sq_ft", "sq_mt", "sq_yd"],
      furnishedStatus: ["furnished", "semi-furnished", "unfurnished"],
      facingOptions: ["east", "west", "north", "south", "road", "park", "greenery"],
      parkingOptions: ["car", "two-wheeler", "both", "none"],
      facilityTypes: ["school", "hospital", "market", "park", "metro", "bus-stop", "bank", "atm", "restaurant", "gym", "temple", "mall", "gas-station", "other"]
    });
  });

  // Admin Dashboard API - Protected

  app.get("/api/admin/dashboard", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // Admin Property Management
  app.get("/api/admin/properties", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/properties/:id", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const property = await storage.getPropertyById(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/properties", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      // Convert frontend underscore format to backend hyphen format for area units
      if (req.body.areaUnit) {
        const areaUnitMap: { [key: string]: string } = {
          'sq_ft': 'sq-ft',
          'sq_mt': 'sq-mt', 
          'sq_yd': 'sq-yd'
        };
        req.body.areaUnit = areaUnitMap[req.body.areaUnit] || req.body.areaUnit;
      }
      
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/properties/:id", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Convert frontend underscore format to backend hyphen format for area units
      if (req.body.areaUnit) {
        const areaUnitMap: { [key: string]: string } = {
          'sq_ft': 'sq-ft',
          'sq_mt': 'sq-mt', 
          'sq_yd': 'sq-yd'
        };
        req.body.areaUnit = areaUnitMap[req.body.areaUnit] || req.body.areaUnit;
      }
      
      // Validate and filter the request body using the same schema as POST
      // Use partial() to allow partial updates (not all fields required)
      const validatedData = insertPropertySchema.partial().parse(req.body);
      
      const property = await storage.updateProperty(id, validatedData);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/properties/:id", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // First, get all media to delete from Cloudinary
      const media = await storage.getPropertyMedia(id);
      
      // Delete property from database (which will cascade delete related records)
      const deleted = await storage.deleteProperty(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Delete all media files from Cloudinary
      for (const item of media) {
        try {
          const resourceType = item.mediaType === 'video' ? 'video' : 'image';
          await deleteFromCloudinary(item.cloudinaryId, resourceType);
        } catch (err) {
          console.error(`Failed to delete ${item.cloudinaryId} from Cloudinary:`, err);
        }
      }
      
      res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Property Media Management - simplified approach using unsigned upload
  app.post("/api/admin/media/upload", ensureAuthenticated, checkCloudinaryConfig, async (req: any, res: any) => {
    try {
      console.log("📨 Media upload request received");
      console.log("📋 Request body keys:", Object.keys(req.body));
      console.log("📋 Request body:", JSON.stringify(req.body, null, 2));
      console.log("📋 Content-Type:", req.headers['content-type']);
      
      if (!req.body.fileData) {
        console.log("❌ No fileData found in request body");
        return res.status(400).json({ error: "No file data provided" });
      }

      const { fileData, fileName, propertyId } = req.body;
      
      console.log(`📤 Uploading file: ${fileName} for property ${propertyId}`);
      console.log(`📊 File data length: ${fileData ? fileData.length : 'undefined'} characters`);
      
      const uploadResponse = await cloudinary.uploader.upload(fileData, {
        folder: "south-delhi-real-estate",
        public_id: `property-${propertyId}-${Date.now()}`,
        resource_type: "auto"
      });

      console.log('✅ Cloudinary upload successful:', uploadResponse.public_id);

      // Only save to database if this is for an existing property (not "temp")
      let newMedia = null;
      if (propertyId !== 'temp' && !isNaN(parseInt(propertyId))) {
        const mediaData = {
          propertyId: parseInt(propertyId),
          mediaType: uploadResponse.resource_type === 'video' ? 'video' as const : 'image' as const,
          cloudinaryId: uploadResponse.public_id,
          cloudinaryUrl: uploadResponse.secure_url,
          isFeatured: false,
          orderIndex: 0
        };

        newMedia = await storage.createPropertyMedia(mediaData);
      }
      
      res.json({
        success: true,
        media: newMedia,
        cloudinaryId: uploadResponse.public_id,
        cloudinaryUrl: uploadResponse.secure_url,
        mediaType: uploadResponse.resource_type === 'video' ? 'video' : 'image'
      });

    } catch (error) {
      console.error('❌ Media upload error:', error);
      res.status(500).json({ 
        error: "Failed to upload media",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Multiple file upload endpoint
  app.post("/api/admin/media/upload-multiple", ensureAuthenticated, checkCloudinaryConfig, upload.array('files', 10), (req: any, res: any) => {
    try {
      const uploadedFiles = req.files as CloudinaryFile[];
      
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const validFiles = uploadedFiles.filter((file: CloudinaryFile) => file.cloudinaryId && file.cloudinaryUrl);

      res.json({
        success: true,
        message: `${validFiles.length} files uploaded successfully`,
        files: validFiles.map((file: CloudinaryFile) => ({
          cloudinaryId: file.cloudinaryId,
          cloudinaryUrl: file.cloudinaryUrl,
          originalName: file.originalname
        }))
      });

    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ 
        error: "Failed to upload files",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/admin/properties/:propertyId/media", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      console.log('📤 Individual media upload started for property:', req.params.propertyId);
      console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
      
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        console.log('❌ Invalid property ID:', req.params.propertyId);
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const mediaData = {
        ...req.body,
        propertyId
      };
      
      console.log('💾 Creating individual media with data:', mediaData);
      const media = await storage.createPropertyMedia(mediaData);
      console.log('✅ Created individual media with ID:', media.id);
      
      const response = media;
      console.log('✅ Individual media upload completed:', response);
      res.status(201).json(response);
    } catch (error) {
      console.error('❌ Individual media upload error:', error);
      next(error);
    }
  });
  
  // Add multiple media files at once to a property
  app.post("/api/admin/properties/:propertyId/media/batch", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      console.log('📤 Media batch upload started for property:', req.params.propertyId);
      console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
      
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        console.log('❌ Invalid property ID:', req.params.propertyId);
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      // Validate that the request body contains an array of media items
      if (!Array.isArray(req.body)) {
        console.log('❌ Request body is not an array:', typeof req.body);
        return res.status(400).json({ message: "Expected an array of media items" });
      }
      
      const results = [];
      const errors = [];
      
      // Process each media item
      for (let i = 0; i < req.body.length; i++) {
        const mediaItem = req.body[i];
        console.log(`📸 Processing media item ${i + 1}/${req.body.length}:`, mediaItem);
        
        try {
          // Add property ID to each item
          const mediaData = {
            ...mediaItem,
            propertyId,
            // If orderIndex is not provided, use the array index
            orderIndex: mediaItem.orderIndex !== undefined ? mediaItem.orderIndex : i
          };
          
          console.log(`💾 Creating media with data:`, mediaData);
          const media = await storage.createPropertyMedia(mediaData);
          console.log(`✅ Created media with ID:`, media.id);
          results.push(media);
        } catch (error) {
          console.error(`❌ Error creating media item ${i}:`, error);
          errors.push({ 
            index: i, 
            error: error instanceof Error ? error.message : "Unknown error",
            item: mediaItem
          });
        }
      }
      
      const response = {
        success: true,
        total: req.body.length,
        created: results.length,
        failed: errors.length,
        media: results,
        errors: errors.length > 0 ? errors : undefined
      };
      
      console.log('✅ Media batch upload completed:', response);
      res.status(201).json(response);
    } catch (error) {
      console.error('❌ Media batch upload error:', error);
      next(error);
    }
  });

  app.delete("/api/admin/media/:id", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Get media details first
      const media = await storage.getPropertyMedia(id);
      const mediaItem = media.find(item => item.id === id);
      
      if (!mediaItem) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      // Delete from database
      const deleted = await storage.deletePropertyMedia(id);
      
      if (deleted) {
        // Delete from Cloudinary
        try {
          const resourceType = mediaItem.mediaType === 'video' ? 'video' : 'image';
          await deleteFromCloudinary(mediaItem.cloudinaryId, resourceType);
        } catch (cloudinaryErr) {
          console.error('Error deleting from Cloudinary:', cloudinaryErr);
          // Still return success since DB record is deleted
        }
        
        res.json({ message: "Media deleted successfully" });
      } else {
        res.status(404).json({ message: "Media not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/properties/:propertyId/media/:id/featured", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const id = parseInt(req.params.id);
      const propertyId = parseInt(req.params.propertyId);
      
      if (isNaN(id) || isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const updated = await storage.setFeaturedMedia(id, propertyId);
      
      if (updated) {
        res.json({ message: "Featured media updated successfully" });
      } else {
        res.status(404).json({ message: "Media not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Nearby Facilities
  app.post("/api/admin/properties/:propertyId/facilities", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      // Get the property to check its coordinates
      const property = await storage.getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      let facilityData = {
        ...req.body,
        propertyId
      };
      
      // Calculate distanceValue in meters if not provided
      if (!facilityData.distanceValue && facilityData.distance) {
        // Try to extract numeric value from distance string (e.g., "2.5 km" -> 2.5)
        const distanceMatch = facilityData.distance.match(/^(\d+(\.\d+)?)/);
        if (distanceMatch) {
          const distanceNumeric = parseFloat(distanceMatch[1]);
          
          // Check if it contains "km" or assume kilometers
          if (facilityData.distance.toLowerCase().includes("km")) {
            facilityData.distanceValue = Math.round(distanceNumeric * 1000); // km to meters
          } else if (facilityData.distance.toLowerCase().includes("m")) {
            facilityData.distanceValue = Math.round(distanceNumeric); // already in meters
          } else {
            // Default to kilometers
            facilityData.distanceValue = Math.round(distanceNumeric * 1000);
          }
        }
      }
      
      // If we have lat/lng for both the property and facility, we can calculate the distance
      if (
        property.latitude && property.longitude && 
        facilityData.latitude && facilityData.longitude &&
        !facilityData.distanceValue
      ) {
        try {
          // Calculate distance using Haversine formula
          const R = 6371e3; // Earth's radius in meters
          const φ1 = parseFloat(property.latitude) * Math.PI/180;
          const φ2 = parseFloat(facilityData.latitude) * Math.PI/180;
          const Δφ = (parseFloat(facilityData.latitude) - parseFloat(property.latitude)) * Math.PI/180;
          const Δλ = (parseFloat(facilityData.longitude) - parseFloat(property.longitude)) * Math.PI/180;
          
          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          
          const distanceInMeters = Math.round(R * c);
          facilityData.distanceValue = distanceInMeters;
          
          // If no distance text was provided, also generate that
          if (!facilityData.distance) {
            if (distanceInMeters < 1000) {
              facilityData.distance = `${distanceInMeters} m`;
            } else {
              facilityData.distance = `${(distanceInMeters / 1000).toFixed(1)} km`;
            }
          }
        } catch (error) {
          console.error("Error calculating distance:", error);
          // Continue without calculated distance
        }
      }
      
      const validatedData = insertNearbyFacilitySchema.parse(facilityData);
      const facility = await storage.createNearbyFacility(validatedData);
      res.status(201).json(facility);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/facilities/:id", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const deleted = await storage.deleteNearbyFacility(id);
      
      if (deleted) {
        res.json({ message: "Facility deleted successfully" });
      } else {
        res.status(404).json({ message: "Facility not found" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Inquiry Management
  app.get("/api/admin/inquiries", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const filters: any = {};
      
      if (req.query.propertyId) {
        filters.propertyId = parseInt(req.query.propertyId as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status;
      }
      
      const inquiries = await storage.getInquiries(filters);
      res.json(inquiries);
    } catch (error) {
      next(error);
    }
  });

  // Temporary debugging endpoint to see all inquiry IDs (public)
  app.get("/api/debug/inquiry-ids", async (req: any, res: any, next: any) => {
    try {
      console.log('🔍 Debug endpoint called - fetching all inquiry IDs');
      const inquiries = await storage.getInquiries();
      const inquiryIds = inquiries.map(inquiry => ({
        id: inquiry.id,
        name: inquiry.name,
        email: inquiry.email,
        createdAt: inquiry.createdAt
      }));
      console.log('🔍 Found inquiry IDs:', inquiryIds.map(i => i.id));
      res.json(inquiryIds);
    } catch (error) {
      console.error('🔍 Error in debug endpoint:', error);
      next(error);
    }
  });

  app.put("/api/admin/inquiries/:id", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      if (!req.body.status || !['new', 'contacted', 'resolved'].includes(req.body.status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const inquiry = await storage.updateInquiryStatus(id, req.body.status);
      
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      
      res.json(inquiry);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/inquiries/:id", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      console.log(`🗑️ DELETE /api/admin/inquiries/:id route called`);
      console.log(`📦 Request params:`, req.params);
      console.log(`📦 Raw ID parameter:`, req.params.id);
      
      const id = parseInt(req.params.id);
      console.log(`🔢 Parsed ID:`, id);
      
      if (isNaN(id)) {
        console.log(`❌ Invalid ID - not a number: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      console.log(`🗑️ Calling storage.deleteInquiry(${id})`);
      const deleted = await storage.deleteInquiry(id);
      console.log(`🗑️ storage.deleteInquiry(${id}) returned:`, deleted);
      
      if (deleted) {
        console.log(`✅ Inquiry ${id} deleted successfully`);
        res.json({ message: "Inquiry deleted successfully" });
      } else {
        console.log(`❌ Inquiry ${id} not found or could not be deleted`);
        res.status(404).json({ message: "Inquiry not found" });
      }
    } catch (error) {
      console.error(`❌ Error in DELETE /api/admin/inquiries/:id:`, error);
      next(error);
    }
  });

  // Email Testing Routes - Admin only
  app.get("/api/admin/email/test-config", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      console.log('🧪 Testing email configuration...');
      const result = await testEmailConfiguration();
      res.json(result);
    } catch (error) {
      console.error('❌ Email config test error:', error);
      next(error);
    }
  });

  app.post("/api/admin/email/send-test", ensureAuthenticated, async (req: any, res: any, next: any) => {
    try {
      console.log('📧 Sending test email...');
      const result = await sendTestEmail();
      res.json(result);
    } catch (error) {
      console.error('❌ Test email send error:', error);
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
