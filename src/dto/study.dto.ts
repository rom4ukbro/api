import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class createStudyDto {
  @ApiProperty({ default: ObjectId, required: true, readOnly: true })
  _id: ObjectId;

  @ApiProperty({ required: true })
  token: string;

  @ApiProperty({ required: true })
  product_token: string;

  @ApiProperty({ required: true })
  study_answers: Array<Object>;

  @ApiProperty({ required: true })
  study_homeworks: Array<string>;
}
