import { Test, TestingModule } from '@nestjs/testing';
import { UrlsService } from '../../src/urls/urls.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Url } from '../../src/urls/entities/url.entity';
import { User } from '../../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AppLogger } from '../../src/common/logger/logger.service';

describe('UrlsService', () => {
  let service: UrlsService;
  let repository: Repository<Url>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        {
          provide: getRepositoryToken(Url),
          useClass: Repository,
        },
        {
          provide: AppLogger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    repository = module.get<Repository<Url>>(getRepositoryToken(Url));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a URL entity', async () => {
      const createUrlDto = { originalUrl: 'http://example.com' };
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      } as User;
      const savedUrl = {
        id: 1,
        originalUrl: 'http://example.com',
        shortUrl: 'abc123',
        user: user,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      };

      jest.spyOn(repository, 'save').mockResolvedValue(savedUrl as any);

      const result = await service.create(createUrlDto, user);
      expect(result).toMatchObject({
        id: expect.any(Number),
        originalUrl: savedUrl.originalUrl,
        shortUrl: expect.any(String),
        clicks: savedUrl.clicks,
        createdAt: expect.any(Date),
        updatedAt: savedUrl.updatedAt,
        deletedAt: savedUrl.deletedAt,
        user: {
          email: user.email,
          id: user.id,
        },
      });
    });
  });

  describe('update', () => {
    it('should update and return a URL entity', async () => {
      const updateUrlDto = { originalUrl: 'http://updated.com' };
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      } as User;
      const existingUrl = {
        id: 1,
        originalUrl: 'http://example.com',
        shortUrl: 'abc123',
        user: user,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const updatedUrl = { ...existingUrl, originalUrl: 'http://updated.com' };

      jest.spyOn(service, 'findOneById').mockResolvedValue(existingUrl as any);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedUrl as any);

      const result = await service.update(existingUrl.id, updateUrlDto, user);
      expect(result).toMatchObject({
        id: updatedUrl.id,
        originalUrl: updatedUrl.originalUrl,
        shortUrl: updatedUrl.shortUrl,
        clicks: updatedUrl.clicks,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: updatedUrl.deletedAt,
        user: {
          email: user.email,
          id: user.id,
        },
      });
    });

    it('should throw NotFoundException if URL is not found', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(null as any);

      await expect(
        service.update(999, { originalUrl: 'http://notfound.com' }, {} as User),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a URL entity', async () => {
      const url: Url = {
        id: 1,
        originalUrl: 'http://example.com',
        shortUrl: 'abc123',
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as Url;

      jest.spyOn(service, 'findOneById').mockResolvedValue(url as any);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ ...url, deletedAt: new Date() } as any);

      await service.remove(1);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      );
    });

    it('should throw NotFoundException if URL is not found', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(null as any);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
