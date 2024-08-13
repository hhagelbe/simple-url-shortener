import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';
import { AMOUNT_OF_UNIQUE_CODE_CHARACTERS, APP_URL } from '../../utils/constants';
import { UrlService } from './url.service';

describe('UrlService', () => {
  let urlService: UrlService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: PrismaService,
          useValue: {
            url: {
              findUnique: jest.fn(),
              create: jest.fn()
            }
          }
        }
      ]
    }).compile();

    urlService = module.get<UrlService>(UrlService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(urlService).toBeDefined();
  });

  describe('generateUniqueCode', () => {
    it('should generate a unique code with the correct length', () => {
      const code = UrlService.generateUniqueCode();
      expect(code).toHaveLength(AMOUNT_OF_UNIQUE_CODE_CHARACTERS);
      expect(typeof code).toBe('string');
    });

    it('should pad with zeros if the timestamp is shorter than the required length', () => {
      const mockTimestamp = 1000;
      const expectedBase36 = mockTimestamp.toString(36).toUpperCase();

      const originalDateNow = Date.now;
      Date.now = jest.fn(() => mockTimestamp);

      const code = UrlService.generateUniqueCode();
      expect(code).toEqual(expectedBase36.padStart(6, '0'));

      // Restore original Date.now
      Date.now = originalDateNow;
    });
  });

  describe('createShortCode', () => {
    it('should return an existing short code if the URL already exists', async () => {
      const existingUrl = { id: 'ABC123', original: 'https://example.com', createdAt: new Date() };
      jest.spyOn(prismaService.url, 'findUnique').mockResolvedValueOnce(existingUrl);

      const result = await urlService.createShortCode('https://example.com');
      expect(result).toEqual({
        code: 'ABC123',
        originalUrl: 'https://example.com',
        shortUrl: `${APP_URL}/ABC123`
      });
      expect(prismaService.url.findUnique).toHaveBeenCalledWith({
        where: { original: 'https:&#x2F;&#x2F;example.com' }
      });
    });

    it('should create and return a new short code if the URL does not exist', async () => {
      const createdAt = new Date();

      // Mock the findUnique method to return null, indicating the URL does not exist.
      jest.spyOn(prismaService.url, 'findUnique').mockResolvedValueOnce(null);

      // Mock the generateUniqueCode method to return a consistent value.
      const mockCode = 'XYZ789';
      jest.spyOn(UrlService, 'generateUniqueCode').mockReturnValue(mockCode);

      // Mock the create method to return the expected object.
      jest.spyOn(prismaService.url, 'create').mockResolvedValueOnce({
        id: mockCode,
        original: 'https://newexample.com',
        createdAt
      });

      // Call the createShortCode method and assert the result.
      const result = await urlService.createShortCode('https://newexample.com');
      expect(result).toEqual({ code: 'XYZ789', originalUrl: 'https://newexample.com', shortUrl: `${APP_URL}/XYZ789` });

      // Ensure the create method was called with the expected arguments.
      expect(prismaService.url.create).toHaveBeenCalledWith({
        data: { id: mockCode, original: 'https:&#x2F;&#x2F;newexample.com' }
      });
    });
  });

  describe('findByCode', () => {
    it('should return the correct URL DTO if the code exists', async () => {
      const mockUrlEntry = { id: 'XYZ789', original: 'https://example.com', createdAt: new Date() };
      jest.spyOn(prismaService.url, 'findUnique').mockResolvedValueOnce(mockUrlEntry);

      const result = await urlService.findByCode('XYZ789');
      expect(result).toEqual({
        code: 'XYZ789',
        shortUrl: `${APP_URL}/XYZ789`,
        originalUrl: 'https://example.com'
      });

      expect(prismaService.url.findUnique).toHaveBeenCalledWith({ where: { id: 'XYZ789' } });
    });

    it('should return null if the code does not exist', async () => {
      jest.spyOn(prismaService.url, 'findUnique').mockResolvedValueOnce(null);

      const result = await urlService.findByCode('NONEXISTENT');
      expect(result).toBeNull();

      expect(prismaService.url.findUnique).toHaveBeenCalledWith({ where: { id: 'NONEXISTENT' } });
    });
  });
});
