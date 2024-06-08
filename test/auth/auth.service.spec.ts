import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../src/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      findOneByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        ConfigService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data without password if validation is successful', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: async () => undefined,
      } as User;

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser('test@example.com', 'password');
      const { password, ...expectedResult } = user;
      expect(result).toEqual(expectedResult);
    });

    it('should return null if validation fails', async () => {
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(null as unknown as User);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const user = { id: 1, email: 'test@example.com' };
      const token = 'test_token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await service.login(user);
      expect(result).toEqual({ access_token: token });
    });
  });

  describe('register', () => {
    it('should create and return a user', async () => {
      const createUserDto = { email: 'test@example.com', password: 'password' };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
      } as User;

      jest.spyOn(usersService, 'create').mockResolvedValue(user);

      const result = await service.register(createUserDto);
      expect(result).toEqual(user);
    });
  });
});
