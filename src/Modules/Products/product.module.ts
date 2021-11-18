import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { BroadcastModule } from '../Broadcast/broadcast.module';
import { Product, ProductSchema } from '@/schemas/product.scheme';
import { Study, StudySchema } from '@/schemas/study.scheme';
import { StudyModule } from '../Study/study.module';
import { User, UserSchema } from '@/schemas/user.scheme';
import { TokenModule } from '../Tokens/token.module';
import { PaymentsModule } from '../Payments/payments.module';
import { UserProductsModule } from '../UserProducts/user-products.module';
import { UploadsModule } from '../Uploads/uploads.module';

@Module({
  imports: [
    BroadcastModule,
    StudyModule,
    TokenModule,
    PaymentsModule,
    UserProductsModule,
    UploadsModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: Study.name, schema: StudySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
