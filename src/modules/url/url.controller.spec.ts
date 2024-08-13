import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { APP_URL } from '../../utils/constants';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';

describe('UrlController', () => {
  let urlController: UrlController;
  let urlService: jest.Mocked<UrlService>;

  beforeEach(async () => {
    // Create a mock version of UrlService
    const mockUrlService = {
      createShortCode: jest.fn(),
      findByCode: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService // Inject the mock service
        }
      ]
    }).compile();

    urlController = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService) as jest.Mocked<UrlService>;
  });

  it('should be defined', () => {
    expect(urlController).toBeDefined();
  });

  describe('createShortUrl', () => {
    it('should create a short URL and return the DTO response', async () => {
      const mockUrlEntry = {
        code: 'XYZ789',
        shortUrl: `${APP_URL}/XYZ789`,
        originalUrl: 'https://example.com'
      };

      // Mock the service method
      urlService.createShortCode.mockResolvedValueOnce(mockUrlEntry);

      const dto = { url: 'https://example.com' };
      const result = await urlController.createShortUrl(dto);

      // Check that the controller returns the correct result
      expect(result).toEqual(mockUrlEntry);

      // Ensure that the service method was called correctly
      expect(urlService.createShortCode).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('getByCode', () => {
    it('should return the original URL based on the short code', async () => {
      const mockUrlEntry = {
        code: 'XYZ789',
        shortUrl: `${APP_URL}/XYZ789`,
        originalUrl: 'https://example.com'
      };

      // Mock the service method
      urlService.findByCode.mockResolvedValueOnce(mockUrlEntry);

      const result = await urlController.getByCode('XYZ789');

      expect(result).toEqual(mockUrlEntry);
      expect(urlService.findByCode).toHaveBeenCalledWith('XYZ789');
    });

    it('should return 404 if the code does not exist', async () => {
      // Mock the service method to return null
      urlService.findByCode.mockResolvedValueOnce(null);

      await expect(urlController.getByCode('NONEXISTENT')).rejects.toThrow(new NotFoundException('Code not found'));
    });
  });

  describe('redirectByCode', () => {
    it('should redirect to the original URL based on the short code', async () => {
      const mockUrlEntry = {
        code: 'XYZ789',
        shortUrl: `${APP_URL}/XYZ789`,
        originalUrl: 'https://example.com'
      };

      const mockResponse = {
        redirect: jest.fn()
      } as unknown as Response;

      urlService.findByCode.mockResolvedValueOnce(mockUrlEntry);

      await urlController.redirectByCode('XYZ789', mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith(HttpStatus.FOUND, 'https://example.com');
      expect(urlService.findByCode).toHaveBeenCalledWith('XYZ789');
    });

    it('should return a 404 error if the short code does not exist', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn()
      } as unknown as Response;

      urlService.findByCode.mockResolvedValueOnce(null);

      await urlController.redirectByCode('ABCDEF', mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not Found', message: 'URL not found', statusCode: 404 });
    });

    it('should return a 500 error if an internal server error occurs', async () => {
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn()
      } as unknown as Response;

      // Simulate an error being thrown by the service
      urlService.findByCode.mockRejectedValueOnce(new Error('Internal Server Error'));

      await urlController.redirectByCode('XYZ789', mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Error during redirection',
        statusCode: 500
      });
    });
  });
});
