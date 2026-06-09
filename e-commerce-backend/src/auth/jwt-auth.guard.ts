import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const guestId = request.headers['x-guest-id'];
    const authHeader = request.headers.authorization;

    if (!authHeader && guestId) {
      // Allow guest users via x-guest-id
      request.user = { sub: guestId, role: 'GUEST' };
      return true;
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err, user, info, context) {
    // If user was already set by our canActivate override for guests, use it
    const request = context.switchToHttp().getRequest();
    if (request.user && request.user.role === 'GUEST') {
      return request.user;
    }

    if (err || !user) {
      console.error('JwtAuthGuard: Authentication failed!');
      console.error('Error info:', info?.message || 'No info');
      if (err) console.error('Error detail:', err);
      
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    return user;
  }
}
