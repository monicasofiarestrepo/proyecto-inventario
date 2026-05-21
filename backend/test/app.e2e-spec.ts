import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';

describe('Inventory API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      console.warn('Skipping e2e: DATABASE_URL not set');
      return;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /products returns array', async () => {
    if (!process.env.DATABASE_URL) return;

    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /products validates empty name', async () => {
    if (!process.env.DATABASE_URL) return;

    await request(app.getHttpServer())
      .post('/products')
      .send({ name: '', unitMeasure: 'unidades', category: 'x', minStock: 0 })
      .expect(400);
  });
});
