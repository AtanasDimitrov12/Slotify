import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { StaffBlockedSlotController } from './staff-blocked-slot.controller';
import { StaffBlockedSlotService } from './staff-blocked-slot.service';

describe('StaffBlockedSlotController', () => {
  let controller: StaffBlockedSlotController;
  let service: StaffBlockedSlotService;

  const mockTenantId = new Types.ObjectId().toString();
  const mockUser = {
    sub: new Types.ObjectId().toString(),
    _id: 'u1',
    tenantId: mockTenantId,
    role: 'owner',
  };

  const mockService = {
    findAllByStaff: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffBlockedSlotController],
      providers: [{ provide: StaffBlockedSlotService, useValue: mockService }],
    }).compile();

    controller = module.get<StaffBlockedSlotController>(StaffBlockedSlotController);
    service = module.get<StaffBlockedSlotService>(StaffBlockedSlotService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findMySlots', () => {
    it('should call service.findAllByStaff with user id', async () => {
      await controller.findMySlots(mockUser as any, 'false');
      expect(service.findAllByStaff).toHaveBeenCalledWith(mockUser.sub, false);
    });
  });

  describe('createMySlot', () => {
    it('should call service.create with user id and tenant id', async () => {
      const dto = { date: '2026-01-01', startTime: '10:00', endTime: '11:00' };
      await controller.createMySlot(mockUser as any, dto as any);
      expect(service.create).toHaveBeenCalledWith({
        ...dto,
        tenantId: mockTenantId,
        userId: mockUser.sub,
      });
    });
  });

  describe('create', () => {
    it('should allow owner to create for anyone', async () => {
      const dto = {
        userId: 'u2',
        tenantId: 't1',
        date: '2026-01-01',
        startTime: '10:00',
        endTime: '11:00',
      };
      await controller.create(mockUser as any, dto as any);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException if staff tries to create for someone else', async () => {
      const staffUser = { ...mockUser, role: 'staff' };
      const dto = { userId: 'u2', tenantId: 't1' };
      expect(() => controller.create(staffUser as any, dto as any)).toThrow(UnauthorizedException);
    });
  });
});
