import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

@Injectable()
export class BucketService {
  private supabase;
  private bucket;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('PUBLIC_SUPABASE_URL') ?? '',
      this.configService.get<string>('PUBLIC_SUPABASE_PUBLISHABLE_KEY') ?? '',
    );
    this.bucket= configService.get<string>('BUCKET') ?? '';
  }

  async uploadAndConvert(file: Express.Multer.File) {
    let quality = 80;
    let compressedBuffer = await sharp(file.buffer)
      .jpeg({ quality })
      .toBuffer();

    while (compressedBuffer.length > 1 * 1024 * 1024 && quality > 30) {
      quality -= 10;

      compressedBuffer = await sharp(file.buffer)
        .jpeg({ quality })
        .toBuffer();
    }

    if (compressedBuffer.length > 1 * 1024 * 1024) {
      throw new BadRequestException(
        'Não foi possível reduzir a imagem para menos de 1MB',
      );
    }

    const base64 = compressedBuffer.toString('base64');

    const fileName = `${randomUUID()}.jpg`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(fileName, compressedBuffer, {
        contentType: 'image/jpeg',
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    return {
      url: data.publicUrl,
      sizeInKb: Math.round(compressedBuffer.length / 1024),
      base64,
    };
  }
}