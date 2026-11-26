import { describe, expect, it } from 'bun:test';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('returns healthy status when DB env is not set in unit tests', async () => {
    const prevUrl = process.env.DATABASE_URL;
    const prevHost = process.env.DB_HOST;
    delete process.env.DATABASE_URL;
    delete process.env.DB_HOST;

    try {
      const service = new AppService();
      const controller = new AppController(service);
      const res = await controller.getHealth();
      expect(res.ok).toBe(true);
      expect(res.db).toBe('not_configured');
      await service.onModuleDestroy();
    } finally {
      if (prevUrl !== undefined) process.env.DATABASE_URL = prevUrl;
      if (prevHost !== undefined) process.env.DB_HOST = prevHost;
    }
  });
});
