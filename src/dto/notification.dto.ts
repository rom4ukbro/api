import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus } from '@/constants/common';
import { ObjectId } from 'mongodb';

export class NotificationDto {
  @ApiProperty({ default: ObjectId, required: true, readOnly: true })
  _id: ObjectId;

  @ApiProperty({ required: true })
  user_token: string;

  @ApiProperty({ default: new Date(), required: true, readOnly: true })
  ntf_created_at: Date;

  @ApiProperty({ required: true })
  ntf_type: string;

  @ApiProperty({ required: true })
  ntf_text: string;

  @ApiProperty({ required: true })
  ntf_params: string;

  @ApiProperty({ default: NotificationStatus.NEW, required: true })
  ntf_status: NotificationStatus;
}

export class ReadDto {
  @ApiProperty({ required: true })
  _id: ObjectId;
}
