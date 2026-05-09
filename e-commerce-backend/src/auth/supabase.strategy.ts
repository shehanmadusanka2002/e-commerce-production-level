import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import * as https from 'https';
import * as crypto from 'crypto';

// Simple in-memory JWKS cache
let jwksCache: { keys: any[]; fetchedAt: number } | null = null;

async function fetchJwks(supabaseUrl: string): Promise<any[]> {
  // Return cached keys if fresh (10 min)
  if (jwksCache && Date.now() - jwksCache.fetchedAt < 600000) {
    return jwksCache.keys;
  }

  return new Promise((resolve, reject) => {
    const url = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          jwksCache = { keys: parsed.keys, fetchedAt: Date.now() };
          resolve(parsed.keys);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function jwkToPem(jwk: any): string {
  // Convert a JWK (EC or RSA) to a PEM public key using Node crypto
  const keyObject = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  return keyObject.export({ type: 'spki', format: 'pem' }) as string;
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private readonly supabaseUrl: string;
  private readonly jwtSecret: string | undefined;

  constructor(private configService: ConfigService, private prisma: PrismaService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const decoded = jwt.decode(rawJwtToken, { complete: true }) as any;
          const alg = decoded?.header?.alg;
          const kid = decoded?.header?.kid;

          console.log(`SupabaseStrategy: Token alg=${alg}, kid=${kid}`);

          if (alg === 'HS256') {
            // Symmetric JWT secret
            const secret = configService.get<string>('SUPABASE_JWT_SECRET');
            if (!secret) return done(new Error('SUPABASE_JWT_SECRET not configured in environment'));
            return done(null, secret);
          } else {
            // Asymmetric: fetch JWKS and find matching key
            const keys = await fetchJwks(supabaseUrl);
            const signingKey = keys.find((k) => k.kid === kid);
            if (!signingKey) {
              return done(new Error(`No matching JWKS key found for kid: ${kid}`));
            }
            const pem = jwkToPem(signingKey);
            return done(null, pem);
          }
        } catch (err) {
          console.error('SupabaseStrategy secretOrKeyProvider error:', err);
          return done(err);
        }
      },
    });

    this.supabaseUrl = supabaseUrl;
    this.jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');
  }

  async validate(payload: any) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    console.log('SupabaseStrategy: Token validated for user:', payload.sub);

    // Fetch user role from the database
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

    return { ...payload, role: user?.role || 'USER' };
  }
}
