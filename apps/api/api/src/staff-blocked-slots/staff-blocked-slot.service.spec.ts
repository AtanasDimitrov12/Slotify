import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { StaffBlockedSlot } from './staff-blocked-slot.schema';
import { StaffBlockedSlotService } from './staff-blocked-slot.service';

describe('StaffBlockedSlotService', () => {
  let service: StaffBlockedSlotService;

  const mockSlot = {
    _id: new Types.ObjectId(),
    tenantId: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    date: '2026-12-01',
    startTime: '10:00',
    endTime: '11:00',
    isActive: true,
    toObject: jest.fn().mockReturnValue({ _id: new Types.ObjectId(), date: '2026-12-01', startTime: '10:00' }),
  };

  const mockBlockedSlotModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-04-06T00:00:00Z'));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffBlockedSlotService,
        {
          provide: getModelToken(StaffBlockedSlot.name),
          useValue: mockBlockedSlotModel,
        },
      ],
    }).compile();

    service = module.get<StaffBlockedSlotService>(StaffBlockedSlotService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a future blocked slot', async () => {
      mockBlockedSlotModel.create.mockResolvedValue(mockSlot);
      const dto = {
        tenantId: mockSlot.tenantId.toString(),
        userId: mockSlot.userId.toString(),
        date: '2026-12-01',
        startTime: '10:00',
        endTime: '11:00',
      };

      const result = await service.create(dto);
      expect(result).toBeDefined();
      expect(mockBlockedSlotModel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for past slots', async () => {
      const dto = {
        tenantId: mockSlot.tenantId.toString(),
        userId: mockSlot.userId.toString(),
        date: '2020-01-01',
        startTime: '10:00',
        endTime: '11:00',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a future slot', async () => {
      mockBlockedSlotModel.findById.mockReturnValue({ lean: () => mockSlot });
      mockBlockedSlotModel.findByIdAndUpdate.mockReturnValue({ lean: () => ({ ...mockSlot, reason: 'New' }) });

      const result = await service.update(mockSlot._id.toString(), { reason: 'New' });
      expect(result.reason).toBe('New');
    });

    it('should throw NotFoundException if slot missing', async () => {
      mockBlockedSlotModel.findById.mockReturnValue({ lean: () => null });
      await expect(service.update('id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should deactivate a future slot', async () => {
      mockBlockedSlotModel.findById.mockReturnValue({ lean: () => mockSlot });
      mockBlockedSlotModel.findByIdAndUpdate.mockReturnValue({ lean: () => ({ ...mockSlot, isActive: false }) });

      const result = await service.remove(mockSlot._id.toString());
      expect(result.isActive).toBe(false);
    });
  });
});
