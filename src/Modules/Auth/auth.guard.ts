import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '@/Modules/Tokens/token.service';

// const jwt = require('jsonwebtoken');

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    // const request = context.switchToHttp().getRequest();
    // console.log(request.originalUrl);

    if (!!roles) {
    }

    try {
      const success = this.tokenService.verifyTokens();
      // console.log('access:'+success);
      return success;
    } catch (e) {
      // console.log(e);
      return false;
    }
  }
}
