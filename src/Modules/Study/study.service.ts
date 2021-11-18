import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createStudyDto } from '../../dto/study.dto';

import { Study } from '@/schemas/study.scheme';

@Injectable()
export class StudyService {
  constructor(
    @InjectModel(Study.name) private readonly StudyModel: Model<Study>,
  ) {}

  async getStudys(): Promise<Study[]> {
    return this.StudyModel.find().exec();
  }

  async getStudyByToken(studentToken, productToken) {
    return this.StudyModel.findOne({
      token: studentToken,
      product_token: productToken,
    });
  }

  async createStudy(studentToken, productToken): Promise<Study> {
    const newStudy = new this.StudyModel({
      token: studentToken,
      product_token: productToken,
    });
    return newStudy.save();
  }

  async updateStudy(
    pdToken: string,
    stToken: string,
    updateStudyDto,
  ): Promise<Study> {
    return this.StudyModel.findOneAndUpdate(
      {
        product_token: pdToken,
        token: stToken,
      },
      updateStudyDto,
    );
  }

  async deleteStudy(token: string) {
    return this.StudyModel.findOneAndRemove({ study_token: token });
  }

  async searchStudy(conditions: createStudyDto) {
    return this.StudyModel.find(conditions);
  }
}
