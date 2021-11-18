import { BroadcastService } from './broadcast.service';
import { Body, Controller, Get, Post, Req, Res, UseGuards} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateBroadcastDto as CreateBroadcastDto } from '@/dto/broadcast.dto';
import { UserRoles } from '@/constants/auth';
import { Roles } from '@/decorators/roles.decorator';
import { AuthGuard } from '@/Modules/Auth/auth.guard';

const ytdl = require('ytdl-core');

@ApiTags('Broadcast')
@Controller('broadcast')
export class BroadcastController {

  constructor(private broadcastService: BroadcastService) {}

  // @Roles(UserRoles.AUTHOR, UserRoles.ADMIN)
  // @UseGuards(AuthGuard)
  @Get('/')
  async getAll(@Res() res) {
    res.redirect('/youtube/auth.html');
  }

  @Get('/download')
  async download(@Res() res) {

    res.header('Content-Disposition', 'attachment; filename="video.mp4"');

    // let info = await ytdl.getInfo('Cs7p3BFkLnU');
    // let format = ytdl.chooseFormat(info.formats, { quality: '720p' });

    ytdl('https://youtu.be/TWAV6A32wuI', { filter: format => 
    {
      // return format.container === 'mp4'&& format.qualityLabel == '720p' && format.hasAudio
      return /*format.container === 'mp4'&&*/ format.hasAudio
    }
  }).pipe(res);
  }



  @Roles(UserRoles.ADMIN)
  // @UseGuards(AuthGuard)
  @Get('/accesstoken')
  async getAccessToken(
    @Res({passthrough: true}) res) {
    const access_token = await this.broadcastService.getAccessToken();

    return {access_token: access_token};
  }

  @Roles(UserRoles.ADMIN)
  // @UseGuards(AuthGuard)
  @Get('/authorize')
  async authorize(@Res() res) {
    const authUrl = await this.broadcastService.getCode();
    res.redirect(authUrl);
  }

  // @Roles(UserRoles.ADMIN)
  // @UseGuards(AuthGuard)
  @Get('/auth2')
  async authorize2(@Res({passthrough: true}) res) {
    const data = await this.broadcastService.getNewTokens(res);
    return data;
  }

  @Roles(UserRoles.ADMIN, UserRoles.AUTHOR)
  // @UseGuards(AuthGuard)
  @Post('/create')
  @ApiBody({ type: CreateBroadcastDto })
  async createLive(@Body() broadcastDto: CreateBroadcastDto, @Res() res) {
    const broadcast = await this.broadcastService.createBroadcast(broadcastDto);

    res.json({ broadcast: broadcast });
  }

  @Roles(UserRoles.ADMIN, UserRoles.AUTHOR)
  // @UseGuards(AuthGuard)
  @Post('/delete')
  @ApiBody({ type: CreateBroadcastDto })
  async deleteLive(@Body('broadcast_id') broadcast_id:string, @Res() res) {
    const broadcast = await this.broadcastService.deleteBroadcast(broadcast_id);

    res.json({ broadcast: true });
  }

  // @Roles(UserRoles.ADMIN)
  // @UseGuards(AuthGuard)
  @Get('/callback')
  async callback(@Req() req, @Res() res) {
    const { code } = req.query;

    this.broadcastService.getTokenByAuthCode(code);

    res.redirect('/broadcast');
  }
}
