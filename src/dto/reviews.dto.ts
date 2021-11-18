import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class createReviewsDto {
  @ApiProperty({ default: ObjectId, required: true, readOnly: true })
  _id: ObjectId;

  @ApiProperty({ required: true })
  product_token: string;

  @ApiProperty({ required: true })
  user_token: string;

  @ApiProperty({ required: true, default: new Date() })
  review_created_at: Date;

  @ApiProperty({ required: true })
  review_fullname: string;

  @ApiProperty({ required: true })
  review_text: string;
}
