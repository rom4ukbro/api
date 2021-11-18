import {
  Query,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { StudyService } from './study.service';
import { createStudyDto } from '@/dto/study.dto';
import { UserRoles } from '@/constants/auth';
import { Roles } from '@/decorators/roles.decorator';
import { AuthGuard } from '@/Modules/Auth/auth.guard';

@ApiTags('Study')
@Controller('study')
export class StudyController {
  constructor(private studyService: StudyService) {}

  @Roles(UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all studys',
    type: [createStudyDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Studys not found.',
  })
  async getStudys(@Res() res) {
    const studys = await this.studyService.getStudys();

    return res.status(HttpStatus.OK).json({ studys: studys });
  }

  @Roles(UserRoles.AUTHOR, UserRoles.STUDENT, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Get('find')
  @ApiQuery({ name: 'pdtoken' })
  @ApiQuery({ name: 'sdtoken' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all studys',
    type: [createStudyDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Studys not found.',
  })
  async getStudyById(
    @Query('pdtoken') pdToken: string,
    @Query('sdtoken') sdToken: string,
  ) {
    return await this.studyService.getStudyByToken(pdToken, sdToken);
  }

  // @Post('create')
  // @HttpCode(HttpStatus.CREATED)
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Study created',
  //   type: createStudyDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'Study not found.',
  // })
  // @ApiBody({ type: createStudyDto })
  // createStudy(@Body() studyDto: createStudyDto) {
  //   return this.studyService.createStudy(studyDto);
  // }

  @Roles(UserRoles.STUDENT, UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Put('update')
  @ApiQuery({ name: 'product_token' })
  @ApiQuery({ name: 'token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Study updated',
    type: createStudyDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Study not found.',
  })
  async updateStudy(
    @Body() studyDto: createStudyDto,
    @Query('product_token') pdToken: string,
    @Query('token') stToken: string,
  ) {
    return this.studyService.updateStudy(pdToken, stToken, studyDto);
  }

  @Roles(UserRoles.ADMIN)
  @UseGuards(AuthGuard)
  @Delete('delete/token=:token')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Study deleted',
    type: createStudyDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Study not found.',
  })
  async deleteStudy(@Param('token') token: string) {
    return this.studyService.deleteStudy(token);
  }
}
