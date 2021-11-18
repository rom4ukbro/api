import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class TokensDto {
  @ApiProperty({ required: true })
  token: string;

  @ApiProperty({ required: true })
  refresh_token: string;

  @ApiProperty({ required: true })
  role: number;
}
