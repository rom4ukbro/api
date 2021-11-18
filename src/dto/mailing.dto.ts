import { ObjectId } from 'mongodb';
import { ApiProperty } from '@nestjs/swagger';

export class MailingDto {
  @ApiProperty({ required: true })
  product_token: string;

  @ApiProperty({ required: true })
  mail_title: string;

  @ApiProperty({ required: true })
  mail_message: string;

  @ApiProperty({ required: false })
  mail_link: string;
}
