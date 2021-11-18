import { Token, TokenSchema } from '@/schemas/token.scheme';
import { User, UserSchema } from '@/schemas/user.scheme';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from '../Mail/mail.module';
import { UsersModule } from '../Users/users.module';
import { UsersService } from '../Users/users.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [],
  providers: [TokenService],
  exports: [
    TokenService,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema } ]),
  ],
})
export class TokenModule {}

