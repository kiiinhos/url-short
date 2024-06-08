import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '../../src/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: async () => {},
      };

      const updateUserDto = {
        email: 'updated@example.com',
        password: 'newPassword',
      };

      const updatedUser: User = {
        ...user,
        email: updateUserDto.email,
        password: await bcrypt.hash(updateUserDto.password, 10),
        hashPassword: user.hashPassword,
      };

      const updateResult: UpdateResult = {
        affected: 1,
        raw: [],
        generatedMaps: [],
      };

      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(updatedUser);
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

      const result = await service.update(user.id, updateUserDto);
      expect(result).toMatchObject({
        id: 1,
        email: 'updated@example.com',
        isActive: true,
        createdAt: user.createdAt,
        updatedAt: result.updatedAt,
      });
      expect(await bcrypt.compare('newPassword', result.password)).toBe(true);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(null as any);

      await expect(
        service.update(1, {
          email: 'updated@example.com',
          password: 'newPassword',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
