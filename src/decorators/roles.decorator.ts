import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: Number[]) => SetMetadata('roles', roles);
