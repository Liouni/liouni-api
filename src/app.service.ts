import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

export interface HealthResult {
  ok: boolean;
  service: string;
  db: 'connected' | 'not_configured' | 'error';
  timestamp: string;
}

@Injectable()
export class AppService implements OnModuleDestroy {
  private readonly logger = new Logger(AppService.name);
  private readonly pool: Pool | null;

  constructor() {
    this.pool = this.createPool();
  }

  private createPool(): Pool | null {
    const connectionString = process.env.DATABASE_URL;
    const host = process.env.DB_HOST;
    if (!connectionString && !host) {
      return null;
    }

    const useSsl = process.env.DB_SSL === 'true' || Boolean(connectionString?.includes('sslmode=require'));
    const ssl = useSsl ? { rejectUnauthorized: false } : false;

    if (connectionString) {
      return new Pool({ connectionString, ssl, max: 5, connectionTimeoutMillis: 5000 });
    }

    return new Pool({
      host,
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl,
      max: 5,
      connectionTimeoutMillis: 5000,
    });
  }

  async getHealth(): Promise<HealthResult> {
    const timestamp = new Date().toISOString();
    if (!this.pool) {
      return { ok: true, service: 'liouni-api', db: 'not_configured', timestamp };
    }

    try {
      await this.pool.query('SELECT 1');
      return { ok: true, service: 'liouni-api', db: 'connected', timestamp };
    } catch (error) {
      this.logger.error('Database healthcheck failed', error instanceof Error ? error.message : String(error));
      return { ok: false, service: 'liouni-api', db: 'error', timestamp };
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
