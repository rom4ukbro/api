import { Query, Body, Request, Controller, Delete, Get, HttpCode, HttpStatus, Headers, Param, Post, Put, Res, UseGuards, Req, HttpException, UnauthorizedException, Header, forwardRef, Inject,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from '@/dto/user.dto';
import { LoginDto } from '@/dto/login.dto';
import { AuthGuard } from '@/Modules/Auth/auth.guard';
import { TokenService } from '@/Modules/Tokens/token.service';
import { Response } from 'express';
import AppUrl from '@/classes/AppUrl';

import '@/extensions/date';
import { MailService } from '../Mail/mail.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => MailService)) private readonly mailService: MailService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all users',
    type: [CreateUserDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Users not found.',
  })
  async getUsers(@Res({ passthrough: true }) res) {
    const users = await this.usersService.getUsers();
    return users;
  }

  @Get('find')
  @ApiQuery({ name: 'token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all users',
    type: [CreateUserDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Users not found.',
  })
  async getAuthorById(@Query('token') user_token: string) {
    return await this.usersService.getByToken(user_token);
  }

  @Post('findbyemail')
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'user_email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check if author exists in db',
    type: Boolean,
  })
  async findByEmail(@Body('user_email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return !!user;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateUserDto })
  async createUser(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.usersService.create(userDto);

    if (!!user) {
      let apiUrl = '/users/activate/' + user.user_token;

      if (!!userDto.user_buy_product_token)
        apiUrl += `/${userDto.user_buy_product_token}`;

      this.mailService.sendEmailApprovement(
        [user.user_email],
        AppUrl.getApi(apiUrl),
        user.user_fullname,
      );
      return true;
    }

    throw new HttpException(
      'Error when creating author',
      HttpStatus.BAD_REQUEST,
    );
  }

  @Post('activate/promo')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unathorized',
  })
  async activatePromo(
    @Body() promoDto: any,
    @Res({ passthrough: true }) res: Response,
  ) {

    const userData = this.tokenService.getTokenData();
    const user_id = !!userData ? userData.id : null;

    const user = await this.usersService.activatePromo(user_id, promoDto.user_promo);

    return {
      success: !!user
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unathorized',
  })
  async login(
    @Body() userDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = this.usersService.isAdmin(
      userDto.user_email,
      userDto.user_password,
    )
      ? this.usersService.getAdminUser()
      : await this.usersService.login(
          userDto.user_email,
          userDto.user_password,
        );

    if (!user) throw new HttpException('Error', HttpStatus.UNAUTHORIZED);

    const tokens = await this.tokenService.createTokens(
      user.user_id,
      user.user_email,
      user.user_role,
    );
    const expires = new Date(Date.now() + Number(process.env.REFRESH_TOKEN_MAX_AGE) * 1000);

    res.cookie('refreshToken', tokens.refreshToken, {
      expires: expires,
      httpOnly: true,
      domain: process.env.COOKIES_DOMAIN,
    });
    res.cookie('session', Date.now(), {
      expires: expires,
      domain: process.env.COOKIES_DOMAIN,
    });

    return {
      acceptToken: tokens.acceptToken,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unathorized',
  })
  async getMe() {
    let tokens = this.tokenService.extractTokensFromRequest();

    const user = this.usersService.isAdminToken(tokens.refreshToken)
      ? await this.usersService.getAdminUser()
      : await this.tokenService.getUserByToken(tokens.refreshToken);

    if (!user) throw new HttpException('Error', HttpStatus.UNAUTHORIZED);

    return {
      user: user,
    };
  }

  @UseGuards(AuthGuard)
  @Get('logout')
  async logout(
    @Headers() { authorization },
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('refreshToken', '', {
      maxAge: 0,
      httpOnly: true,
      domain: process.env.COOKIES_DOMAIN,
    });
    res.cookie('session', '', {
      maxAge: 0,
      domain: process.env.COOKIES_DOMAIN,
    });

    return await this.tokenService.deleteToken(authorization);
  }

  @Get('refreshtoken')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unathorized',
  })
  async refreshToken(@Res({ passthrough: true }) res: Response) {
    const tokens = this.tokenService.extractTokensFromRequest();
    if (!tokens.refreshToken) return null;

    const newTokens = await this.tokenService.getNewTokens(tokens.refreshToken);
    if (!newTokens) throw new UnauthorizedException();

    await this.tokenService.deleteToken(tokens.refreshToken);

    const expires = new Date(
      Date.now() + Number(process.env.REFRESH_TOKEN_MAX_AGE) * 1000,
    );

    res.cookie('refreshToken', newTokens.refreshToken, {
      expires: expires,
      httpOnly: true,
      domain: process.env.COOKIES_DOMAIN,
    });
    res.cookie('session', Date.now(), {
      expires: expires,
      domain: process.env.COOKIES_DOMAIN,
    });

    return {
      acceptToken: newTokens.acceptToken,
    };
  }

  // @Put('update')
  // @ApiQuery({ name: 'token' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Author updated',
  //   type: CreateUserDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'Author not found.',
  // })
  // async updateUser(
  //   @Query('token') token: string,
  //   @Body() authorDto: CreateUserDto,
  // ) {
  //   return this.usersService.update(token, authorDto);
  // }

  // @Delete('delete')
  // @ApiQuery({ name: 'token' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'Author deleted',
  //   type: CreateUserDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'Author not found.',
  // })
  // async deleteAuthor(@Query('token') token: string) {
  //   return this.usersService.delete(token);
  // }

  @Get('activate/:user_token/:product_token?')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Author activate',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Author not found.',
  })
  async activate(
    @Param('user_token') user_token: string,
    @Param('product_token') products_token: string,
    @Res() res: Response,
  ) {
    const user = await this.usersService.activate(user_token);
    const expires = new Date(Date.now() + Number(process.env.REFRESH_TOKEN_MAX_AGE) * 1000);

    //если узер еще не был активирован, активируем
    if (!!user) {
      const tokens = await this.tokenService.createTokens(
        user._id,
        user.user_email,
        user.user_role,
      );

      res.cookie('refreshToken', tokens.refreshToken, {
        expires: expires,
        httpOnly: true,
        domain: process.env.COOKIES_DOMAIN,
      });
      res.cookie('session', Date.now(), {
        expires: expires,
        domain: process.env.COOKIES_DOMAIN,
      });
    }

    if (!!products_token)
      return res.redirect(AppUrl.getUi(`/event/buy/${products_token}`));
    else 
      return res.redirect(AppUrl.getUi('/user'));
  }

  @Post('recover')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email sended',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Author not found.',
  })
  async getRecovery(@Body('user_email') user_email: string) {
    const recoveryToken = await this.usersService.createRecoveryToken(user_email);
    let success = false;

    if(!!recoveryToken){
      const emailSent: any = await this.mailService.passRecovery([user_email], AppUrl.getUi(`?reset=${recoveryToken}`));
      success = emailSent.accepted.length > 0;
    }

    return {success: success};
  }

  @Post('token/state')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Check if token is exists',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Token not found.',
  })
  async getTokenState(
    @Body('recover_token') recover_token,
    @Res({passthrough: true}) res: Response,
  ) {
    const user = await this.usersService.getByRecoveryToken(recover_token);

    return {state: !!user};
  }

  @Post('setpass')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Author not found.',
  })
  async setPassword(
    @Body('recover_token') recover_token,
    @Body('user_password') user_password,
    @Res({passthrough: true}) res: Response,
  ) {
    const user = await this.usersService.setPassword(user_password, recover_token);

    if (!!user) {
      const expires = new Date(Date.now() + Number(process.env.REFRESH_TOKEN_MAX_AGE) * 1000);
      const tokens = await this.tokenService.createTokens(
        user._id,
        user.user_email,
        user.user_role,
      );

      res.cookie('refreshToken', tokens.refreshToken, {
        expires: expires,
        httpOnly: true,
        domain: process.env.COOKIES_DOMAIN,
      });
      res.cookie('session', Date.now(), {
        expires: expires,
        domain: process.env.COOKIES_DOMAIN,
      });

      // res.redirect(AppUrl.getUi('/user'));
      return {success: true};
    }

    // res.redirect(AppUrl.getUi('/'));
    return {success: false};
  }
}
