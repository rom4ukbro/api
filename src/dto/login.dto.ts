import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ required: true })
  user_email: string;

  @ApiProperty({ required: true })
  user_password: string;
}
