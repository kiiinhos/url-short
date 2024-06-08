import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const isObservabilityEnabled = process.env.OBSERVABILITY_ENABLED === 'true';

    const transports: winston.transport[] = [new winston.transports.Console()];

    if (isObservabilityEnabled) {
      const esTransportOpts = {
        level: 'info',
        clientOpts: {
          node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        },
      };
      transports.push(new ElasticsearchTransport(esTransportOpts));
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: transports,
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message, { trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  verbose(message: string) {
    this.logger.verbose(message);
  }
}
