import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import type { JwtPayload } from '../auth/jwt.strategy';
import { BookingSettingsController } from './booking-settings.controller';
import { BookingSettingsService } from './booking-settings.service';
import type { UpsertTenantBookingSettingsDto } from './dto/upsert-tenant-booking-settings.dto';

describe('BookingSettingsController', () => {
  let controller: BookingSettingsController;
  let service: BookingSettingsService;

  const mockTenantId = new Types.ObjectId().toString();
  const mockOwnerUser: JwtPayload = {
    sub: 'u1',
    _id: 'u1',
    name: 'Owner',
    email: 'owner@test.com',
    tenantId: mockTenantId,
    role: 'owner',
    accountType: 'internal',
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
    await controller.getSettings(mockOwnerUser);
    expect(service.getOrCreateByTenantId).toHaveBeenCalledWith(mockTenantId);
  });

  it('getSettings should throw UnauthorizedException for non-owners', async () => {
    const staffUser: JwtPayload = { ...mockOwnerUser, role: 'staff' };
    expect(() => controller.getSettings(staffUser)).toThrow(UnauthorizedException);
  });

  it('updateSettings should call service', async () => {
    const dto: UpsertTenantBookingSettingsDto = { minimumNoticeMinutes: 120 };
    await controller.updateSettings(mockOwnerUser, dto);
    expect(service.upsertByTenantId).toHaveBeenCalledWith(mockTenantId, dto);
  });
});
