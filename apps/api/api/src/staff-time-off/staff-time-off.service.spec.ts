import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { StaffTimeOffService } from './staff-time-off.service';
import { StaffTimeOff } from './staff-time-off.schema';

describe('StaffTimeOffService', () => {
  let service: StaffTimeOffService;

  const mockTimeOff = {
    _id: new Types.ObjectId(),
    tenantId: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    startDate: new Date('2023-11-01'),
    endDate: new Date('2023-11-05'),
    status: 'requested',
    reason: 'Vacation',
  };

  const mockTimeOffModel = {
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
    aggregate: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new time off request', async () => {
      mockTimeOffModel.create.mockResolvedValue(mockTimeOff);

      const dto = {
        tenantId: mockTimeOff.tenantId.toString(),
        userId: mockTimeOff.userId.toString(),
        startDate: '2023-11-01',
        endDate: '2023-11-05',
        reason: 'Vacation',
      };

      const result = await service.create(dto);

      expect(mockTimeOffModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAllByStaff', () => {
    it('should return all time off entries for staff', async () => {
      mockTimeOffModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockTimeOff]),
        }),
      });

      const result = await service.findAllByStaff(
        mockTimeOff.tenantId.toString(),
        mockTimeOff.userId.toString()
      );

      expect(mockTimeOffModel.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('reviewRequest', () => {
    it('should update status of a request', async () => {
      mockTimeOffModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...mockTimeOff, status: 'approved' }),
      });

      const result = await service.reviewRequest(
        mockTimeOff.tenantId.toString(),
        mockTimeOff._id.toString(),
        'approved'
      );

      expect(result.status).toBe('approved');
    });

    it('should throw NotFoundException if request not found', async () => {
      mockTimeOffModel.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.reviewRequest(
            new Types.ObjectId().toString(),
            new Types.ObjectId().toString(),
            'approved'
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
