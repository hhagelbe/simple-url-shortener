import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';

@Module({
  imports: [PrismaModule],
  providers: [UrlService],
  controllers: [UrlController]
})
export class UrlModule {}
