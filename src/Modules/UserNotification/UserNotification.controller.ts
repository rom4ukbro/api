import { ObjectId } from 'mongodb';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  Delete,
  Query,
  HttpCode,
  Options,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { NotificationDto, ReadDto } from '@/dto/notification.dto';
import { UserNotificationService } from './UserNotification.service';
import { UserRoles } from '@/constants/auth';
import { Roles } from '@/decorators/roles.decorator';
import { AuthGuard } from '@/Modules/Auth/auth.guard';

@ApiTags('Notifications')
@Controller('Notifications')
export class UserNotificationController {
  constructor(private readonly notificationService: UserNotificationService) {}

  @Roles(UserRoles.STUDENT, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Get()
  @ApiQuery({ name: 'token' })
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'limit' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get notification',
    type: [NotificationDto],
  })
  async getNtf(
    @Query('token') token: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.notificationService.getNotification(token, page, limit);
  }

  @Roles(UserRoles.AUTHOR, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Post('create')
  @ApiBody({ type: NotificationDto })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notification created',
    type: NotificationDto,
  })
  async createNtf(@Body() ntfBody: NotificationDto) {
    return this.notificationService.create(ntfBody);
  }

  @Roles(UserRoles.STUDENT, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Post('read')
  @ApiBody({ type: ReadDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification update',
  })
  async readNtf(@Body() _id: ReadDto) {
    return this.notificationService.getReaded(_id._id);
  }

  @Roles(UserRoles.STUDENT, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Delete()
  @ApiBody({ type: ReadDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification deleted',
  })
  async delNtf(@Body() _id: ReadDto) {
    return this.notificationService.delete(_id._id);
  }
}
