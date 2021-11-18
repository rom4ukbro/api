import { ChatMessage } from '@/schemas/chatmessage.scheme';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../Users/users.service';

import * as fs from 'fs';
import * as path from 'path';

import { CreateChatMessageDto } from '@/dto/chatmessage';

@Injectable()
export class ChatService {
  constructor(@InjectModel(ChatMessage.name) private readonly messageModel: Model<ChatMessage>) {}

  async getMessages(channel){
    const messages = await this.messageModel.find({ message_channel: channel }).sort({_id: -1}).limit(50).exec()
    return messages.sort((a,b)=> 
                a.message_created_at.getTime() < b.message_created_at.getTime() ? -1 :
                a.message_created_at.getTime() > b.message_created_at.getTime() ? 1 : 0);
  }

  async createMessage(chatMessageDto: CreateChatMessageDto) {
    chatMessageDto.message_created_at = new Date();

    const newMessage = new this.messageModel(chatMessageDto);
    const message = await newMessage.save();

    return message;
  }

  async deleteMessages(channel){
    const result = await this.messageModel.deleteMany({ message_channel: channel }).exec()
    return result;
  }

}
