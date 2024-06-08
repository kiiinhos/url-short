import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { User } from '../../src/users/entities/user.entity';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOneById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [
        {
          id: 1,
          email: 'test@example.com',
          password: 'hashedPassword',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          hashPassword: jest.fn(),
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn(),
      };
      jest.spyOn(service, 'findOneById').mockResolvedValue(user);

      const result = await controller.findOne(1);
      expect(result).toEqual(user);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn(),
      };
      jest.spyOn(service, 'create').mockResolvedValue(user);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const updateUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'newPassword',
      };
      const user: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        hashPassword: jest.fn(),
      };
      const updatedUser: User = {
        ...user,
        password: 'newHashedPassword',
        hashPassword: jest.fn(),
      };
      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update(user.id, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
