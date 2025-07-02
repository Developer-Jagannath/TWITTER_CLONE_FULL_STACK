import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config';
import { BadRequestError } from '../errors/AppError';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class CloudinaryService {
  static async uploadImage(filePath: string, folder: string = 'tweets'): Promise<CloudinaryUploadResult> {
    try {
      if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
        throw new BadRequestError('Cloudinary configuration is missing');
      }

      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' },
          { width: 1200, height: 800, crop: 'limit' }
        ],
        eager: [
          { width: 800, height: 600, crop: 'limit', quality: 'auto' },
          { width: 400, height: 300, crop: 'limit', quality: 'auto' }
        ],
        eager_async: true,
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestError('Failed to upload image to Cloudinary');
    }
  }

  static async deleteImage(publicId: string): Promise<void> {
    try {
      if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
        throw new BadRequestError('Cloudinary configuration is missing');
      }

      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new BadRequestError('Failed to delete image from Cloudinary');
    }
  }

  static validateConfig(): boolean {
    return !!(config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret);
  }
} 