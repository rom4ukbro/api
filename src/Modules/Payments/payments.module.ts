import { Payment, PeymentSchema } from '@/schemas/payment.scheme';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from '../Tokens/token.module';
import { TokenService } from '../Tokens/token.service';
import { UserProductsModule } from '../UserProducts/user-products.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Product, ProductSchema } from '@/schemas/product.scheme';

@Module({
  imports: [
    forwardRef(() => TokenModule),
    forwardRef(() => UserProductsModule),
    MongooseModule.forFeature([{ name: Payment.name, schema: PeymentSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PeymentSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    PaymentsService,
    ],
})
export class PaymentsModule {}
