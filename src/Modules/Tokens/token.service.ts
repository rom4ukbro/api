import { ExecutionContext, HttpException, HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token } from '@/schemas/token.scheme';
import { User } from '@/schemas/user.scheme';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import * as jwt from 'jsonwebtoken';

@Injectable({scope: Scope.REQUEST})
export class TokenService {
  constructor(
    @InjectModel(Token.name) private readonly tokensModel: Model<Token>,
    @InjectModel(User.name) private readonly usersModel: Model<User>,
    @Inject(REQUEST) private readonly request: Request) {
  }

  extractTokensFromRequest() {
    if(!this.request) return null;

    const acceptToken: string = !!this.request.headers.authorization ? this.request.headers.authorization : '';
    const refreshToken: any = !!this.request.cookies ? this.request.cookies.refreshToken : '';

    return {
      acceptToken: acceptToken,
      refreshToken: refreshToken,
    };
  }

  decryptToken(refreshToken: any): {id, email, role} {
    try {
      return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as any;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  getTokenData(){
    const tokens = this.extractTokensFromRequest();
    if(!tokens || !tokens.refreshToken) return null;

    const tokenData = this.decryptToken(tokens.refreshToken);
    if(!tokenData) return null;

    return tokenData;
  }

  verifyTokens() {
    const tokens = this.extractTokensFromRequest();

    if (!!tokens.acceptToken)
      try {
        return !!jwt.verify(tokens.acceptToken, process.env.ACCEPT_TOKEN_SECRET);
      } catch (err) {
        console.log(err);
        return false;
      }

    if (!!tokens.refreshToken)
      try {
        return !!jwt.verify(tokens.refreshToken, process.env.REFRESH_TOKEN_SECRET);
      } catch (err) {
        console.log(err);
        return false;
      }
  }

  async createTokens(id: string, email: string, role: number) {
    const userUniqData = { id: id, email: email, role: role };
    const refreshMaxAge = Number(process.env.REFRESH_TOKEN_MAX_AGE);
    const acceptMaxAge = Number(process.env.ACCEPT_TOKEN_MAX_AGE);
    const acceptToken: string = jwt.sign(userUniqData, process.env.ACCEPT_TOKEN_SECRET, { expiresIn: acceptMaxAge + 's' });
    const refreshToken: string = jwt.sign(userUniqData, process.env.REFRESH_TOKEN_SECRET, { expiresIn: refreshMaxAge + 's' });
    const newToken = new this.tokensModel({id: id, refreshToken: refreshToken });

    await newToken.save();

    return {
      acceptToken: acceptToken,
      refreshToken: refreshToken,
    };
  }

  async getUserByToken(refreshToken: string): Promise<any> {
    const userData: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    if (!userData.email) return null;

    const fields = [
      '_id',
      'user_token',
      'user_fullname',
      'user_password',
      'user_email',
      'user_phone',
      'user_role',
      'user_description',
    ].join(' ');

    const user = await this.usersModel.findOne({ user_email: userData.email }, fields);

    if (!user)
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);

    return {
      user_id: user._id,
      user_token: user.user_token,
      user_email: user.user_email,
      user_fullname: user.user_fullname,
      user_phone: user.user_phone,
      user_role: user.user_role,
      user_description: user.user_description,
    };
  }

  async getNewTokens(refreshToken: string) {
    if (!refreshToken) return null;

    const userData: any = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    if (!userData.email) return null;

    const tokens = await this.createTokens(
      userData.id,
      userData.email,
      userData.role,
    );

    return tokens;
  }
    
  async deleteToken(refreshToken: string) {
    return await this.tokensModel.deleteOne({ refreshToken });
  }

  async findToken(refreshToken: string) {
    const data = await this.tokensModel.findOneAndDelete({refreshToken: refreshToken});
    return data;
  }
}
