import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createReviewsDto } from '../../dto/reviews.dto';

import { Reviews } from '@/schemas/reviews.scheme';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Reviews.name) private readonly ReviewsModel: Model<Reviews>,
  ) {}

  async writeReview(reviewDto: createReviewsDto) {
    const newReview = new this.ReviewsModel(reviewDto);
    return await newReview.save();
  }

  async getReview(token: string) {
    return this.ReviewsModel.find({ product_token: token });
  }

  async deleteReview(id: string, token: string) {
    return await this.ReviewsModel.deleteOne({ _id: new ObjectId(id) });
  }
}
