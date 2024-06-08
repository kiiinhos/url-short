import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config as dotenvConfig } from 'dotenv';
import { version } from 'process';
import { satisfies } from 'semver';
import { AppLogger } from './common/logger/logger.service';
import '../tracing';

async function bootstrap() {
  dotenvConfig();

  const requiredVersion = '>=14.0.0 <18.0.0';
  if (!satisfies(version, requiredVersion)) {
    throw new Error(
      `A versão do Node.js deve ser ${requiredVersion}. Versão atual: ${version}`,
    );
  }

  const app = await NestFactory.create(AppModule);
  const logger = app.get(AppLogger);

  const config = new DocumentBuilder()
    .setTitle('API de Encurtamento de URLs')
    .setDescription('A API para encurtar URLs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  logger.log('Aplicação está rodando na porta 3000');
}
bootstrap();
