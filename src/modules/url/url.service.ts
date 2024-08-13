import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

export const AMOUNT_OF_UNIQUE_CHARACTERS = 6;

@Injectable()
export class UrlService {
  public static generateUniqueCode() {
    // Get the current timestamp in milliseconds and convert to base-36
    const timestamp = Date.now().toString(36).toUpperCase();

    // Taking the last n characters and pad with zeros if timestamp is shorter than required
    return timestamp.slice(-AMOUNT_OF_UNIQUE_CHARACTERS).padStart(AMOUNT_OF_UNIQUE_CHARACTERS, '0');
  }

  constructor(private prisma: PrismaService) {}

  public async createShortCode(url: string) {
    // Check and return existing
    const exists = await this.findByOriginalUrl(url);
    if (exists) {
      return exists;
    }

    // Create new entry when not existing
    const code = UrlService.generateUniqueCode();
    const saved = await this.prisma.url.create({ data: { id: code, original: url } });

    return saved;
  }

  public async findByCode(code: string) {
    return await this.prisma.url.findUnique({ where: { id: code } });
  }

  private async findByOriginalUrl(url: string) {
    return await this.prisma.url.findUnique({ where: { original: url } });
  }
}

export default UrlService;
