import {
    inquiries,
    nearbyFacilities,
    properties,
    propertyMedia,
    users,
    type Inquiry,
    type InsertInquiry,
    type InsertNearbyFacility,
    type InsertProperty,
    type InsertPropertyMedia,
    type InsertUser,
    type NearbyFacility,
    type Property,
    type PropertyMedia,
    type PropertyWithRelations,
    type User
} from "../shared/schema";

import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import session from "express-session";
import memorystore from "memorystore";
import { db } from "./db";

// Create memory store constructor
const MemoryStore = memorystore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  findUserById(id: number): Promise<User | undefined>;
  findUserByUsername(username: string): Promise<User | undefined>;
  findUserByEmail(email: string): Promise<User | undefined>;
  findUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGoogleUser(userData: { googleId: string; username: string; email: string; role: string }): Promise<User>;
  linkGoogleAccount(userId: number, googleId: string): Promise<void>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Property operations
  getProperties(filters?: Partial<Property>): Promise<PropertyWithRelations[]>;
  
  getPropertiesWithPagination(filters?: Partial<Property> & {
    page?: number;
    limit?: number;
    // Additional filter options - allowing "all" as valid option
    status?: string | "all";
    category?: string | "all";
    propertyType?: string | "all";
    subType?: string | "all";
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    bedrooms?: number;
    bathrooms?: number;
    furnishedStatus?: string | "all";
    parking?: string | "all";
    facing?: string | "all";
    search?: string;
  }): Promise<{ properties: PropertyWithRelations[]; total: number; }>;
  getPropertyById(id: number): Promise<PropertyWithRelations | undefined>;
  getPropertyBySlug(slug: string): Promise<PropertyWithRelations | undefined>;
  createProperty(property: InsertProperty): Promise<PropertyWithRelations>;
  updateProperty(id: number, property: Partial<Property>): Promise<boolean>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Property media operations
  getPropertyMedia(propertyId: number): Promise<PropertyMedia[]>;
  createPropertyMedia(media: InsertPropertyMedia): Promise<PropertyMedia>;
  deletePropertyMedia(id: number): Promise<boolean>;
  setFeaturedMedia(id: number, propertyId: number): Promise<boolean>;
  
  // Facility operations
  getNearbyFacilities(propertyId: number): Promise<NearbyFacility[]>;
  createNearbyFacility(facility: InsertNearbyFacility): Promise<NearbyFacility>;
  deleteNearbyFacility(id: number): Promise<boolean>;
  
  // Inquiry operations
  getInquiries(filters?: Partial<Inquiry>): Promise<Inquiry[]>;
  getInquiryById(id: number): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiryStatus(id: number, status: 'new' | 'contacted' | 'resolved'): Promise<Inquiry | null>;
  deleteInquiry(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalProperties: number;
    propertiesForSale: number;
    propertiesForRent: number;
    newInquiries: number;
  }>;
  
  // Session store for auth
  sessionStore: session.Store;

  // Add this method to the storage object in the export section
  getUsers: () => Promise<Omit<typeof users.$inferSelect, "password">[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async findUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Partial<typeof users.$inferInsert>): Promise<typeof users.$inferSelect> {
    const insertUser = {
      email: userData.email!,
      username: userData.username!,
      password: userData.password!,
      role: userData.role || 'admin'
    };
    const result = await db.insert(users).values(insertUser);
    const insertId = result[0].insertId;
    const [user] = await db.select().from(users).where(eq(users.id, Number(insertId)));
    return user;
  }

  async createGoogleUser(userData: { googleId: string; username: string; email: string; role: string }): Promise<User> {
    const insertUser = {
      email: userData.email,
      username: userData.username,
      password: '',
      role: userData.role,
      googleId: userData.googleId
    };
    const result = await db.insert(users).values(insertUser);
    const insertId = result[0].insertId;
    const [user] = await db.select().from(users).where(eq(users.id, Number(insertId)));
    return user;
  }

  async linkGoogleAccount(userId: number, googleId: string): Promise<void> {
    await db.update(users).set({ googleId }).where(eq(users.id, userId));
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // First check if the user exists
      const existingUser = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      if (existingUser.length === 0) {
        return false; // User doesn't exist
      }
      
      // Delete the user
      const result = await db.delete(users).where(eq(users.id, id));
      
      // Check if the deletion was successful by verifying the user no longer exists
      const checkUser = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      return checkUser.length === 0; // Return true if user was deleted
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Property operations
  async getProperties(filters?: Partial<Property>): Promise<PropertyWithRelations[]> {
    let query = db.select({
      id: properties.id,
      title: properties.title,
      slug: properties.slug,
      description: properties.description,
      status: properties.status,
      category: properties.category,
      propertyType: properties.propertyType,
      subType: properties.subType,
      portion: properties.portion,
      area: properties.area,
      areaUnit: properties.areaUnit,
      furnishedStatus: properties.furnishedStatus,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      balconies: properties.balconies,
      facing: properties.facing,
      parking: properties.parking,
      age: properties.age,
      price: properties.price,
      priceNegotiable: properties.priceNegotiable,
      brokerage: properties.brokerage,
      contactDetails: properties.contactDetails,
      latitude: properties.latitude,
      longitude: properties.longitude,
      isActive: properties.isActive,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
    }).from(properties);

    if (filters) {
      const conditions = [];
      
      if (filters.isActive !== undefined) {
        conditions.push(eq(properties.isActive, filters.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
    }
    
    // Order by created date descending
    query = query.orderBy(desc(properties.createdAt)) as typeof query;
    
    const propertyList = await query as Property[];
    
    // Fetch media for all properties
    const propertiesWithMedia: PropertyWithRelations[] = [];
    
    for (const property of propertyList) {
      const propertyMediaItems = await db.select().from(propertyMedia)
        .where(eq(propertyMedia.propertyId, property.id))
        .orderBy(propertyMedia.orderIndex);
      
      propertiesWithMedia.push({
        ...property,
        media: propertyMediaItems
      });
    }
    
    return propertiesWithMedia;
  }
  
  async getPropertiesWithPagination(filters?: Partial<Property> & {
    page?: number;
    limit?: number;
    // Additional filter options
    status?: string | "all";
    category?: string | "all";
    propertyType?: string | "all";
    subType?: string | "all";
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    bedrooms?: number;
    bathrooms?: number;
    furnishedStatus?: string | "all";
    parking?: string | "all";
    facing?: string | "all";
    search?: string;
  }): Promise<{ properties: PropertyWithRelations[]; total: number; }> {
    let query = db.select({
      id: properties.id,
      title: properties.title,
      slug: properties.slug,
      description: properties.description,
      status: properties.status,
      category: properties.category,
      propertyType: properties.propertyType,
      subType: properties.subType,
      portion: properties.portion,
      area: properties.area,
      areaUnit: properties.areaUnit,
      furnishedStatus: properties.furnishedStatus,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      balconies: properties.balconies,
      facing: properties.facing,
      parking: properties.parking,
      age: properties.age,
      price: properties.price,
      priceNegotiable: properties.priceNegotiable,
      brokerage: properties.brokerage,
      contactDetails: properties.contactDetails,
      latitude: properties.latitude,
      longitude: properties.longitude,
      isActive: properties.isActive,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
    }).from(properties);

    let countQuery = db.select({ count: sql`count(*)` }).from(properties);

    console.log("Enhanced pagination filters received:", filters);
    
    const conditions = [];
    
    // Always filter by active status
    conditions.push(eq(properties.isActive, true));
    
    // Status filter (sale/rent)
    if (filters?.status && (filters.status as any) !== 'all') {
      if (filters.status === 'sale' || filters.status === 'rent') {
        conditions.push(eq(properties.status, filters.status));
      }
    }
    
    // Category filter (residential/commercial)
    if (filters?.category && (filters.category as any) !== 'all') {
      if (filters.category === 'residential' || filters.category === 'commercial') {
        conditions.push(eq(properties.category, filters.category));
      }
    }
    
    // Property type filter
    if (filters?.propertyType && (filters.propertyType as any) !== 'all') {
      if (['apartment', 'independent-house', 'villa', 'farm-house', 'shop', 'basement'].includes(filters.propertyType)) {
        conditions.push(eq(properties.propertyType, filters.propertyType as any));
      }
    }
    
    // Sub type filter
    if (filters?.subType && (filters.subType as any) !== 'all') {
      if (['1rk', '1bhk', '2bhk', '3bhk', '4bhk', 'plot', 'other'].includes(filters.subType)) {
        conditions.push(eq(properties.subType, filters.subType as any));
      }
    }
    
    // Price range filters
    if (filters?.minPrice && filters.minPrice > 0) {
      conditions.push(gte(properties.price, filters.minPrice));
    }
    if (filters?.maxPrice && filters.maxPrice > 0) {
      conditions.push(lte(properties.price, filters.maxPrice));
    }
    
    // Area range filters
    if (filters?.minArea && filters.minArea > 0) {
      conditions.push(gte(properties.area, filters.minArea));
    }
    if (filters?.maxArea && filters.maxArea > 0) {
      conditions.push(lte(properties.area, filters.maxArea));
    }
    
    // Bedrooms filter
    if (filters?.bedrooms && filters.bedrooms > 0) {
      conditions.push(eq(properties.bedrooms, filters.bedrooms));
    }
    
    // Bathrooms filter
    if (filters?.bathrooms && filters.bathrooms > 0) {
      conditions.push(eq(properties.bathrooms, filters.bathrooms));
    }
    
    // Furnished status filter
    if (filters?.furnishedStatus && (filters.furnishedStatus as any) !== 'all') {
      if (['furnished', 'semi-furnished', 'unfurnished'].includes(filters.furnishedStatus)) {
        conditions.push(eq(properties.furnishedStatus, filters.furnishedStatus as any));
      }
    }
    
    // Parking filter
    if (filters?.parking && (filters.parking as any) !== 'all') {
      if (['car', 'two-wheeler', 'both', 'none'].includes(filters.parking)) {
        conditions.push(eq(properties.parking, filters.parking as any));
      }
    }
    
    // Facing filter
    if (filters?.facing && (filters.facing as any) !== 'all') {
      if (['east', 'west', 'north', 'south', 'road', 'park', 'greenery'].includes(filters.facing)) {
        conditions.push(eq(properties.facing, filters.facing as any));
      }
    }
    
    // Search filter (title, description)
    if (filters?.search && filters.search.trim()) {
      const searchTerm = `%${filters.search.trim()}%`;
      conditions.push(
        sql`(${properties.title} LIKE ${searchTerm} OR ${properties.description} LIKE ${searchTerm})`
      );
    }
    
    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
      countQuery = countQuery.where(and(...conditions)) as any;
    }
    
    // First get the total count
    const [countResult] = await countQuery;
    const total = Number(countResult.count);
    
    // Default sort by created date descending
    query = query.orderBy(desc(properties.createdAt)) as typeof query;
    
    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 9;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset) as typeof query;
    
    // Execute the paginated query
    const propertyList = await query as Property[];
    console.log(`Found ${propertyList.length} properties out of ${total} total after enhanced filtering`);
    
    // Fetch media for all properties
    const propertiesWithMedia: PropertyWithRelations[] = [];
    
    for (const property of propertyList) {
      const propertyMediaItems = await db.select().from(propertyMedia)
        .where(eq(propertyMedia.propertyId, property.id))
        .orderBy(propertyMedia.orderIndex);
      
      propertiesWithMedia.push({
        ...property,
        media: propertyMediaItems
      });
    }
    
    return {
      properties: propertiesWithMedia,
      total
    };
  }

  async getPropertyById(id: number): Promise<PropertyWithRelations | undefined> {
    const [property] = await db.select({
      id: properties.id,
      title: properties.title,
      slug: properties.slug,
      description: properties.description,
      status: properties.status,
      category: properties.category,
      propertyType: properties.propertyType,
      subType: properties.subType,
      portion: properties.portion,
      area: properties.area,
      areaUnit: properties.areaUnit,
      furnishedStatus: properties.furnishedStatus,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      balconies: properties.balconies,
      facing: properties.facing,
      parking: properties.parking,
      age: properties.age,
      price: properties.price,
      priceNegotiable: properties.priceNegotiable,
      brokerage: properties.brokerage,
      contactDetails: properties.contactDetails,
      latitude: properties.latitude,
      longitude: properties.longitude,
      isActive: properties.isActive,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
    }).from(properties).where(eq(properties.id, id));
    
    if (!property) return undefined;
    
    const propertyMediaItems = await db.select().from(propertyMedia).where(eq(propertyMedia.propertyId, id));
    const propertyFacilities = await db.select().from(nearbyFacilities).where(eq(nearbyFacilities.propertyId, id));
    
    return {
      ...property,
      media: propertyMediaItems,
      facilities: propertyFacilities
    };
  }

  async getPropertyBySlug(slug: string): Promise<PropertyWithRelations | undefined> {
    const [property] = await db.select({
      id: properties.id,
      title: properties.title,
      slug: properties.slug,
      description: properties.description,
      status: properties.status,
      category: properties.category,
      propertyType: properties.propertyType,
      subType: properties.subType,
      portion: properties.portion,
      area: properties.area,
      areaUnit: properties.areaUnit,
      furnishedStatus: properties.furnishedStatus,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      balconies: properties.balconies,
      facing: properties.facing,
      parking: properties.parking,
      age: properties.age,
      price: properties.price,
      priceNegotiable: properties.priceNegotiable,
      brokerage: properties.brokerage,
      contactDetails: properties.contactDetails,
      latitude: properties.latitude,
      longitude: properties.longitude,
      isActive: properties.isActive,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
    }).from(properties).where(eq(properties.slug, slug));
    
    if (!property) return undefined;
    
    const propertyMediaItems = await db.select().from(propertyMedia).where(eq(propertyMedia.propertyId, property.id));
    const propertyFacilities = await db.select().from(nearbyFacilities).where(eq(nearbyFacilities.propertyId, property.id));
    
    return {
      ...property,
      media: propertyMediaItems,
      facilities: propertyFacilities
    };
  }

  async createProperty(propertyData: InsertProperty): Promise<PropertyWithRelations> {
    // Insert the property data
    const result = await db.insert(properties).values(propertyData);
    const insertId = result[0].insertId;
    
    // Fetch the created property by ID
    const [newProperty] = await db.select({
      id: properties.id,
      title: properties.title,
      slug: properties.slug,
      description: properties.description,
      status: properties.status,
      category: properties.category,
      propertyType: properties.propertyType,
      subType: properties.subType,
      portion: properties.portion,
      area: properties.area,
      areaUnit: properties.areaUnit,
      furnishedStatus: properties.furnishedStatus,
      bedrooms: properties.bedrooms,
      bathrooms: properties.bathrooms,
      balconies: properties.balconies,
      facing: properties.facing,
      parking: properties.parking,
      age: properties.age,
      price: properties.price,
      priceNegotiable: properties.priceNegotiable,
      brokerage: properties.brokerage,
      contactDetails: properties.contactDetails,
      latitude: properties.latitude,
      longitude: properties.longitude,
      isActive: properties.isActive,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
    }).from(properties).where(eq(properties.id, Number(insertId)));
    
    if (!newProperty) {
      throw new Error("Failed to create property");
    }
    
    // Return property with media field (empty initially) to match PropertyWithRelations interface
    return {
      ...newProperty,
      media: [] // New properties start with no media
    };
  }

  async updateProperty(id: number, updates: Partial<InsertProperty>): Promise<boolean> {
    try {
      // First check if the property exists
      const existingProperty = await db.select({ 
        id: properties.id, 
        updatedAt: properties.updatedAt 
      })
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1);
      
      if (existingProperty.length === 0) {
        return false; // Property doesn't exist
      }
      
      const originalUpdatedAt = existingProperty[0].updatedAt;
      
      // Perform the update
      const result = await db.update(properties).set(updates).where(eq(properties.id, id));
      
      // Check if the update was successful by verifying the updatedAt timestamp changed
      // or by checking if the property still exists (for cases where updatedAt might not change)
      const updatedProperty = await db.select({ 
        id: properties.id, 
        updatedAt: properties.updatedAt 
      })
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1);
      
      if (updatedProperty.length === 0) {
        return false; // Property was somehow deleted during update
      }
      
      // Consider update successful if the property still exists
      // (updatedAt might not change if no actual field values changed)
      return true;
    } catch (error) {
      console.error('Error updating property:', error);
      return false;
    }
  }

  async deleteProperty(id: number): Promise<boolean> {
    try {
      // First check if the property exists
      const existingProperty = await db.select({ id: properties.id })
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1);
      
      if (existingProperty.length === 0) {
        return false; // Property doesn't exist
      }
      
      // Delete the property
      const result = await db.delete(properties).where(eq(properties.id, id));
      
      // Check if the deletion was successful by verifying the property no longer exists
      const checkProperty = await db.select({ id: properties.id })
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1);
      
      return checkProperty.length === 0; // Return true if property was deleted
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }

  // Property media operations
  async getPropertyMedia(propertyId: number): Promise<PropertyMedia[]> {
    return await db.select().from(propertyMedia)
      .where(eq(propertyMedia.propertyId, propertyId))
      .orderBy(propertyMedia.orderIndex);
  }

  async createPropertyMedia(mediaData: InsertPropertyMedia): Promise<PropertyMedia> {
    const result = await db.insert(propertyMedia).values(mediaData);
    const insertId = result[0].insertId;
    const [newMedia] = await db.select().from(propertyMedia).where(eq(propertyMedia.id, Number(insertId)));
    return newMedia;
  }

  async deletePropertyMedia(id: number): Promise<boolean> {
    try {
      // First check if the media exists
      const existingMedia = await db.select({ id: propertyMedia.id })
        .from(propertyMedia)
        .where(eq(propertyMedia.id, id))
        .limit(1);
      
      if (existingMedia.length === 0) {
        return false; // Media doesn't exist
      }
      
      // Delete the media
      const result = await db.delete(propertyMedia).where(eq(propertyMedia.id, id));
      
      // Check if the deletion was successful by verifying the media no longer exists
      const checkMedia = await db.select({ id: propertyMedia.id })
        .from(propertyMedia)
        .where(eq(propertyMedia.id, id))
        .limit(1);
      
      return checkMedia.length === 0; // Return true if media was deleted
    } catch (error) {
      console.error('Error deleting property media:', error);
      return false;
    }
  }

  async setFeaturedMedia(id: number, propertyId: number): Promise<boolean> {
    await db.update(propertyMedia).set({ isFeatured: false }).where(eq(propertyMedia.propertyId, propertyId));
    const result = await db.update(propertyMedia).set({ isFeatured: true }).where(eq(propertyMedia.id, id));
    return (result as any).affectedRows > 0;
  }

  // Facility operations
  async getNearbyFacilities(propertyId: number): Promise<NearbyFacility[]> {
    return await db.select().from(nearbyFacilities)
      .where(eq(nearbyFacilities.propertyId, propertyId));
  }

  async createNearbyFacility(facilityData: InsertNearbyFacility): Promise<NearbyFacility> {
    const result = await db.insert(nearbyFacilities).values(facilityData);
    const insertId = result[0].insertId;
    const [newFacility] = await db.select().from(nearbyFacilities).where(eq(nearbyFacilities.id, Number(insertId)));
    return newFacility;
  }

  async deleteNearbyFacility(id: number): Promise<boolean> {
    try {
      // First check if the facility exists
      const existingFacility = await db.select({ id: nearbyFacilities.id })
        .from(nearbyFacilities)
        .where(eq(nearbyFacilities.id, id))
        .limit(1);
      
      if (existingFacility.length === 0) {
        return false; // Facility doesn't exist
      }
      
      // Delete the facility
      const result = await db.delete(nearbyFacilities).where(eq(nearbyFacilities.id, id));
      
      // Check if the deletion was successful by verifying the facility no longer exists
      const checkFacility = await db.select({ id: nearbyFacilities.id })
        .from(nearbyFacilities)
        .where(eq(nearbyFacilities.id, id))
        .limit(1);
      
      return checkFacility.length === 0; // Return true if facility was deleted
    } catch (error) {
      console.error('Error deleting nearby facility:', error);
      return false;
    }
  }

  // Inquiry operations
  async getInquiries(filters?: Partial<Inquiry>): Promise<Inquiry[]> {
    try {
      // First, get all inquiries that match the filters
      let query = db.select().from(inquiries);
      
      if (filters) {
        const conditions = [];
        
        if (filters.propertyId) {
          conditions.push(eq(inquiries.propertyId, filters.propertyId));
        }
        
        if (filters.status) {
          conditions.push(eq(inquiries.status, filters.status));
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
      }
      
      // Execute the query as is, without creating a new one
      const inquiriesResult = await query.orderBy(desc(inquiries.createdAt)) as any as Inquiry[];
      console.log(`Found ${inquiriesResult.length} inquiries`);
      
      // Create a list of property IDs to fetch
      const propertyIds = inquiriesResult
        .filter(inquiry => inquiry.propertyId !== null && inquiry.propertyId !== undefined)
        .map(inquiry => inquiry.propertyId as number);
      
      console.log(`Need to fetch ${propertyIds.length} properties with IDs:`, propertyIds);
      
      // Fetch all needed properties in a single query if there are any
      let propertiesMap: Record<number, any> = {};
      
      if (propertyIds.length > 0) {
        // Explicitly select only existing columns, including 'portion'
        const propertiesResult = await db.select({
          id: properties.id,
          title: properties.title,
          slug: properties.slug,
          description: properties.description,
          status: properties.status,
          category: properties.category,
          propertyType: properties.propertyType,
          subType: properties.subType,
          portion: properties.portion,
          area: properties.area,
          areaUnit: properties.areaUnit,
          furnishedStatus: properties.furnishedStatus,
          bedrooms: properties.bedrooms,
          bathrooms: properties.bathrooms,
          balconies: properties.balconies,
          facing: properties.facing,
          parking: properties.parking,
          age: properties.age,
          price: properties.price,
          priceNegotiable: properties.priceNegotiable,
          brokerage: properties.brokerage,
          contactDetails: properties.contactDetails,
          latitude: properties.latitude,
          longitude: properties.longitude,
          isActive: properties.isActive,
          createdAt: properties.createdAt,
          updatedAt: properties.updatedAt,
        }).from(properties)
          .where(inArray(properties.id, propertyIds));
        
        console.log(`Fetched ${propertiesResult.length} properties:`, 
          propertiesResult.map(p => `ID: ${p.id}, Title: ${p.title}`));
        
        // Create a map of property ID to property object for quick lookup
        propertiesMap = propertiesResult.reduce((map, property) => {
          map[property.id] = property;
          return map;
        }, {} as Record<number, any>);
      }
      
      // Attach property data to each inquiry
      const enrichedInquiries = inquiriesResult.map(inquiry => {
        if (inquiry.propertyId && propertiesMap[inquiry.propertyId]) {
          const propertyData = propertiesMap[inquiry.propertyId];
          console.log(`Attaching property "${propertyData.title}" to inquiry #${inquiry.id}`);
          
          return {
            ...inquiry,
            property: propertyData
          };
        } else if (inquiry.propertyId) {
          console.log(`Warning: Property #${inquiry.propertyId} not found for inquiry #${inquiry.id}`);
        }
        
        return inquiry;
      });
      
      console.log(`Returning ${enrichedInquiries.length} inquiries with property data`);
      return enrichedInquiries;
    } catch (error) {
      console.error("Error fetching inquiries with properties:", error);
      throw error;
    }
  }

  async getInquiryById(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry;
  }

  async createInquiry(inquiryData: InsertInquiry): Promise<Inquiry> {
    console.log('====== createInquiry method called ======');
    console.log('Inquiry data received:', JSON.stringify(inquiryData, null, 2));
    
    try {
      console.log('Inserting inquiry into database...');
      const result = await db.insert(inquiries).values(inquiryData);
      console.log('Insert result:', result);
      
      // Get the ID of the inserted record
      const insertId = result[0].insertId;
      if (!insertId) {
        console.error('No insert ID returned after creation');
        throw new Error('Failed to create inquiry - no ID returned');
      }
      
      console.log('Fetching created inquiry with ID:', insertId);
      // Fetch the created inquiry
      const [newInquiry] = await db.select().from(inquiries).where(eq(inquiries.id, Number(insertId)));
      
      if (!newInquiry) {
        console.error('No inquiry found after creation with ID:', insertId);
        throw new Error('Failed to fetch created inquiry');
      }
      
      console.log('Created inquiry:', JSON.stringify(newInquiry, null, 2));
      console.log('====== createInquiry success ======');
      return newInquiry;
    } catch (error) {
      console.error('====== createInquiry error ======');
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('====== end error ======');
      throw error;
    }
  }

  async updateInquiryStatus(id: number, status: "new" | "contacted" | "resolved"): Promise<Inquiry | null> {
    try {
      console.log(`🔄 updateInquiryStatus called for ID: ${id}, status: ${status}`);
      
      // First check if the inquiry exists
      const existingInquiry = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
      
      if (existingInquiry.length === 0) {
        console.log(`❌ Inquiry ${id} does not exist`);
        return null; // Inquiry doesn't exist
      }
      
      console.log(`✅ Inquiry ${id} exists, updating status to ${status}...`);
      
      // Update the inquiry
      await db.update(inquiries).set({ status, updatedAt: new Date() }).where(eq(inquiries.id, id));
      
      // Fetch and return the updated inquiry
      const [updatedInquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
      
      console.log(`✅ Inquiry ${id} updated successfully:`, updatedInquiry);
      return updatedInquiry;
    } catch (error) {
      console.error(`❌ Error updating inquiry ${id}:`, error);
      return null;
    }
  }

  async deleteInquiry(id: number): Promise<boolean> {
    try {
      console.log(`🗑️ deleteInquiry called for ID: ${id}`);
      
      // First check if the inquiry exists
      console.log(`🔍 Checking if inquiry ${id} exists...`);
      const existingInquiry = await db.select({ id: inquiries.id })
        .from(inquiries)
        .where(eq(inquiries.id, id))
        .limit(1);
      
      console.log(`🔍 Query result for inquiry ${id}:`, existingInquiry);
      console.log(`🔍 Found ${existingInquiry.length} inquiries with ID ${id}`);
      
      if (existingInquiry.length === 0) {
        console.log(`❌ Inquiry ${id} does not exist in database`);
        return false; // Inquiry doesn't exist
      }
      
      console.log(`✅ Inquiry ${id} exists, proceeding with deletion...`);
      
      // Delete the inquiry
      const result = await db.delete(inquiries).where(eq(inquiries.id, id));
      console.log(`🗑️ Delete result for inquiry ${id}:`, result);
      
      // Check if the deletion was successful by verifying the inquiry no longer exists
      const checkInquiry = await db.select({ id: inquiries.id })
        .from(inquiries)
        .where(eq(inquiries.id, id))
        .limit(1);
      
      console.log(`🔍 Post-deletion check for inquiry ${id}:`, checkInquiry);
      const wasDeleted = checkInquiry.length === 0;
      console.log(`🗑️ Inquiry ${id} deletion successful: ${wasDeleted}`);
      
      return wasDeleted; // Return true if inquiry was deleted
    } catch (error) {
      console.error(`❌ Error deleting inquiry ${id}:`, error);
      return false;
    }
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalProperties: number;
    propertiesForSale: number;
    propertiesForRent: number;
    newInquiries: number;
  }> {
    const totalProperties = await db.select({ count: sql`count(*)` }).from(properties);
    const propertiesForSale = await db.select({ count: sql`count(*)` })
      .from(properties)
      .where(eq(properties.status, 'sale'));
    
    const propertiesForRent = await db.select({ count: sql`count(*)` })
      .from(properties)
      .where(eq(properties.status, 'rent'));
    
    const newInquiries = await db.select({ count: sql`count(*)` })
      .from(inquiries)
      .where(eq(inquiries.status, 'new'));
    
    return {
      totalProperties: Number(totalProperties[0].count),
      propertiesForSale: Number(propertiesForSale[0].count),
      propertiesForRent: Number(propertiesForRent[0].count),
      newInquiries: Number(newInquiries[0].count)
    };
  }

  // Add this method to the storage object in the export section
  async getUsers(): Promise<Omit<typeof users.$inferSelect, "password">[]> {
    // Exclude password field for security
    return await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
    }).from(users).orderBy(users.id);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      // First check if the user exists
      const existingUser = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      
      if (existingUser.length === 0) {
        return undefined; // User doesn't exist
      }
      
      // Update the user
      const result = await db.update(users).set(userData).where(eq(users.id, id));
      
      // Check if the update was successful by verifying the user still exists
      const updatedUser = await db.select().from(users).where(eq(users.id, id));
      
      if (updatedUser.length === 0) {
        return undefined; // User was somehow deleted during update
      }
      
      return updatedUser[0];
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }
}

// Switch to database storage for persistent data
export const storage = new DatabaseStorage();
