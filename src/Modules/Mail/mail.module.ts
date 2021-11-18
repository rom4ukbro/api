import { forwardRef, Module } from '@nestjs/common';
import { TokenModule } from '../Tokens/token.module';
import { UsersModule } from '../Users/users.module';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [
    forwardRef(() => TokenModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
