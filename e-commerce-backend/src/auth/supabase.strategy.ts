import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  private supabase: SupabaseClient;

  constructor(configService: ConfigService, private prisma: PrismaService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not defined');
    }

    // Initialize the Supabase client
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      // We pass a dummy secret because the actual verification happens in the validate() method
      secretOrKey: 'SUPABASE_EXTERNAL_VERIFICATION',
    });
  }

  async validate(req: any, payload: any) {
    // Extract the token manually from the request
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Ask Supabase to verify the token and get the user
    const { data: { user: authUser }, error } = await this.supabase.auth.getUser(token);

    if (error || !authUser) {
      console.error('Supabase Auth Error:', error?.message);
      throw new UnauthorizedException(error?.message || 'Invalid Supabase token');
    }

    // Now that we know the token is valid, get the user from our local database
    const user = await this.prisma.user.findUnique({ where: { id: authUser.id } });

    // Return the user with their role
    return { ...authUser, role: user?.role || 'USER' };
  }
}
