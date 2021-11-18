import {
  UserNotification,
  UserNotificationSchema,
} from '@/schemas/user-notifications.scheme';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserNotificationController } from './UserNotification.controller';
import { UserNotificationService } from './UserNotification.service';
import { TokenModule } from '../Tokens/token.module';

@Module({
  imports: [
    TokenModule,
    MongooseModule.forFeature([
      { name: UserNotification.name, schema: UserNotificationSchema },
    ]),
  ],
  controllers: [UserNotificationController],
  providers: [UserNotificationService],
  exports: [UserNotificationService],
})
export class UserNotificationModule {}
