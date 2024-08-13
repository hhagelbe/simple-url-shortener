import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UrlModule } from './modules/url/url.module';
import { PrismaModule } from './prisma/prisma.module';
import constants from './utils/constants';

@Module({
  imports: [ConfigModule.forRoot({ load: [constants], isGlobal: true }), UrlModule, PrismaModule],
  controllers: [],
  providers: []
})
export class AppModule {}
