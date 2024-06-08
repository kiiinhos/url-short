import { createConnection } from 'typeorm';

beforeAll(async () => {
  await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../src/**/*.entity.ts'],
    synchronize: true,
  });
});

afterAll(async () => {
  const connection = await createConnection();
  await connection.close();
});
