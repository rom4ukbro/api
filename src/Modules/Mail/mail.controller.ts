import { Body, Controller, forwardRef, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { MailService } from './mail.service';
import { UsersService } from '../Users/users.service';
import { MailingDto } from '@/dto/mailing.dto';
import { AuthGuard } from '../Auth/auth.guard';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly usersService: UsersService) {}

  @Get('users')
  @ApiBody({ type: MailingDto })
  async getUsersHasNoProducts(@Body() mailingDto: MailingDto) {

    // const targetUsers = await this.usersService.getUserHasNoProducts();
    const MENTAL_HEALTH_PRODUCT = 'EJFMQUK';
    const MISSIONARY_PRODUCT = 'VUWUSCF';
    const SB_SCHOOL_PRODUCT = 'LEBRHYS';

    const targetUsers = await this.usersService.getUserHasProduct(SB_SCHOOL_PRODUCT);

    return { users: targetUsers, amount: targetUsers.length }
  }

  @Get('hasnoproduct/:token')
  @ApiBody({ type: MailingDto })
  async getUsersHasNoProduct(@Param('token') product_token: string) {

    const targetUsers = await this.usersService.getUserHasNoProduct(product_token);

    return { users: targetUsers, amount: targetUsers.length }
  }

  @Get('students/:token')
  async getStudents(@Param('token') productToken: string) {

    if(!productToken) return;

    let students = await this.usersService.getUserHasProduct(productToken);

    return {
      students_count: students.length
    }
  }

  // @UseGuards(AuthGuard)
  @Post('mailing')
  @ApiBody({ type: MailingDto })
  async mailing(@Body() mailingDto: MailingDto) {

    if(!mailingDto.product_token) return;

    // let targetUsers = await this.usersService.getUserHasProduct(mailingDto.product_token);
    let targetUsers = ['zagarichuk@gmail.com', 'sanhos.95@gmail.com'];

    let mailStatuses = [];

    targetUsers.forEach((email, index) => {
      if(!!email)
          mailStatuses[index] = this.mailService.sendEmail([email], mailingDto.mail_title, mailingDto.mail_message, mailingDto.mail_link);
    })

    const mailStatusesValues:any[] = (await Promise.allSettled(mailStatuses)).filter(s=>!!s).map((s:any)=>s.value);

    const accepted = mailStatusesValues.reduce( (acc, s) => { return acc + (!!s ? s.accepted.length : 0) }, 0);
    const rejected = mailStatusesValues.reduce( (acc, s) => { return acc + (!!s ? s.rejected.length : 0) }, 0);

    return { 
        accepted: accepted, 
        rejected: rejected, 
        users: targetUsers, 
        usersCount: targetUsers.length
      };
  }
}
