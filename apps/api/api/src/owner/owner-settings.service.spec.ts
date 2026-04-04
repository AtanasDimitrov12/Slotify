import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import type { JwtPayload } from '../auth/jwt.strategy';
import { TenantDetailsService } from '../tenant-details/tenant-details.service';

import { TenantsService } from '../tenants/tenants.service';
import { OwnerSettingsService } from './owner-settings.service';

describe('OwnerSettingsService', () => {
  let service: OwnerSettingsService;
  let tenantsService: jest.Mocked<TenantsService>;
  let tenantDetailsService: jest.Mocked<TenantDetailsService>;

  const mockTenantId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();
  const mockUser: JwtPayload = {
    sub: mockUserId,
    _id: mockUserId,
    name: 'Test Owner',
    tenantId: mockTenantId,
    role: 'owner',
    email: 'owner@test.com',
    accountType: 'internal',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerSettingsService,
        {
          provide: TenantsService,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: TenantDetailsService,
          useValue: {
            findByTenantId: jest.fn(),
            upsertByTenantId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OwnerSettingsService>(OwnerSettingsService);
    tenantsService = module.get(TenantsService);
    tenantDetailsService = module.get(TenantDetailsService);
  });

  describe('Authorization Context', () => {
    it('should throw UnauthorizedException if role is staff', async () => {
      const staffUser: JwtPayload = { ...mockUser, role: 'staff' };
      await expect(service.getSettings(staffUser)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if tenantId is missing', async () => {
      const badUser = {
        role: 'owner',
        sub: mockUserId,
        email: 'owner@test.com',
      } as unknown as JwtPayload;
      await expect(service.getSettings(badUser)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateOpeningHours (Transformation Logic)', () => {
    it('should transform day array into indexed openingHours object', async () => {
      const dto = {
        days: [
          { key: 'mon' as const, enabled: true, start: '09:00', end: '17:00' },
          { key: 'tue' as const, enabled: false },
        ],
      };

      await service.updateOpeningHours(mockUser, dto);

      expect(tenantDetailsService.upsertByTenantId).toHaveBeenCalledWith(
        mockTenantId,
        expect.objectContaining({
          openingHours: {
            mon: [{ start: '09:00', end: '17:00' }],
            tue: [],
          },
        }),
      );
    });
  });

  describe('updateGeneral (Multi-service sync)', () => {
    it('should update both tenant name and details', async () => {
      const dto = {
        salonName: 'New Salon Name',
        contactEmail: 'new@salon.com',
        city: 'Amsterdam',
      };

      await service.updateGeneral(mockUser, dto);

      expect(tenantsService.update).toHaveBeenCalledWith(mockTenantId, {
        name: 'New Salon Name',
      });
      expect(tenantDetailsService.upsertByTenantId).toHaveBeenCalledWith(
        mockTenantId,
        expect.objectContaining({
          contactEmail: 'new@salon.com',
          address: expect.objectContaining({ city: 'Amsterdam' }),
        }),
      );
    });
  });

  describe('getSettings', () => {
    it('should provide default values for missing details', async () => {
      tenantsService.findOne.mockResolvedValue({
        _id: new Types.ObjectId(),
        name: 'Salon X',
        __v: 0,
      } as never);

      tenantDetailsService.findByTenantId.mockResolvedValue({
        _id: new Types.ObjectId(),
        tenantId: new Types.ObjectId(mockTenantId),
        contactEmail: 'x@x.com',
        __v: 0,
      } as never);

      const result = await service.getSettings(mockUser);

      expect(result.salonName).toBe('Salon X');
      expect(result.timezone).toBe('Europe/Amsterdam');
      expect(result.city).toBe('');
    });
  });
});
