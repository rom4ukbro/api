import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Study, StudySchema } from '@/schemas/study.scheme';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';
import { TokenModule } from '../Tokens/token.module';

@Module({
  imports: [
    TokenModule,
    MongooseModule.forFeature([{ name: Study.name, schema: StudySchema }]),
  ],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
