import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

function ensureEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`A variável de ambiente ${name} não está definida`);
  }
  return value;
}

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: ensureEnvVar('DB_HOST'),
  port: parseInt(ensureEnvVar('DB_PORT'), 10),
  username: ensureEnvVar('DB_USERNAME'),
  password: ensureEnvVar('DB_PASSWORD'),
  database: ensureEnvVar('DB_NAME'),
  autoLoadEntities: true,
  synchronize: true,
};
