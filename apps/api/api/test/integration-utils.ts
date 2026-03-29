import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import type { Connection } from 'mongoose';
import { AppModule } from '../src/app.module';

export class TestContext {
  public app: INestApplication;
  public db: Connection;

  async setup() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          if (key === 'MONGO_URI') {
            return (
              process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/barber_reservation_test'
            );
          }
          if (key === 'JWT_SECRET') {
            return 'test-secret';
          }
          // fallback to original or other mock values if needed
          return process.env[key];
        },
      })
      .compile();

    this.app = moduleFixture.createNestApplication();
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    this.db = this.app.get(getConnectionToken());
    await this.app.init();
    await this.cleanup();
  }

  async cleanup() {
    if (this.db) {
      const collections = this.db.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  }

  async close() {
    if (this.app) {
      await this.app.close();
    }
  }
}
