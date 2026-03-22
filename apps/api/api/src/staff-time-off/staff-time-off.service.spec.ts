import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { StaffTimeOffService } from './staff-time-off.service';
import { StaffTimeOff } from './staff-time-off.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('StaffTimeOffService', () => {
  let service: StaffTimeOffService;

  const mockQuery = (data: any) => ({
    lean: jest.fn().mockResolvedValue(data),
    sort: jest.fn().mockReturnThis(),
  });

  const mockTimeOffModel = {
    create: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffTimeOffService,
        { provide: getModelToken(StaffTimeOff.name), useValue: mockTimeOffModel },
      ],
    }).compile();

    service = module.get<StaffTimeOffService>(StaffTimeOffService);
  });

  const tenantId = new Types.ObjectId().toString();
  const requestId = new Types.ObjectId().toString();

  describe('reviewRequest (State Machine)', () => {
    it('should approve a request and return updated document', async () => {
      const mockUpdated = { _id: requestId, status: 'approved' };
      mockTimeOffModel.findOneAndUpdate.mockReturnValue(mockQuery(mockUpdated));

      const result = await service.reviewRequest(tenantId, requestId, 'approved');

      expect(result.status).toBe('approved');
      expect(mockTimeOffModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new Types.ObjectId(requestId), tenantId: new Types.ObjectId(tenantId) },
        { $set: { status: 'approved' } },
        expect.anything()
      );
    });

    it('should throw BadRequestException for invalid status transitions', async () => {
      await expect(service.reviewRequest(tenantId, requestId, 'requested' as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if request does not exist in tenant context', async () => {
      mockTimeOffModel.findOneAndUpdate.mockReturnValue(mockQuery(null));
      await expect(service.reviewRequest(tenantId, requestId, 'approved'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('Aggregation & Dashboard', () => {
    it('should aggregate pending counts correctly', async () => {
      const mockUserId = new Types.ObjectId();
      mockTimeOffModel.aggregate.mockResolvedValue([
        { _id: mockUserId, pendingCount: 5 }
      ]);

      const result = await service.getPendingCountsByTenant(tenantId);

      expect(result[0].userId).toBe(mockUserId.toString());
      expect(result[0].pendingCount).toBe(5);
    });
  });

  describe('Lifecycle', () => {
    it('should create a request with "requested" as default status', async () => {
        const dto = {
            tenantId,
            userId: new Types.ObjectId().toString(),
            startDate: '2026-04-01',
            endDate: '2026-04-05',
            reason: 'Spring break'
        };
        mockTimeOffModel.create.mockImplementation((data) => ({
            ...data,
            _id: new Types.ObjectId()
        }));

        const result = await service.create(dto);
        expect(result.status).toBe('requested');
        expect(result.startDate).toBeInstanceOf(Date);
    });
  });
});
