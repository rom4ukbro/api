import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TokenModule } from '../Tokens/token.module';
import { Token, TokenSchema } from '@/schemas/token.scheme';
import { User, UserSchema } from '@/schemas/user.scheme';
import { AuthService } from '@/Modules/Auth/auth.service';
import { MailModule } from '../Mail/mail.module';
import { MailService } from '../Mail/mail.service';
import { UserProductsModule } from '../UserProducts/user-products.module';
import { Product, ProductSchema } from '@/schemas/product.scheme';

@Module({
  imports: [
    forwardRef(() => MailModule),
    forwardRef(() => TokenModule),
    forwardRef(() => UserProductsModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [
    UsersService,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
})
export class UsersModule {}
