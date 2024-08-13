import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { Response } from 'express';

import { UrlService } from './url.service';
import CreateShortUrlDto from './dto/url.create.dto';
import UrlDto from './dto/url.dto';
import { CodeValidationPipe } from './pipes/url.code-validation.pipe';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('shorten')
  public async createShortUrl(@Body() dto: CreateShortUrlDto): Promise<UrlDto> {
    const entry = await this.urlService.createShortCode(dto.url);

    return entry;
  }

  @Get('original')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async getByCode(@Query('code', CodeValidationPipe) code: string): Promise<UrlDto> {
    const entry = await this.urlService.findByCode(code);

    if (!entry) {
      throw new NotFoundException('Code not found');
    }

    return entry;
  }

  @Get(':code')
  public async redirectByCode(@Param('code', CodeValidationPipe) code: string, @Res() response: Response) {
    try {
      const entry = await this.urlService.findByCode(code);

      if (!entry) {
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'URL not found',
          error: 'Not Found'
        });
      }

      return response.redirect(HttpStatus.FOUND, entry.originalUrl);
    } catch (error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error during redirection',
        error: 'Internal Server Error'
      });
    }
  }
}
