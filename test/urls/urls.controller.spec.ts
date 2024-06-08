import { Test, TestingModule } from '@nestjs/testing';
import { UrlsController } from '../../src/urls/urls.controller';
import { UrlsService } from '../../src/urls/urls.service';
import { CreateUrlDto } from '../../src/urls/dto/create-url.dto';
import { AppLogger } from '../../src/common/logger/logger.service';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { UrlAuthGuard } from '../../src/auth/url-auth-guard';
import { User } from '../../src/users/entities/user.entity';
import { Url } from '../../src/urls/entities/url.entity';
import { NotFoundException } from '@nestjs/common';

describe('UrlsController', () => {
  let controller: UrlsController;
  let service: UrlsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [
        {
          provide: UrlsService,
          useValue: {
            create: jest.fn(),
            findAllByUser: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            redirectToOriginalUrl: jest.fn(),
          },
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

    controller = module.get<UrlsController>(UrlsController);
    service = module.get<UrlsService>(UrlsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a URL entity', async () => {
      const createUrlDto: CreateUrlDto = { originalUrl: 'http://example.com' };
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn(),
      };
      const url: Url = {
        id: 1,
        originalUrl: 'http://example.com',
        shortUrl: 'abc123',
        user,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(service, 'create').mockResolvedValue(url);

      const result = await controller.create(createUrlDto, { user });
      expect(result).toEqual({
        id: url.id,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        user: { id: user.id, email: user.email },
        clicks: url.clicks,
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
        deletedAt: url.deletedAt,
      });
    });
  });

  describe('findAll', () => {
    it('should return all URLs for a user', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn(),
      };
      const urls: Url[] = [
        {
          id: 1,
          originalUrl: 'http://example.com',
          shortUrl: 'abc123',
          user,
          clicks: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      jest.spyOn(service, 'findAllByUser').mockResolvedValue(urls);

      const result = await controller.findAll({ user });
      expect(result).toEqual(urls);
    });
  });

  describe('update', () => {
    it('should update and return a URL entity', async () => {
      const createUrlDto: CreateUrlDto = { originalUrl: 'http://example.org' };
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn(),
      };
      const url: Url = {
        id: 1,
        originalUrl: 'http://example.org',
        shortUrl: 'abc123',
        user,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest.spyOn(service, 'update').mockResolvedValue(url);

      const result = await controller.update(url.id, createUrlDto, { user });
      expect(result).toEqual(url);
    });
  });

  describe('remove', () => {
    it('should delete a URL entity and return a success message', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue();

      const result = await controller.remove(1);
      expect(result).toEqual({ message: 'URL deletada com sucesso.' });
    });
  });

  describe('redirect', () => {
    it('should redirect to the original URL', async () => {
      const res = {
        redirect: jest.fn(),
      };
      const url: Url = {
        id: 1,
        originalUrl: 'http://example.com',
        shortUrl: 'abc123',
        user: null,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      jest
        .spyOn(service, 'redirectToOriginalUrl')
        .mockResolvedValue(url.originalUrl);

      await controller.redirect('abc123', res as any);
      expect(res.redirect).toHaveBeenCalledWith(url.originalUrl);
    });

    it('should throw NotFoundException if URL is not found', async () => {
      const res = {
        redirect: jest.fn(),
      };
      jest
        .spyOn(service, 'redirectToOriginalUrl')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.redirect('abc123', res as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
