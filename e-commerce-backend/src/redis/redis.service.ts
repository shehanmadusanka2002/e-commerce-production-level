import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL!, {
      tls: {}, // Required for Upstash TLS
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.client.on('connect', () => this.logger.log('✅ Redis connected'));
    this.client.on('error', (err) => this.logger.error('Redis error:', err.message));
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (e) {
      this.logger.warn('Redis set failed:', e.message);
    }
  }

  async del(...keys: string[]): Promise<void> {
    try {
      await this.client.del(...keys);
    } catch (e) {
      this.logger.warn('Redis del failed:', e.message);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (e) {
      this.logger.warn('Redis delPattern failed:', e.message);
    }
  }
}
