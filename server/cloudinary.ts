import { v2 as cloudinary } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import { upload } from './multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware to check if cloudinary is configured
export function checkCloudinaryConfig(req: Request, res: Response, next: NextFunction) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(500).json({ message: 'Cloudinary is not configured' });
  }
  next();
}

// Function to delete files from Cloudinary
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

// Export cloudinary instance and upload middleware
export { cloudinary, upload };
