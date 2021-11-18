import { Product } from '@/schemas/product.scheme';
import { User } from '@/schemas/user.scheme';
import { ApiProperty } from '@nestjs/swagger';
import { NumericType, ObjectId } from 'mongodb';

export class CreateUserProductDto {
  @ApiProperty({ required: true })
  user_id: User;

  @ApiProperty({ required: true })
  product_id: Product;

  @ApiProperty({ required: true })
  product_payment_type: Number;

  @ApiProperty({ required: true })
  product_payment_status: Number;

  @ApiProperty()
  product_payment_amount: number;

  @ApiProperty()
  product_payment_order: string;

}
