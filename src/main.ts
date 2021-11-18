import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { raw, urlencoded, json } from 'express';
import { WsAdapter } from './Modules/Stream/ws.adapter';
// import { WsAdapter } from '@nestjs/platform-ws';

const cookieParser = require('cookie-parser');

var whitelist = [
  'http://localhost:4000',
  'https://tochkarosta.info',
  'chrome-extension://',
];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(json({ limit: '20mb' }));
  app.use(raw({ limit: '20mb' }));
  app.use(urlencoded({ limit: '20mb', extended: true }));
  app.use(cookieParser());
  app.useStaticAssets('./static/');
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useStaticAssets(`${process.env.APP_FILES}`);

  app.enableCors({
    origin: function (origin, callback) {
      callback(null, true);

      // console.log('request from : '+origin);

      // if (!origin || whitelist.some(host => new RegExp(`/^${host}/gi`).test(origin))) {
      //   callback(null, true)
      // } else {
      //   console.log(origin + ' - ' + 'Not allowed by CORS');
      //   callback(null, false);//new Error('Not allowed by CORS'))
      // }
    },
    exposedHeaders:
      'Access-Control-Allow-Origin, Content-Type, Date, Link, Server, X-Application-Context, X-Total-Count',
    allowedHeaders:
      'Authorization, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Cookie',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Academy API')
    .setDescription('Academy API documentation')
    .setVersion('1.0')
    .addTag('default')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
