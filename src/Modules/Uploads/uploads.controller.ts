import { Body, Controller, forwardRef, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { MailingDto } from '@/dto/mailing.dto';
import { AuthGuard } from '../Auth/auth.guard';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService) {}

  @UseGuards(AuthGuard)
  @Get('clean/:token')
  async cleanUploads(@Param('token') product_token: string) {

    if(!product_token) return { success: false };
    
    const success = await this.uploadsService.cleanUploads(product_token);

    return { success: success }
  }
}
