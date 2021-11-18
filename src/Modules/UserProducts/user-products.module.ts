import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BroadcastModule } from '../Broadcast/broadcast.module';
import { Product, ProductSchema } from '@/schemas/product.scheme';
import { Study, StudySchema } from '@/schemas/study.scheme';
import { StudyModule } from '../Study/study.module';
import { User, UserSchema } from '@/schemas/user.scheme';
import { TokenModule } from '../Tokens/token.module';
import { PaymentsModule } from '../Payments/payments.module';
import { UserProductsService } from './user-products.service';
import { UserProductsController } from './user-products.controller';
import { UserProduct, UserProductSchema } from '@/schemas/user-product.scheme';
import { ProductModule } from '../Products/product.module';

@Module({
  imports: [
    forwardRef(() => TokenModule),
    forwardRef(() => PaymentsModule),
    forwardRef(() => ProductModule),
    MongooseModule.forFeature([{ name: UserProduct.name, schema: UserProductSchema }]),
  ],
  controllers: [UserProductsController],
  providers: [UserProductsService],
  exports: [
    MongooseModule.forFeature([{ name: UserProduct.name, schema: UserProductSchema }]),
    UserProductsService
  ],
})
export class UserProductsModule {}
