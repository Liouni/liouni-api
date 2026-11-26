import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const corsOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (corsOrigins.length > 0) {
    app.enableCors({
      origin: corsOrigins,
      credentials: true,
    });
  }

  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? (process.env.NODE_ENV === 'test' ? '127.0.0.1' : undefined);
  if (host) {
    await app.listen(port, host);
  } else {
    await app.listen(port);
  }
}

void bootstrap();
