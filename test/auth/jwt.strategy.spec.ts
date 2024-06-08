import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../../src/auth/jwt.strategy';
import { UsersService } from '../../src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../../src/users/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test_secret';

    usersService = {
      findOneById: jest.fn(),
      findOneByEmail: jest.fn(), // Adicionando a função faltante
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
        }),
      ],
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: usersService },
        ConfigService,
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user if found', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: async () => {},
      };

      jest.spyOn(usersService, 'findOneById').mockResolvedValue(user);
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);

      const result = await strategy.validate({
        sub: 1,
        email: 'test@example.com',
      });
      expect(result).toEqual(user);
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(usersService, 'findOneById').mockResolvedValue(null as any);
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null as any);

      await expect(
        strategy.validate({
          sub: 1,
          email: 'test@example.com',
        }),
      ).rejects.toThrow();
    });
  });
});
