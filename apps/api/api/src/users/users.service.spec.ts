import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { User } from './user.schema';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    _id: new Types.ObjectId(),
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    save: jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(),
      name: 'Test User',
      email: 'test@example.com',
    }),
  };

  const mockUserModel = jest.fn().mockImplementation(() => mockUser);
  (mockUserModel as any).findOne = jest.fn();
  (mockUserModel as any).findById = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user if email is not in use', async () => {
      (mockUserModel as any).findOne.mockResolvedValue(null);

      const dto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        accountType: 'internal' as const,
      };

      const result = await service.create(dto);

      expect((mockUserModel as any).findOne).toHaveBeenCalledWith({ email: dto.email });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if email is already in use', async () => {
      (mockUserModel as any).findOne.mockResolvedValue(mockUser);

      const dto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        accountType: 'internal' as const,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      (mockUserModel as any).findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@example.com');

      expect((mockUserModel as any).findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      (mockUserModel as any).findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findById(mockUser._id.toString());

      expect((mockUserModel as any).findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(result).toEqual(mockUser);
    });
  });
});
