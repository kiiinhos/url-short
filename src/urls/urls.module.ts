import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';
import { Url } from './entities/url.entity';
import { LoggerModule } from '../common/logger/logger.module';
@Module({
  imports: [TypeOrmModule.forFeature([Url]), LoggerModule],
  providers: [UrlsService],
  controllers: [UrlsController],
})
export class UrlsModule {}
