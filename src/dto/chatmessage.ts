import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'bson';

export class CreateChatMessageDto {

  @ApiProperty({ required: true })
  message_created_at: Date;

  @ApiProperty({ required: true })
  message_channel: string;

  @ApiProperty({ required: true })
  message_text: string;

  @ApiProperty({required: true})
  user_nickname: string

  @ApiProperty({required: true})
  user_id: ObjectId;
}
