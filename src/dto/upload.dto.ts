import { Prop } from "@nestjs/mongoose";

export class UploadCreateDto {
  @Prop({ required: true})
  product_token: string;

  @Prop()
  file_name_original: string;

  @Prop({ required: true})
  file_name: string;

  @Prop({ required: true })
  file_path: string;

  @Prop({ required: true })
  file_url: string;
  
}
