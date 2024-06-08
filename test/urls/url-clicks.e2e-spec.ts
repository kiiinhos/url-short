import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from '../../src/urls/entities/url.entity';
import { User } from '../../src/users/entities/user.entity';

describe('URL Clicks (e2e)', () => {
  let app: INestApplication;
  let urlRepository: Repository<Url>;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    urlRepository = moduleFixture.get<Repository<Url>>(getRepositoryToken(Url));
  });

  afterAll(async () => {
    await app.close();
  });

  it('should count clicks', async () => {
    const userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    const user = userRepository.create({
      email: 'test@example.com',
      password: 'password',
    });
    await userRepository.save(user);

    const shortUrl = generateShortUrl();
    const newUrl = urlRepository.create({
      originalUrl: 'http://example.com',
      shortUrl: shortUrl,
      user: user,
    });
    await urlRepository.save(newUrl);

    const response = await request(app.getHttpServer())
      .get(shortUrl.replace('http://localhost/', ''))
      .expect(302);

    expect(response.header.location).toBe('http://example.com');

    const updatedUrl = await urlRepository.findOne({
      where: { shortUrl: shortUrl },
    });

    if (updatedUrl) {
      expect(updatedUrl.clicks).toBe(1);
    } else {
      fail('URL not found');
    }
  });
});

function generateShortUrl(): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortUrl = '';
  for (let i = 0; i < 6; i++) {
    shortUrl += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }
  return `http://localhost/${shortUrl}`;
}
