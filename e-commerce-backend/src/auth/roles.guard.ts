import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    // In Supabase JWT, roles are often in user_metadata or app_metadata
    // For this implementation, we assume the user object has been enriched or the payload has it.
    // Usually, you'd fetch the user role from your database based on the UUID in the token.
    return requiredRoles.some((role) => user.role === role);
  }
}
