import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BroadcastController } from './broadcast.controller';
import { BroadcastService } from './broadcast.service';
import { TokenModule } from '../Tokens/token.module';
import { Broadcast, BroadcastSchema } from '@/schemas/broadcast.scheme';
import { Product, ProductSchema } from '@/schemas/product.scheme';

@Module({
  imports: [
    TokenModule,
    MongooseModule.forFeature([{ name: Broadcast.name, schema: BroadcastSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),

  ],
  controllers: [BroadcastController],
  providers: [BroadcastService],
  exports: [
    BroadcastService,
    MongooseModule.forFeature([{ name: Broadcast.name, schema: BroadcastSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
})
export class BroadcastModule {}
