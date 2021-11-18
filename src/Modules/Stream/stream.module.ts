import { Module } from '@nestjs/common';
import { StreamGateaway } from './stream.gateaway';

@Module({
  providers: [StreamGateaway],
})
export class StreamModule {}
