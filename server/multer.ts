import { v2 as cloudinary } from 'cloudinary';
import type { Multer } from 'multer';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary explicitly here to ensure it's loaded
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'south-delhi-realty',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
    resource_type: 'auto', // detects if it's image or video
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }
    ],
    use_filename: true,
    unique_filename: true,
  },
}) as unknown as multer.StorageEngine;

// Multer middleware configuration
const upload: Multer = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export { upload };

