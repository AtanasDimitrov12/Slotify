import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Membership } from './membership.schema';
import { MembershipsService } from './memberships.service';

describe('MembershipsService', () => {
  let service: MembershipsService;

  const mockMembership = {
    _id: new Types.ObjectId(),
    tenantId: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    role: 'staff',
    isActive: true,
    toObject: jest.fn().mockReturnValue({
      role: 'staff',
      isActive: true,
    }),
  };

  const mockMembershipModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipsService,
        {
          provide: getModelToken(Membership.name),
          useValue: mockMembershipModel,
        },
      ],
    }).compile();

    service = module.get<MembershipsService>(MembershipsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it("should create a new membership if it doesn't exist", async () => {
      mockMembershipModel.findOne.mockResolvedValue(null);
      mockMembershipModel.create.mockResolvedValue(mockMembership);

      const dto = {
        tenantId: mockMembership.tenantId.toString(),
        userId: mockMembership.userId.toString(),
        role: 'staff' as const,
      };

      const result = await service.create(dto);

      expect(mockMembershipModel.findOne).toHaveBeenCalledWith({
        tenantId: dto.tenantId,
        userId: dto.userId,
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if membership already exists', async () => {
      mockMembershipModel.findOne.mockResolvedValue(mockMembership);

      const dto = {
        tenantId: mockMembership.tenantId.toString(),
        userId: mockMembership.userId.toString(),
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllByUserId', () => {
    it('should return all active memberships for a user', async () => {
      mockMembershipModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockMembership]),
        }),
      });

      const result = await service.findAllByUserId('user-id');

      expect(mockMembershipModel.find).toHaveBeenCalledWith({
        userId: 'user-id',
        isActive: true,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('listByTenant', () => {
    it('should return all memberships for a tenant', async () => {
      mockMembershipModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockMembership]),
          }),
        }),
      });

      const result = await service.listByTenant('tenant-id');

      expect(mockMembershipModel.find).toHaveBeenCalledWith({
        tenantId: 'tenant-id',
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update and return membership', async () => {
      mockMembershipModel.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMembership),
      });

      const result = await service.update('id1', { role: 'owner' });

      expect(mockMembershipModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'id1',
        { $set: { role: 'owner' } },
        { returnDocument: 'after' },
      );
      expect(result).toEqual(mockMembership);
    });
  });

  describe('findByUserId', () => {
    it('should return membership if found', async () => {
      mockMembershipModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMembership),
      });

      const result = await service.findByUserId('u1');
      expect(result).toEqual(mockMembership);
    });
  });

  describe('findByTenantAndRole', () => {
    it('should return memberships for tenant and role', async () => {
      mockMembershipModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([mockMembership]),
      });

      const result = await service.findByTenantAndRole('t1', 'staff');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByUserIdAndTenantId', () => {
    it('should return membership if found', async () => {
      mockMembershipModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMembership),
      });

      const result = await service.findByUserIdAndTenantId('u1', 't1');
      expect(result).toEqual(mockMembership);
    });
  });

  describe('findActiveByUserIdAndTenantId', () => {
    it('should return active membership if found', async () => {
      mockMembershipModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockMembership),
      });

      const result = await service.findActiveByUserIdAndTenantId('u1', 't1');
      expect(result).toEqual(mockMembership);
      expect(mockMembershipModel.findOne).toHaveBeenCalledWith({
        userId: 'u1',
        tenantId: 't1',
        isActive: true,
      });
    });
  });
});
