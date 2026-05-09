import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(configService: ConfigService, private prisma: PrismaService) {
    const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: (req: any) => {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (token) {
          try {
            const decoded = jwt.decode(token, { complete: true }) as any;
            console.log('SupabaseStrategy: Validating Token. Alg:', decoded?.header?.alg, 'Aud:', decoded?.payload?.aud);
          } catch (e) {}
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      algorithms: ['HS256'],
      audience: 'authenticated',
    });
  }

  async validate(payload: any) {
    console.log('SupabaseStrategy: SUCCESS! User validated:', payload.sub);
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    
    // Return payload merged with the user's database role
    return { ...payload, role: user?.role || 'USER' };
  }
}
