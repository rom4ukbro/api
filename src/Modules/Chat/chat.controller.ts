import { CreateChatMessageDto } from '@/dto/chatmessage';
import { Body, Controller, forwardRef, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '../Auth/auth.guard';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(AuthGuard)
  @Get('messages/:channel')
  @ApiBody({ type: String })
  async getMesssages(@Param('channel') channel: string) {
    const messages = await this.chatService.getMessages(channel);

    return { messages: messages };
  }
  
  @UseGuards(AuthGuard)
  @Post('create/message')
  @ApiBody({ type: CreateChatMessageDto })
  async createMesssage(@Body() messageDto: CreateChatMessageDto) {
    const message = await this.chatService.createMessage(messageDto);

    return { message: message };
  }

  @UseGuards(AuthGuard)
  @Get('delete/:channel')
  async deleteMesssages(@Param(':channel') channel: string) {
    const result = await this.chatService.deleteMessages(channel);

    return { result: result };
  }

}
