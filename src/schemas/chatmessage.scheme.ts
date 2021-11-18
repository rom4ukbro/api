import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from './user.scheme';

@Schema()
export class ChatMessage extends Document {

  @Prop({ require: true, default: new Date() })
  message_created_at: Date;

  @Prop({ require: true })
  message_channel: string;

  @Prop({ require: true })
  message_text: string;

  @Prop({required: true})
  user_nickname: string

  @Prop({required: true, ref: 'users'})
  user_id: User;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
