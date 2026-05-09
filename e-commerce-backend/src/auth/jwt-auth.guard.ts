import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase') {
  handleRequest(err, user, info) {
    // 'info' contains the specific error message if validation fails
    if (err || !user) {
      console.error('JwtAuthGuard: Authentication failed!');
      console.error('Error info:', info?.message || 'No info');
      if (err) console.error('Error detail:', err);
      
      throw err || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    return user;
  }
}
