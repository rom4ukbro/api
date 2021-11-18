import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Product } from './product.scheme';
import { User } from './user.scheme';
import { PaymentStatus } from '@/constants/payments';

@Schema()
export class Payment extends Document {

  @Prop({require: true, default: new Date()})
  payment_created_on: Date;

  @Prop({require: true})
  payment_order: string;

  @Prop({require: true, ref: 'Product'})
  payment_product_id: Product;

  @Prop({require: true, ref: 'User'})
  payment_user_id: User;

  @Prop({require: true, type: Object})
  payment_wayforpay: Object;

  @Prop({require: true})
  payment_amount: number;

  @Prop({require: true, default: PaymentStatus.NOT_PAID})
  payment_status: PaymentStatus;
}

export const PeymentSchema = SchemaFactory.createForClass(Payment);
