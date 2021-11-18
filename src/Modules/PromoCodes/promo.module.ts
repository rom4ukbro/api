import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoController } from './promo.controller';
import { PromoService } from './promo.service';
import { BroadcastModule } from '../Broadcast/broadcast.module';
import { Product, ProductSchema } from '@/schemas/product.scheme';
import { Study, StudySchema } from '@/schemas/study.scheme';
import { StudyModule } from '../Study/study.module';
import { User, UserSchema } from '@/schemas/user.scheme';

@Module({
  imports: [
    BroadcastModule,
    StudyModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    MongooseModule.forFeature([{ name: Study.name, schema: StudySchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PromoController],
  providers: [PromoService],
  exports: [PromoService],
})
export class PromoModule {}
