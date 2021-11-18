import { GetUID7 } from '@/extensions/cryptolib.utils';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePromoDto {

  @ApiProperty({ required: true, default: new Date() })
  promo_created_at: Date;

  @ApiProperty({ required: true, default: GetUID7() })
  promo_token: String;

  @ApiProperty({ required: false })
  promo_user_role: Number;

  @ApiProperty({ required: false })
  promo_user_discount: Number;
}
