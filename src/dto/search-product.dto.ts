import { Language } from '@/constants/common';
import { ProductType } from '@/constants/product';
import { ApiProperty } from '@nestjs/swagger';

export class searchProductDto {
  @ApiProperty({ required: true })
  sortBy: { field: string; order: 1 | -1 };

  @ApiProperty({ required: false, description: "['startDate', 'endDate']" })
  product_created_at: ['startDate', 'endDate'];

  @ApiProperty({ required: false, description: "['startDate', 'endDate']" })
  product_modified_at: ['startDate', 'endDate'];

  @ApiProperty({ required: false })
  product_title: string;

  @ApiProperty({ required: false })
  product_type: Array<ProductType>;

  @ApiProperty({ required: false })
  product_user_fullname: string;

  @ApiProperty({ required: false, description: "['startDate', 'endDate']" })
  product_start_datetime: ['startDate', 'endDate'];

  @ApiProperty({ required: false })
  product_language: Array<Language>;

  @ApiProperty({ required: false })
  product_skills: Array<string>;

  @ApiProperty({ required: false })
  product_category: Array<string>;

  @ApiProperty({ required: false, description: "['minPrice', 'maxPrace']" })
  product_price: ['minPrice', 'maxPrace'];

  @ApiProperty({ required: false })
  product_discounts: boolean;

  @ApiProperty({ required: false })
  product_students: number;
}
