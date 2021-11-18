import { ApiProperty } from '@nestjs/swagger';
import { GetUID7 } from '@/extensions/cryptolib.utils';
import { AuthType, UserRoles } from '@/constants/auth';

export class CreateUserDto {
  @ApiProperty({
    default: GetUID7(),
    required: true,
    readOnly: true,
  })
  user_token: string;

  @ApiProperty({ required: true })
  user_role: UserRoles;

  @ApiProperty({ required: true })
  user_fullname: string;

  @ApiProperty({ required: true })
  user_email: string;

  @ApiProperty({ required: false })
  user_promo: string;

  @ApiProperty({ required: false, default: '' })
  user_phone: string;

  @ApiProperty({ required: true })
  user_password: string;

  @ApiProperty({ required: false })
  user_description: string;

  @ApiProperty({ default: 0, required: false })
  user_product_count: number;

  @ApiProperty({ required: false })
  user_image: string;

  @ApiProperty({ required: false })
  user_social_auth: boolean;

  @ApiProperty({ required: false })
  user_social_profile_id: string;

  @ApiProperty({ required: false })
  user_social_auth_type: AuthType;

  @ApiProperty({ required: false, default: [] })
  user_products: [];

  @ApiProperty({ required: false })
  user_buy_product_token: string;

  @ApiProperty({ required: false, default: [] })
  user_fav_products: [];

  @ApiProperty({ required: false })
  recovery: string;

  @ApiProperty({ required: false })
  isActivate: boolean;
}
