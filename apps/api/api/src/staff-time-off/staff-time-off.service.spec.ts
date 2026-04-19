import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { StaffTimeOff } from './staff-time-off.schema';
import { StaffTimeOffService } from './staff-time-off.service';

describe('StaffTimeOffService', () => {
  let service: StaffTimeOffService;

  const mockQuery = (data: any) => ({
    lean: jest.fn().mockResolvedValue(data),
    sort: jest.fn().mockReturnThis(),
  });

  const mockSlot = {
    _id: new Types.ObjectId(),
    tenantId: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-02'),
    status: 'requested',
  };

  const mockTimeOffModel = {
    create: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffTimeOffService,
        {
          provide: getModelToken(StaffTimeOff.name),
          useValue: mockTimeOffModel,
        },
      ],
    }).compile();

    service = module.get<StaffTimeOffService>(StaffTimeOffService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const tenantId = new Types.ObjectId().toString();
  const requestId = new Types.ObjectId().toString();

  describe('create', () => {
    it('should create a request with "requested" as default status', async () => {
      const dto = {
        tenantId,
        userId: new Types.ObjectId().toString(),
        startDate: '2026-04-01',
        endDate: '2026-04-05',
        reason: 'Spring break',
      };
      mockTimeOffModel.create.mockResolvedValue({
        ...dto,
        _id: new Types.ObjectId(),
        status: 'requested',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      });

      const result = await service.create(dto);
      expect(result.status).toBe('requested');
      expect(result.startDate).toBeInstanceOf(Date);
    });
  });

  describe('findAllByStaff', () => {
    it('should return list of time off requests', async () => {
      mockTimeOffModel.find.mockReturnValue(mockQuery([mockSlot]));
      const result = await service.findAllByStaff(new Types.ObjectId().toString());
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update and return request', async () => {
      mockTimeOffModel.findByIdAndUpdate.mockReturnValue(mockQuery({ ...mockSlot, reason: 'New' }));
      const result = await service.update(requestId, { reason: 'New' });
      expect(result.reason).toBe('New');
    });

    it('should throw NotFoundException if missing', async () => {
      mockTimeOffModel.findByIdAndUpdate.mockReturnValue(mockQuery(null));
      await expect(service.update(requestId, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove and return request', async () => {
      mockTimeOffModel.findByIdAndDelete.mockReturnValue(mockQuery(mockSlot));
      const result = await service.remove(requestId);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if missing', async () => {
      mockTimeOffModel.findByIdAndDelete.mockReturnValue(mockQuery(null));
      await expect(service.remove(requestId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reviewRequest (State Machine)', () => {
    it('should approve a request and return updated document', async () => {
      const mockUpdated = { _id: requestId, status: 'approved' };
      mockTimeOffModel.findOneAndUpdate.mockReturnValue(mockQuery(mockUpdated));

      const result = await service.reviewRequest(tenantId, requestId, 'approved');

      expect(result.status).toBe('approved');
      expect(mockTimeOffModel.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: new Types.ObjectId(requestId),
          tenantId: new Types.ObjectId(tenantId),
        },
        { $set: { status: 'approved' } },
        { returnDocument: 'after' },
      );
    });

    it('should throw BadRequestException for invalid status transitions', async () => {
      await expect(service.reviewRequest(tenantId, requestId, 'requested' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if request does not exist in tenant context', async () => {
      mockTimeOffModel.findOneAndUpdate.mockReturnValue(mockQuery(null));
      await expect(service.reviewRequest(tenantId, requestId, 'approved')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('Aggregation & Dashboard', () => {
    it('should aggregate pending counts correctly', async () => {
      const mockUserId = new Types.ObjectId();
      mockTimeOffModel.aggregate.mockResolvedValue([{ _id: mockUserId, pendingCount: 5 }]);

      const result = await service.getPendingCountsByTenant(tenantId);

      expect(result[0].userId).toBe(mockUserId.toString());
      expect(result[0].pendingCount).toBe(5);
    });
  });

  describe('findAllForOwnerByStaff', () => {
    it('should return all requests for tenant and staff', async () => {
      mockTimeOffModel.find.mockReturnValue(mockQuery([]));
      const mockUserId = new Types.ObjectId().toString();
      await service.findAllForOwnerByStaff(tenantId, mockUserId);
      expect(mockTimeOffModel.find).toHaveBeenCalledWith({
        tenantId: new Types.ObjectId(tenantId),
        userId: new Types.ObjectId(mockUserId),
      });
    });
  });
});
