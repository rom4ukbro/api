import { ChatMessage, ChatMessageSchema } from '@/schemas/chatmessage.scheme';
import { Upload, UploadSchema } from '@/schemas/upload.scheme';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from '../Products/product.module';
import { TokenModule } from '../Tokens/token.module';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [
    TokenModule,
    MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }]),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService]
})
export class UploadsModule {}
