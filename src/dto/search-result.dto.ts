import { Language } from '@/constants/common';
import { ProductType } from '@/constants/product';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class SearchResultDto {
  @ApiProperty()
  docs: Array<SearchProductResultDto>;

  @ApiProperty()
  totalDocs: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasPrevPage: boolean;

  @ApiProperty()
  hasNextPage: boolean;

  @ApiProperty()
  page: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  prevPage: number;

  @ApiProperty()
  nextPage: number;

  @ApiProperty()
  pagingCounter: number;

  @ApiProperty()
  meta: Object;
}

export class SearchProductResultDto {
  @ApiProperty()
  _id: ObjectId;

  @ApiProperty()
  product_created_at: Date;

  @ApiProperty()
  product_modified_at: Date;

  @ApiProperty({})
  product_token: string;

  @ApiProperty()
  product_title: string;

  @ApiProperty()
  product_type: ProductType;

  @ApiProperty()
  product_description: string;

  @ApiProperty()
  product_user_fullname: string;

  @ApiProperty()
  product_start_datetime: Date;

  @ApiProperty()
  product_language: Language;

  @ApiProperty()
  product_image: string;

  @ApiProperty()
  product_skills: Array<[string]>;

  @ApiProperty()
  product_students: number;

  @ApiProperty({ required: true })
  product_category: string;

  @ApiProperty()
  product_price: number;

  @ApiProperty()
  product_discounts: any[];
}
