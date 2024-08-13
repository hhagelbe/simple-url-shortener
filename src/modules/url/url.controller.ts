import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Url } from '@prisma/client';

import { UrlService } from './url.service';
import CreateShortUrlDto from './dto/url.create.dto';
import GetUrlDto from './dto/url.get.dto';
import { APP_URL } from '../../utils/constants';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  public async createShortUrl(@Body() dto: CreateShortUrlDto): Promise<GetUrlDto> {
    const entry = await this.urlService.createShortCode(dto.url);

    return this.toApiResponse(entry);
  }

  @Get('original')
  public async getByCode(@Query('code') code: string): Promise<GetUrlDto> {
    const entry = await this.urlService.findByCode(code);

    if (!entry) {
      throw new NotFoundException('Code not found');
    }

    return this.toApiResponse(entry);
  }

  @Get(':code')
  public async redirectByCode(@Param('code') code: string, @Res() response: Response) {
    const entry = await this.urlService.findByCode(code);

    if (!entry) {
      return response.status(HttpStatus.NOT_FOUND).send('URL not found');
    }

    return response.redirect(HttpStatus.FOUND, entry.original);
  }

  private toApiResponse(entry: Url) {
    return {
      code: entry.id,
      shortUrl: `${APP_URL}/${entry.id}`,
      originalUrl: entry.original
    };
  }
}
