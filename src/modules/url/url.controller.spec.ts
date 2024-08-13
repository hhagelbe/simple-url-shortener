import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { APP_URL } from '../../utils/constants';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';

describe('UrlController', () => {
  let urlController: UrlController;
  let urlService: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: {
            createShortCode: jest.fn(),
            findByCode: jest.fn(),
            findByShortCode: jest.fn()
          }
        }
      ]
    }).compile();

    urlController = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(urlController).toBeDefined();
  });

  describe('createShortUrl', () => {
    it('should create a short URL and return the DTO response', async () => {
      const mockUrlEntry = {
        id: 'XYZ789',
        original: 'https://example.com',
        createdAt: new Date()
      };
      jest.spyOn(urlService, 'createShortCode').mockResolvedValueOnce(mockUrlEntry);

      const dto = { url: 'https://example.com' };
      const result = await urlController.createShortUrl(dto);

      expect(result).toEqual({
        code: 'XYZ789',
        shortUrl: `${APP_URL}/XYZ789`,
        originalUrl: 'https://example.com'
      });

      expect(urlService.createShortCode).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('getByCode', () => {
    it('should return the original URL based on the short code', async () => {
      const mockUrlEntry = {
        id: 'XYZ789',
        original: 'https://example.com',
        createdAt: new Date()
      };

      jest.spyOn(urlService, 'findByCode').mockResolvedValueOnce(mockUrlEntry);

      const result = await urlController.getByCode('XYZ789');

      expect(result).toEqual({
        code: 'XYZ789',
        shortUrl: `${APP_URL}/XYZ789`,
        originalUrl: 'https://example.com'
      });

      expect(urlService.findByCode).toHaveBeenCalledWith('XYZ789');
    });

    it('should return 404 if the code does not exist', async () => {
      jest.spyOn(urlService, 'findByCode').mockResolvedValueOnce(null);

      // Use `expect` to check if the function throws the correct exception
      await expect(urlController.getByCode('NONEXISTENT')).rejects.toThrow(new NotFoundException('Code not found'));
    });
  });

  describe('redirectByCode', () => {
    it('should redirect to the original URL based on the short code', async () => {
      const mockUrlEntry = {
        id: 'XYZ789',
        original: 'https://example.com',
        createdAt: new Date()
      };

      const mockResponse = {
        redirect: jest.fn()
      } as unknown as Response;

      jest.spyOn(urlService, 'findByCode').mockResolvedValueOnce(mockUrlEntry);

      await urlController.redirectByCode('XYZ789', mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(HttpStatus.FOUND, 'https://example.com');
      expect(urlService.findByCode).toHaveBeenCalledWith('XYZ789');
    });

    it('should return a 404 error if the short code does not exist', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      } as unknown as Response;

      jest.spyOn(urlService, 'findByCode').mockResolvedValueOnce(null);

      await urlController.redirectByCode('NONEXISTENT', mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.send).toHaveBeenCalledWith('URL not found');
    });
  });
});
