import { Injectable, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      if (!file) {
        throw new NotFoundException('File is required!');
      }
      if (!file.mimetype.startsWith('image/')) {
        throw new UnsupportedMediaTypeException(
          'Only image files are allowed!',
        );
      }

      cloudinary.uploader
        .upload_stream((error, result) => {
          if (error) return reject(error);
          resolve(result as any);
        })
        .end(file.buffer);
    });
  }
}
