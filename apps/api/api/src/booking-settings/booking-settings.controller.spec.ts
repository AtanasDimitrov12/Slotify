import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BookingSettingsController } from './booking-settings.controller';
import { BookingSettingsService } from './booking-settings.service';

describe('BookingSettingsController', () => {
  let controller: BookingSettingsController;
  let service: BookingSettingsService;

  const mockTenantId = new Types.ObjectId().toString();
  const mockOwnerUser = {
    sub: 'u1',
    tenantId: mockTenantId,
    role: 'owner',
  };

  const mockService = {
    getOrCreateByTenantId: jest.fn(),
    upsertByTenantId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingSettingsController],
      providers: [{ provide: BookingSettingsService, useValue: mockService }],
    }).compile();

    controller = module.get<BookingSettingsController>(BookingSettingsController);
    service = module.get<BookingSettingsService>(BookingSettingsService);
  });

  it('getSettings should call service for owners', async () => {
    await controller.getSettings(mockOwnerUser as any);
    expect(service.getOrCreateByTenantId).toHaveBeenCalledWith(mockTenantId);
  });

  it('getSettings should throw UnauthorizedException for non-owners', async () => {
    const staffUser = { ...mockOwnerUser, role: 'staff' };
    expect(() => controller.getSettings(staffUser as any)).toThrow(UnauthorizedException);
  });

  it('updateSettings should call service', async () => {
    const dto = { minimumNoticeMinutes: 120 };
    await controller.updateSettings(mockOwnerUser as any, dto as any);
    expect(service.upsertByTenantId).toHaveBeenCalledWith(mockTenantId, dto);
  });
});
