import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { User } from '../../src/users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access token', async () => {
      const result = { access_token: 'token' };
      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(
        await controller.login({ user: { email: 'test@example.com', id: 1 } }),
      ).toBe(result);
    });
  });

  describe('register', () => {
    it('should return registered user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const result: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn(),
      };
      jest.spyOn(authService, 'register').mockResolvedValue(result);

      expect(await controller.register(createUserDto)).toBe(result);
    });
  });
});
