import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reviews, ReviewsSchema } from '@/schemas/reviews.scheme';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reviews.name, schema: ReviewsSchema }]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
