import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { prismaService } from '../../../test/setupTests.e2e';
import { PrismaService } from '../../prisma/prisma.service';
import { UrlController } from './url.controller';
import UrlService from './url.service';

describe('UrlController (e2e)', () => {
  let controller: UrlController;
  let urlService: UrlService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [UrlService, PrismaService]
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();

    controller = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService);
    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /shorten', () => {
    it('should create and return a short URL', async () => {
      const response = await request(app.getHttpServer())
        .post('/shorten')
        .send({ url: 'https://example1.com' })
        .expect(201);

      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('shortUrl');
      expect(response.body).toHaveProperty('originalUrl', 'https://example1.com');
    });
  });

  describe('GET /original', () => {
    it('should return the original URL given a valid short code', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/shorten')
        .send({ url: 'https://example2.com' })
        .expect(HttpStatus.CREATED);

      const code = createResponse.body.code;

      const getResponse = await request(app.getHttpServer()).get('/original').query({ code }).expect(HttpStatus.OK);

      expect(getResponse.body).toEqual(createResponse.body);
    });

    it('should return 400 if the code is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/original')
        .query({ code: 'short' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Invalid code format');
    });

    it('should return 404 if the short code does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/original')
        .query({ code: 'ABCDEF' })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toEqual({ error: 'Not Found', message: 'Code not found', statusCode: 404 });
    });
  });

  describe('GET /:code', () => {
    it('should redirect to the original URL given a valid short code', async () => {
      // First, create a short URL
      const createResponse = await request(app.getHttpServer()).post('/shorten').send({ url: 'https://example3.com' });

      const code = createResponse.body.code;

      // Now, test the redirection
      await request(app.getHttpServer()).get(`/${code}`).expect(302).expect('Location', 'https://example3.com');
    });

    it('should return 404 if the short code does not exist', async () => {
      await request(app.getHttpServer())
        .get('/ABCDEF')
        .expect(HttpStatus.NOT_FOUND)
        .expect('Content-Type', /json/)
        .expect({ statusCode: 404, message: 'URL not found', error: 'Not Found' });
    });

    it('should return 400 if the code is invalid', async () => {
      await request(app.getHttpServer())
        .get('/original')
        .query({ code: 'short' })
        .expect('Content-Type', /json/)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({ statusCode: 400, message: 'Invalid code format', error: 'Bad Request' });
    });

    it('should return 500 if there is an internal server error', async () => {
      jest.spyOn(urlService, 'findByCode').mockRejectedValueOnce(new Error('Database error'));

      await request(app.getHttpServer())
        .get('/ABCDEF')
        .expect(HttpStatus.INTERNAL_SERVER_ERROR)
        .expect('Content-Type', /json/)
        .expect({ statusCode: 500, message: 'Error during redirection', error: 'Internal Server Error' });
    });
  });
});
