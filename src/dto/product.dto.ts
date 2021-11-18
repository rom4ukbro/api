import { Language } from '@/constants/common';
import { DiscountsType, ProductModuleType, ProductType } from '@/constants/product';
import { GetUID7 } from '@/extensions/cryptolib.utils';
import { User } from '@/schemas/user.scheme';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class CreateProductDto {

  //---- PRODUCT GENERAL INFO

  @ApiProperty({ required: true})
  product_title: string;

  @ApiProperty()
  product_description: string;

  @ApiProperty({ required: true })
  product_language: Language;

  @ApiProperty()
  product_image_card_file: string;

  @ApiProperty()
  product_image_cover_file: string;

  @ApiProperty()
  product_youtube_id: string;

  @ApiProperty()
  product_email: string;

  @ApiProperty({ required: true, default: false })
  product_is_published: boolean;

  //---- PRODUCT TYPE
  @ApiProperty({ required: true })
  product_type: ProductType;

  @ApiProperty({ required: true, default: 0 })
  product_store: number;

  //---- PRODUCT PAYMENTS

  @ApiProperty({ required: true })
  product_payment_type: number;

  @ApiProperty()
  product_price: number;

  @ApiProperty()
  product_primary_price: number;

  @ApiProperty()
  product_discounts: [DiscountsType];

  //---- PRODUCT OWNER

  @ApiProperty({ required: true })
  product_author_id: ObjectId;

  @ApiProperty()
  product_author_fullname: string;

  @ApiProperty()
  product_author_image: string;

  @ApiProperty({ required: true })
  product_start_datetime: Date;

  // PRODUCT ADDITIONAL INFO

  @ApiProperty({ required: true })
  product_skills: Array<[string]>;

  @ApiProperty()
  product_students: number;

  @ApiProperty({ default: [] })
  product_speakers: Array<any>;

  @ApiProperty({ default: 0 })
  product_speakers_primary_index: number;

  @ApiProperty({ default: [] })
  product_resources: Array<any>;

  @ApiProperty({ default: [] })
  product_episodes: Array<any>;

  @ApiProperty()
  product_tags: [];

  @ApiProperty({default: []})
  product_content: Array<ProductModuleType>;  
}
