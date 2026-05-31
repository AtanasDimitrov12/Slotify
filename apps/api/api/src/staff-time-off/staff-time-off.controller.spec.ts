import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import type { JwtPayload } from '../auth/jwt.strategy';
import type { CreateStaffTimeOffDto } from './dto/create-staff-time-off.dto';
import { StaffTimeOffController } from './staff-time-off.controller';
import { StaffTimeOffService } from './staff-time-off.service';

describe('StaffTimeOffController', () => {
  let controller: StaffTimeOffController;
  let service: StaffTimeOffService;

  const mockTenantId = new Types.ObjectId().toString();
  const mockOwnerUser = {
    sub: 'u1',
    _id: 'u1',
    tenantId: mockTenantId,
    role: 'owner',
  };

  const mockService = {
    create: jest.fn(),
    findAllByStaff: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getPendingCountsByTenant: jest.fn(),
    findAllForOwnerByStaff: jest.fn(),
    reviewRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffTimeOffController],
      providers: [{ provide: StaffTimeOffService, useValue: mockService }],
    }).compile();

    controller = module.get<StaffTimeOffController>(StaffTimeOffController);
    service = module.get<StaffTimeOffService>(StaffTimeOffService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create should call service.create', async () => {
    const dto: CreateStaffTimeOffDto = {
      userId: 'u1',
      tenantId: 't1',
      startDate: '2026-01-01',
      endDate: '2026-01-02',
    };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('getPendingCounts should call service for owners', async () => {
    await controller.getPendingCounts(mockOwnerUser as unknown as JwtPayload);
    expect(service.getPendingCountsByTenant).toHaveBeenCalledWith(mockTenantId);
  });

  it('getPendingCounts should throw UnauthorizedException for non-owners', async () => {
    const staffUser = { ...mockOwnerUser, role: 'staff' };
    expect(() => controller.getPendingCounts(staffUser as unknown as JwtPayload)).toThrow(
      UnauthorizedException,
    );
  });

  it('reviewRequest should call service.reviewRequest', async () => {
    await controller.reviewRequest(mockOwnerUser as unknown as JwtPayload, 'req1', {
      status: 'approved',
    });
    expect(service.reviewRequest).toHaveBeenCalledWith(mockTenantId, 'req1', 'approved');
  });
});
