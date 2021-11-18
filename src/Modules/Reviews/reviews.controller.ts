import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { createReviewsDto } from '@/dto/reviews.dto';

import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post('write')
  @ApiBody({ type: createReviewsDto })
  async writeReview(@Body() reviewDto: createReviewsDto) {
    return await this.reviewsService.writeReview(reviewDto);
  }

  @Get('review')
  @ApiQuery({ name: 'token' })
  async getReview(@Query('token') token: string) {
    return await this.reviewsService.getReview(token);
  }

  @Delete('delete')
  @ApiQuery({ name: 'id' })
  async deleteReview(@Query('id') id: string, @Query('token') token: string) {
    return await this.reviewsService.deleteReview(id, token);
  }
}
