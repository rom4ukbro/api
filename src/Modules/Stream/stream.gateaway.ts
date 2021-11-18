import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WsResponse } from '@nestjs/websockets';
import { OnGatewayInit } from '@nestjs/websockets';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

const spawn = require('child_process').spawn;

@WebSocketGateway(81, { 
    path: '/rtmp',
    transports: ['websocket'] 
})
export class StreamGateaway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;
  
    private logger: Logger = new Logger('WebSocketServer');
    private ffmpeg: any;
   
    @SubscribeMessage('*')
    handleMessage(client: Socket, payload: string): void {

          if (Buffer.isBuffer(payload)) {
            // console.log('this is some video data');
            this.ffmpeg.stdin.write(payload);
          } 
          else {
            console.log("LOG:"+payload);
          }
    }
   
    afterInit(server: Server) {
     this.logger.log('Init');
    }
   
    handleDisconnect(client: Socket) {
     this.logger.log(`Client disconnected: ${client.id}`);
     this.ffmpeg.kill('SIGINT');
    }
   
    handleConnection(client: Socket, ...args: any[]) 
    {
        console.log('Streaming socket connected');
        this.logger.log(`Client connected: ${client.id}`); 
        this.ffmpeg = this.execFFMPEG();
    }

    execFFMPEG(){
      const ws = this.server;
      // const rtmpUrl = 'd:\\111111.flv';
      const rtmpUrl = 'rtmp://a.rtmp.youtube.com/live2/kk09-zxs6-26da-y8z7-asrc';
      // const rtmpUrl = 'rtmp://localhost:1935/live/1234';

      // ffmpeg -re -i - -c copy -f flv rtmp://localhost/live/STREAM_NAME

      // const ffmpeg = spawn('ffmpeg', [
      //   '-re', '-i', '-', '-flags', '+global_header', '-t', '-c', 'copy', '-an', '-f', 'flv', rtmpUrl
      // ]);
      
      // const ffmpeg = spawn('ffmpeg', [
      //   '-i','-',
      //   '-c:v','libx264','-preset','medium',
      //   '-b:v','3000k','-maxrate','3000k','-bufsize','6000k',
      //   '-c:a','aac',
      //   '-b:a','128k',
      //   '-pix_fmt', 'yuv420p', '-g', '50',
      //   '-ac','2',
      //   '-ar','44100',
      //   '-f','flv',
      //   rtmpUrl
      // ]);

      // const ffmpeg = spawn('ffmpeg', [
      //   '-i','-','-pix_fmt','yuv420p','-deinterlace','-vf','scale=640:360','-vsync','1','-threads','0','-vcodec','libx264','-r','29.970','-g','30','-sc_threshold','0','-b:v','1024k','-bufsize','1216k','-maxrate','1280k','-preset','medium','-profile:v','main','-tune','film','-acodec','aac','-b:a','128k','-ac','2','-ar','48000','-af','aresample=async=1:min_hard_comp=0.100000:first_pts=0','-vbsf','h264_mp4toannexb','-f','flv', rtmpUrl]);

      const ffmpeg = spawn('ffmpeg', [
        // '-re',
        '-i','-','-rtbufsize','100M','-framerate','30','-probesize','10M',
        '-c:v', 'copy',
        // '-c:v','libx264','-r','25','-preset','ultrafast','-tune','zerolatency', '-crf','100','-pix_fmt','yuv420p',
        '-c:a', 'aac',
        // '-c:a', 'aac', '-strict', '-2', '-ar', '44100', '-b:a', '64k',
        // '-use_wallclock_as_timestamps', '1',
        // '-async', '1',        
        '-f','flv',
         rtmpUrl,
        ]);

      ffmpeg.on('close', (code, signal) => {
        console.log('FFmpeg child process closed, code ' + code + ', signal ' + signal);
      });
  
      // Handle STDIN pipe errors by logging to the console.
      // These errors most commonly occur when FFmpeg closes and there is still
      // data to write.f If left unhandled, the server will crash.
      ffmpeg.stdin.on('error', (e) => {
        console.log('FFmpeg STDIN Error', e);
      });
  
      // FFmpeg outputs all of its messages to STDERR. Let's log them to the console.
      ffmpeg.stderr.on('data', (data) => {
        // ws.send('ffmpeg got some data');
        console.log(data.toString());
        // console.log('FFmpeg STDERR:', data.toString());
      }); 

      
      return ffmpeg;
    }
}
