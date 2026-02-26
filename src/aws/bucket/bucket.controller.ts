import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BucketService } from './bucket.service';

@Controller('upload')
export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1 * 1024 * 1024 }, // ✅ 1MB
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo obrigatório');
    }

    const result = await this.bucketService.uploadAndConvert(file);

    return {
      message: 'Upload realizado com sucesso',
      ...result,
    };
  }
}