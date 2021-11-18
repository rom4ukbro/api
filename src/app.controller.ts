import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
const fetch = require('node-fetch');

console.log(fetch);

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
