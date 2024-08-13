import { Injectable } from '@nestjs/common';
import { Url } from '@prisma/client';
import { escape, unescape } from 'validator';

import { PrismaService } from '../../prisma/prisma.service';
import { AMOUNT_OF_UNIQUE_CODE_CHARACTERS, APP_URL } from '../../utils/constants';
import UrlDto from './dto/url.dto';

@Injectable()
export class UrlService {
  public static generateUniqueCode() {
    // Get the current timestamp in milliseconds and convert to base-36
    const timestamp = Date.now().toString(36).toUpperCase();

    // Taking the last n characters and pad with zeros if timestamp is shorter than required
    return timestamp.slice(-AMOUNT_OF_UNIQUE_CODE_CHARACTERS).padStart(AMOUNT_OF_UNIQUE_CODE_CHARACTERS, '0');
  }

  constructor(private prisma: PrismaService) {}

  public async createShortCode(url: string) {
    // Sanitize URL input
    const sanitizedUrl = escape(url);

    // Check and return existing
    const exists = await this.prisma.url.findUnique({ where: { original: sanitizedUrl } });
    if (exists) {
      return this.toUrlDto(exists);
    }

    // Create new entry when not existing
    const code = UrlService.generateUniqueCode();
    const saved = await this.prisma.url.create({ data: { id: code, original: sanitizedUrl } });

    return this.toUrlDto(saved);
  }

  public async findByCode(code: string) {
    const entry = await this.prisma.url.findUnique({ where: { id: code } });

    return this.toUrlDto(entry);
  }

  private toUrlDto(entry?: Url): UrlDto | null {
    return entry
      ? {
          code: entry.id,
          shortUrl: `${APP_URL}/${entry.id}`,
          // Convert to original url
          originalUrl: unescape(entry.original)
        }
      : null;
  }
}

export default UrlService;
