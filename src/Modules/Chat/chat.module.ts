import { ChatMessage, ChatMessageSchema } from '@/schemas/chatmessage.scheme';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from '../Tokens/token.module';
import { UsersModule } from '../Users/users.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    // forwardRef(() => UsersModule),
    forwardRef(() => TokenModule),
    MongooseModule.forFeature([{ name: ChatMessage.name, schema: ChatMessageSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService]
})
export class ChatModule {}
