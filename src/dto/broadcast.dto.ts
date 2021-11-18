import { ObjectId } from 'mongodb';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBroadcastDto {

  @ApiProperty({ required: true })
  broadcast_id: string;

  @ApiProperty({ required: true })
  broadcast_product_id: ObjectId;

  @ApiProperty({ required: true })
  broadcast_order: string;

  @ApiProperty({ required: true })
  broadcast_title: string;

  @ApiProperty()
  broadcast_description: string;

  @ApiProperty({ required: true })
  broadcast_startdatetime: string;

  @ApiProperty()
  broadcast_video_id: string;

  @ApiProperty()
  broadcast_stream_id: string;

  @ApiProperty()
  broadcast_yt_livebroadcast: Object;

  @ApiProperty()
  broadcast_yt_stream: Object;


}
