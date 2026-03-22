import { Test, TestingModule } from '@nestjs/testing';
import { OwnerSettingsService } from './owner-settings.service';
import { TenantsService } from '../tenants/tenants.service';
import { TenantDetailsService } from '../tenant-details/tenant-details.service';
import { UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('OwnerSettingsService', () => {
  let service: OwnerSettingsService;
  let tenantsService: jest.Mocked<TenantsService>;
  let tenantDetailsService: jest.Mocked<TenantDetailsService>;

  const mockTenantId = new Types.ObjectId().toString();
  const mockUser = {
    tenantId: mockTenantId,
    role: 'owner',
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
      const staffUser = { ...mockUser, role: 'staff' };
      await expect(service.getSettings(staffUser)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if tenantId is missing', async () => {
      const badUser = { role: 'owner' };
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
        })
      );
    });
  });

  describe('updateGeneral (Multi-service sync)', () => {
    it('should update both tenant name and details', async () => {
      const dto = {
        salonName: 'New Salon Name',
        contactEmail: 'new@salon.com',
        city: 'Amsterdam'
      };

      await service.updateGeneral(mockUser, dto);

      expect(tenantsService.update).toHaveBeenCalledWith(mockTenantId, { name: 'New Salon Name' });
      expect(tenantDetailsService.upsertByTenantId).toHaveBeenCalledWith(
        mockTenantId,
        expect.objectContaining({
          contactEmail: 'new@salon.com',
          address: expect.objectContaining({ city: 'Amsterdam' })
        })
      );
    });
  });

  describe('getSettings', () => {
    it('should provide default values for missing details', async () => {
      tenantsService.findOne.mockResolvedValue({ name: 'Salon X' } as any);
      tenantDetailsService.findByTenantId.mockResolvedValue({
        contactEmail: 'x@x.com',
        // Address missing
      } as any);

      const result = await service.getSettings(mockUser);

      expect(result.salonName).toBe('Salon X');
      expect(result.timezone).toBe('Europe/Amsterdam'); // Default fallback
      expect(result.city).toBe(''); // Empty fallback
    });
  });
});
