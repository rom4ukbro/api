import { CreateBroadcastDto } from './../../dto/broadcast.dto';
import { Inject, Injectable } from '@nestjs/common';
import { google, youtube_v3 } from 'googleapis';
import * as util from 'util';
import * as fs from 'fs';
import { Broadcast } from '@/schemas/broadcast.scheme';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '@/schemas/product.scheme';
import { ObjectId } from 'mongodb';
import fetch from 'node-fetch';
import { GaxiosPromise } from 'googleapis-common';
import { Response, Request, CookieOptions } from 'express'
import { REQUEST } from '@nestjs/core';
import { CookieParseOptions } from 'cookie-parser';
import got from 'got'

@Injectable()
export class BroadcastService {
  // Permissions needed to view and submit live chat comments
  scope = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ];

  auth: any = {};

  constructor(
    @InjectModel(Broadcast.name) private readonly broadcastModel: Model<Broadcast>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @Inject(REQUEST) private readonly request: Request
        ) {

    const clientId = '555484779138-5d5qemjjm4q6k29lsbno9fn1cdn3ehfm.apps.googleusercontent.com';
    const clientSecret = 'HHfMJjQ8bSzBL4cMLCcwdy_q';
    const redirectURI = process.env.YOUTUBE_CALLBACK + '/broadcast/callback';

    this.auth = new google.auth.OAuth2(clientId, clientSecret, redirectURI);

    this.auth.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        this.save('./tokens.json', JSON.stringify(tokens));

        console.log(tokens.refresh_token);
      }

      console.log(tokens.access_token);
    });

    this.checkTokens();
  }

  async getTokenByAuthCode(code) {
    const credentials = await this.auth.getToken(code);
    this.authorize(credentials);
  }

  async getCode() {
    const scope = this.scope;
    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope,
    });

    return authUrl;
  }

  async authorize({ tokens }) {
    this.auth.setCredentials(tokens);

    console.log('Successfully set credentials');
    console.log('tokens:', tokens);

    this.save('./tokens.json', JSON.stringify(tokens));
  }

  async getAccessToken():Promise<string> {
    const tokens:any = await this.read('./tokens.json');
    return tokens.access_token;
  }

  async createYoutubeBroadcast(broadcastDto){
    var service = google.youtube('v3');

    const youtubeBoadcastObject: youtube_v3.Params$Resource$Livebroadcasts$Insert = {
        auth: this.auth,
        part: ['snippet,contentDetails,status'],
        requestBody: {
          snippet: {
            scheduledStartTime: broadcastDto.broadcast_startdatetime,
            title: broadcastDto.broadcast_title,
            description: broadcastDto.broadcast_description,
            thumbnails:{
              default:{
                url: 'https://tochkarosta.info/img/programm/brain2.png',
                width: 120,
                height: 90
              },      
              high:{
                url: 'https://tochkarosta.info/img/programm/brain2.png',
                width: 320,
                height: 180
              },      
              medium:{
                url: 'https://tochkarosta.info/img/programm/brain2.png',
                width: 480,
                height: 360
              },      
              standard:{
                url: 'https://tochkarosta.info/img/programm/brain2.png',
                width: 1920,
                height: 1080
              }
            }
          },
          status: {
            privacyStatus: 'unlisted',
            selfDeclaredMadeForKids: false,
          },
          contentDetails:{
            recordFromStart: true,
            enableEmbed: true,
            enableAutoStart: true,
            enableAutoStop: true,
            enableLowLatency: true
          }
        },
      }    

    try{
      return await service.liveBroadcasts.insert(youtubeBoadcastObject);
    }
    catch(e){
      console.log("ERROR CREATING" + e);
      return null;
    }
  }

  async uploadThumbnail(videoId:string, thumbnailSrc: string){
    var service = google.youtube('v3');

    const httpData = await got.stream(thumbnailSrc);

    try{
      return await service.thumbnails.set({
        auth: this.auth,
        videoId: videoId,
          media: {
            mimeType: "image/png",
            body: httpData,
          }
      });
      }
    catch(e){
      console.log("ERROR UPLOAD THUMBNAIL:" + e);
      return null;
    }
  }

  async createYoutubeStream(broadcastDto){
    var service = google.youtube('v3');

    const youtubeStreamObject: youtube_v3.Params$Resource$Livestreams$Insert = {
          auth: this.auth,
          part: ['snippet, cdn, status'],
          requestBody: {
              cdn: {
                format: "",
                ingestionType: "rtmp",
                frameRate: "30fps",
                resolution: "720p",
              },
              kind: "youtube#liveStream",
              snippet: {
                title: "Stream"
              },
              status: {
                streamStatus: "active"
              },
          }
      }

    try{
      return await service.liveStreams.insert(youtubeStreamObject);
    }
    catch(e){
      console.log("ERROR CREATING STREAM" + e);
      return null;
    }
  }

  async createYoutubeBinding(broadcast,stream){
    var service = google.youtube('v3');

    const youtubeBindObject: youtube_v3.Params$Resource$Livebroadcasts$Bind = {
          auth: this.auth,
          part: ['id', 'snippet, status'],
          id: broadcast.data.id,
          streamId: stream.data.id
      }

    try{
      return await service.liveBroadcasts.bind(youtubeBindObject);
    }
    catch(e){
      console.log("ERROR CREATING BINDING" + e);
      return null;
    }
  }

  async createBroadcast(broadcastDto: CreateBroadcastDto) {
      
    await this.checkTokens();

    const youtubeBroadcast = await this.createYoutubeBroadcast(broadcastDto);
    if(!youtubeBroadcast) return null;

    const youtubeStream = await this.createYoutubeStream(broadcastDto);
    if(!youtubeStream) return null;

    const youtubeBind = await this.createYoutubeBinding(youtubeBroadcast, youtubeStream);
    if(!youtubeBind) return null;

    const product = await this.productModel.findOne({_id: broadcastDto.broadcast_product_id}).exec();
    if(!product) return null;

    const thumbnail = await this.uploadThumbnail(youtubeBroadcast.data.id, `https://api.tochkarosta.info/${product.product_image_cover}`);
    if(!thumbnail) return null;

    if(youtubeBroadcast.data.status.lifeCycleStatus == 'created' && 
       youtubeBind.data.status.lifeCycleStatus == 'ready'){
      //запоминаем данные с youtube 
      broadcastDto.broadcast_product_id = new ObjectId(broadcastDto.broadcast_product_id);
      broadcastDto.broadcast_video_id = youtubeBroadcast.data.id;
      broadcastDto.broadcast_stream_id = youtubeStream.data.id;
      broadcastDto.broadcast_yt_livebroadcast = youtubeBroadcast.data;
      broadcastDto.broadcast_yt_stream = youtubeStream.data.cdn.ingestionInfo;

      const broadcastDb = new this.broadcastModel(broadcastDto);
      const records:any = await broadcastDb.save();

      if(!!records){
        await this.productModel.findOneAndUpdate(
          { _id: new ObjectId(broadcastDto.broadcast_product_id),
            'product_episodes.order': broadcastDto.broadcast_order,
          }, {
          $set:{
            'product_episodes.$.broadcast_id': broadcastDb._id,
            'product_episodes.$.broadcast_video_id': youtubeBroadcast.data.id,
            'product_episodes.$.broadcast_stream_key': youtubeStream.data.cdn.ingestionInfo.streamName,
            'product_episodes.$.broadcast_stream_url': youtubeStream.data.cdn.ingestionInfo.ingestionAddress,
          }
        })

        return broadcastDb;
      }
    }

    return null;
  }

  async deleteBroadcast(broadcast_id: string) {

    await this.checkTokens();

    const brodacast = await this.broadcastModel.findOne({_id: new ObjectId(broadcast_id)}).exec();
    if(!brodacast) return null;

    const deletedRecord = await this.broadcastModel.deleteOne({_id: new ObjectId(broadcast_id)}).exec();
    if(!deletedRecord.ok) return null;

    const product = await this.productModel.findOneAndUpdate({
          _id: brodacast.broadcast_product_id,
          'product_episodes.order': brodacast.broadcast_order,
        }, 
        { $set:{
          'product_episodes.$.broadcast_id': '',
          'product_episodes.$.broadcast_video_id': '',
          'product_episodes.$.broadcast_stream_key': '',
          'product_episodes.$.broadcast_stream_url': '',
      }
      }).exec();

    if(!product) return null;

    var service = google.youtube('v3');

    try{
      const youtubeBroadcast = await service.liveBroadcasts.delete({ auth: this.auth, id: brodacast.broadcast_video_id});
      const youtubeStream = await service.liveStreams.delete({ auth: this.auth, id: brodacast.broadcast_stream_id});
      return true; 
    }
    catch(e){
      return null;
    }
  }

  parseCookies(str) {
    let rx = /([^;=\s]*)=([^;]*)/g;
    let obj = { };
    for ( let m ; m = rx.exec(str) ; )
      obj[ m[1] ] = decodeURIComponent( m[2] );
    return obj;
  }

  async getNewTokens(res: Response) {
      // const youtubeCallback = await this.getCode();
      const tokens = await this.read('./tokens.json');
      const url = `https://youtu.be/CntlnO-CrmI?access_token=${tokens.access_token}`;
      const url2 = `https://youtu.be/watch?v=CntlnO-CrmI&access_token=${tokens.access_token}`;

      console.log(url)

      const response = await got(url, {method: 'get'});
      const data = await response;

      data.headers['set-cookie'].map(cStr=>{
        const cookie:any = this.parseCookies(cStr);

          const entries = Object.entries(cookie);
          const cookieKey:any = entries.splice(0,1)[0];
          const options: CookieOptions = {};
  
          entries.map(e=> options[e[0]] = e[1])
  
          if(!!options.expires)
               options.expires = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);//new Date(options['expires']),
    
               options.httpOnly = true;
               options.secure = true;

          res.cookie(cookieKey[0], cookieKey[1], options);  
      }) 

      // return data.body;
      return `<iframe width="560" height="315" src="${url2}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      
      //.replace('/s/player/9fd4fd09/www-player.css','https://www.youtube.com/s/player/9fd4fd09/www-player.css');
  }

  async checkTokens() {
    let tokens;

    try {
      tokens = await this.read('./tokens.json');
    } catch (r) {}

    if (tokens) {
      this.auth.setCredentials(tokens);
      // console.log('tokens set');
    } else {
      console.log('no tokens set');
    }
  }

  async save(path, str) {
    const writeFilePromise = util.promisify(fs.writeFile);

    await writeFilePromise(path, str);

    // console.log('Successfully Saved');
  }

  async read(path) {
    const readFilePromise = util.promisify(fs.readFile);
    const fileContents = await readFilePromise(path);

    return JSON.parse(fileContents.toString());
  }
}
