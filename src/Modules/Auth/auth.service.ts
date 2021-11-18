
import { Headers, Inject, Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js'

@Injectable()
export class AuthService {
  
  constructor() {}

  // encryptSession(sessionData): string {
    // const tokenMaxAge = Number(process.env.REFRESH_TOKEN_MAX_AGE);
    // const sessionEncoded = encodeURIComponent(CryptoJS.AES.encrypt(sessionData, process.env.COOKIES_SECRET).toString());
    // const sessionCookie = "session" + '=' + encodeURIComponent(sessionEncoded);
    // const sessionExpires = 'expires=' + new Date(Date.now() + Number(process.env.REFRESH_TOKEN_MAX_AGE) * 1000);
    // const cookies = [sessionCookie, sessionExpires].join(';');

    // return sessionEncoded;
  // }

}
