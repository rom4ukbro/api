import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Product } from './product.scheme';

@Schema()
export class Broadcast extends Document {
  @Prop({ required: true, ref: 'product' })
  broadcast_product_id: Product;

  @Prop({ required: true })
  broadcast_order: string;

  @Prop({ required: true })
  broadcast_title: string;

  @Prop()
  broadcast_description: string;

  @Prop({ required: true })
  broadcast_startdatetime: Date;

  @Prop({ required: true })
  broadcast_video_id: string;

  @Prop({ required: true })
  broadcast_stream_id: string;

  @Prop({ type: Object })
  broadcast_yt_livebroadcast: Object;

  @Prop({ type: Object })
  broadcast_yt_stream: Object;
}

export const BroadcastSchema = SchemaFactory.createForClass(Broadcast);
