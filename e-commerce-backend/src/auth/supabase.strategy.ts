import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(configService: ConfigService, private prisma: PrismaService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const anonKey = configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !anonKey) {
      throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not defined');
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
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
        requestHeaders: {
          apikey: anonKey
        },
        handleSigningKeyError: (err) => {
          if (err) console.error('SupabaseStrategy: JWKS Key Fetch Error:', err.message);
        }
      }),
      algorithms: ['ES256', 'HS256'],
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
