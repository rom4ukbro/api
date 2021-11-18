import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const jwt = require('jsonwebtoken');

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const roles = this.reflector
      .get<string[]>('roles', context.getHandler())
      .map((i) => i.toString());

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const { userRole } = request.cookies;

    const role = roles.includes(userRole);

    if (!role) throw new ForbiddenException();

    return true;
  }
}
