import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const url = configService.get<string>('DATABASE_URL');
    const pool = new Pool({ connectionString: url });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();

    // Auto-seed admin user on application start
    try {
      const adminEmail = 'admin@gmail.com';
      // I generated a new random placeholder ID for this new email!
      // IMPORTANT: Replace this with the real Supabase Auth UID for admin@gmail.com later.
      const adminSupabaseId = '8d2a7e8d-fcaa-4cb9-aca3-bba65dcfc15e';

      await this.user.upsert({
        where: { email: adminEmail },
        update: {
          role: 'ADMIN',
          id: adminSupabaseId
        },
        create: {
          id: adminSupabaseId,
          email: adminEmail,
          fullName: 'admin',
          role: 'ADMIN',
        },
      });
      console.log(`[Database] Auto-admin ensured for ${adminEmail}`);
    } catch (error) {
      console.error('[Database] Failed to auto-seed admin:', error.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
