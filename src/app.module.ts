import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { ProductModule } from './Modules/Products/product.module';
import { UsersModule } from './Modules/Users/users.module';
import { StudyModule } from './Modules/Study/study.module';
import { BroadcastModule } from './Modules/Broadcast/broadcast.module';
import { StreamModule } from './Modules/Stream/stream.module';
import { ReviewsModule } from './Modules/Reviews/reviews.module';
import { TokenModule } from './Modules/Tokens/token.module';
import { MailModule } from './Modules/Mail/mail.module';

import { MONGO_CLIENT_OPTIONS } from './config/mongo';
import { UserNotificationModule } from './Modules/UserNotification/UserNotification.module';
import { PaymentsModule } from './Modules/Payments/payments.module';
import { UserProductsModule } from './Modules/UserProducts/user-products.module';
import { ChatModule } from './Modules/Chat/chat.module';
import { UploadsModule } from './Modules/Uploads/uploads.module';

ConfigModule.forRoot();

const MONGO_HOST = process.env.MONGO_HOST;
const MONGO_PORT = process.env.MONGO_PORT;
const MONGO_DB = process.env.MONGO_DB;
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const mongoUri = `mongodb+srv://academyTest:academyTest@cluster.gw39s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

@Module({
  imports: [
    UploadsModule,
    ChatModule,
    MailModule,
    UsersModule,
    UserProductsModule,
    TokenModule,
    PaymentsModule,
    MongooseModule.forRoot(mongoUri, MONGO_CLIENT_OPTIONS),
    StreamModule,
    BroadcastModule,
    ProductModule,
    StudyModule,
    UserNotificationModule,
    ReviewsModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(AppMiddleware)
//       .forRoutes('*');
//   }
// }
