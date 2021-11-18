import { ChatMessage } from '@/schemas/chatmessage.scheme';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as fs from 'fs';
import * as path from 'path';
import { Upload } from '@/schemas/upload.scheme';
import ResoursesService from '@/classes/ResoursesService';
import { UploadCreateDto } from '@/dto/upload.dto';
import { UploadStatus } from '@/constants/uploads';
import { removeFiles } from '@/extensions/file.utils';
import { time } from 'console';

@Injectable()
export class UploadsService {
  constructor(@InjectModel(Upload.name) private readonly uploadModel: Model<Upload>) {}

  async getUploads(){
    const uploads = await this.uploadModel.find({}).exec();
    return uploads;
  }

  async createUpload(uploadDto: UploadCreateDto) {  
    const upload = new this.uploadModel(uploadDto);
    await upload.save();
  }

  async deleteUploads(productToken: string) {
    const deleted = await this.uploadModel.deleteMany({product_token: productToken}).exec();
    return deleted;
  }

  async deleteUpload(filePath: string) {
    const filename = filePath.match(/[^\/.]+(\..{1,4})$/g)
    if(!filename[0]) return;

    const deleted = await this.uploadModel.deleteMany({file_name: filename[0]}).exec();
    return deleted;
  }

  async cleanUploads(productToken: string) {
    const unconfirmed = await this.uploadModel.find({product_token: productToken, file_status: UploadStatus.UNCONFIRMED}).exec();
    const files = unconfirmed.map(u => u.file_path);

    //удаляем файлы без транзакции физически
    if(!!files.length)
      await removeFiles(files);

    const deleted = await this.uploadModel.deleteMany({product_token: productToken, file_status: UploadStatus.UNCONFIRMED}).exec();
    return deleted;
  }

  async confirmUploads(productToken: string) {
    const confirmed = await this.uploadModel.updateMany(
                  { product_token: productToken }, 
                  { $set: { file_status: UploadStatus.CONFIRMED }})
                  .exec();

    return confirmed;
  }

}
