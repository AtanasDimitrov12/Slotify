import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { AIService } from '../ai/ai.service';
import type { JwtPayload } from '../auth/jwt.strategy';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

describe('ServicesController', () => {
  let controller: ServicesController;
  let servicesService: ServicesService;
  let aiService: AIService;

  const mockTenantId = new Types.ObjectId().toString();
  const mockOwnerUser: JwtPayload = {
    sub: 'u1',
    _id: 'u1',
    name: 'Owner',
    tenantId: mockTenantId,
    role: 'owner',
    email: 'o@o.com',
    accountType: 'internal',
  };

  const mockStaffUser: JwtPayload = {
    ...mockOwnerUser,
    role: 'staff',
  };

  const mockServicesService = {
    createForTenant: jest.fn(),
    createManyForTenant: jest.fn(),
    findAllByTenant: jest.fn(),
    findOneForTenant: jest.fn(),
    updateForTenant: jest.fn(),
    removeForTenant: jest.fn(),
  };

  const mockAIService = {
    extractServices: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
        {
          provide: AIService,
          useValue: mockAIService,
        },
      ],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
    servicesService = module.get<ServicesService>(ServicesService);
    aiService = module.get<AIService>(AIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call servicesService.createForTenant for owner', async () => {
      const dto = { name: 'S1', durationMin: 30, priceEUR: 20 };
      await controller.create(mockOwnerUser, dto);
      expect(servicesService.createForTenant).toHaveBeenCalledWith(mockTenantId, dto);
    });

    it('should throw UnauthorizedException for staff', async () => {
      const dto = { name: 'S1', durationMin: 30, priceEUR: 20 };
      expect(() => controller.create(mockStaffUser, dto)).toThrow(UnauthorizedException);
    });
  });

  describe('createBulk', () => {
    it('should call servicesService.createManyForTenant', async () => {
      const dtos = [{ name: 'S1', durationMin: 30, priceEUR: 20 }];
      await controller.createBulk(mockOwnerUser, dtos);
      expect(servicesService.createManyForTenant).toHaveBeenCalledWith(mockTenantId, dtos);
    });
  });

  describe('getCatalog', () => {
    it('should call servicesService.findAllByTenant', async () => {
      await controller.getCatalog(mockOwnerUser);
      expect(servicesService.findAllByTenant).toHaveBeenCalledWith(mockTenantId);
    });
  });

  describe('extractAI', () => {
    it('should call aiService.extractServices', async () => {
      const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/jpeg' } as any;
      mockAIService.extractServices.mockResolvedValue([]);
      await controller.extractAI(mockOwnerUser, mockFile);
      expect(aiService.extractServices).toHaveBeenCalledWith(mockFile.buffer, mockFile.mimetype);
    });
  });

  describe('update', () => {
    it('should call servicesService.updateForTenant', async () => {
      const id = new Types.ObjectId().toString();
      const dto = { name: 'U1' };
      await controller.update(mockOwnerUser, id, dto);
      expect(servicesService.updateForTenant).toHaveBeenCalledWith(mockTenantId, id, dto);
    });
  });

  describe('remove', () => {
    it('should call servicesService.removeForTenant', async () => {
      const id = new Types.ObjectId().toString();
      await controller.remove(mockOwnerUser, id);
      expect(servicesService.removeForTenant).toHaveBeenCalledWith(mockTenantId, id);
    });
  });
});
