import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import type { JwtPayload } from '../auth/jwt.strategy';
import { TenantDetailsService } from '../tenant-details/tenant-details.service';
import { TenantsService } from '../tenants/tenants.service';
import { UpdateBusinessGeneralDto } from './dto/update-business-general.dto';
import { UpdateOpeningHoursDto } from './dto/update-opening-hours.dto';

@Injectable()
export class OwnerSettingsService {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly tenantDetailsService: TenantDetailsService,
  ) {}

  private getTenantId(currentUser: JwtPayload): string {
    const tenantId = currentUser?.tenantId;

    if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
      throw new UnauthorizedException('Invalid tenant context');
    }

    if (!['owner'].includes(currentUser?.role)) {
      throw new UnauthorizedException('You are not allowed to manage business settings');
    }

    return tenantId;
  }

  async getSettings(currentUser: JwtPayload) {
    const tenantId = this.getTenantId(currentUser);

    const tenant = await this.tenantsService.findOne(tenantId);

    let details: Awaited<ReturnType<TenantDetailsService['findByTenantId']>> | null = null;
    try {
      details = await this.tenantDetailsService.findByTenantId(tenantId);
    } catch {
      details = await this.tenantDetailsService.upsertByTenantId(tenantId, {});
    }

    return {
      salonName: tenant?.name ?? '',
      contactPersonName: details?.contactPersonName ?? '',
      phone: details?.contactPhone ?? '',
      email: details?.contactEmail ?? '',
      street: details?.address?.street ?? '',
      houseNumber: details?.address?.houseNumber ?? '',
      city: details?.address?.city ?? '',
      postalCode: details?.address?.postalCode ?? '',
      country: details?.address?.country ?? '',
      timezone: details?.timezone ?? 'Europe/Amsterdam',
      websiteUrl: details?.websiteUrl ?? '',
      instagram: details?.socialLinks?.instagram ?? '',
      facebook: details?.socialLinks?.facebook ?? '',
      tiktok: details?.socialLinks?.tiktok ?? '',
      notes: details?.notes ?? '',
      openingHours: details?.openingHours ?? {},
    };
  }

  async updateGeneral(currentUser: JwtPayload, dto: UpdateBusinessGeneralDto) {
    const tenantId = this.getTenantId(currentUser);

    if (dto.salonName?.trim()) {
      await this.tenantsService.update(tenantId, {
        name: dto.salonName.trim(),
      });
    }

    const details = await this.tenantDetailsService.upsertByTenantId(tenantId, {
      contactPersonName: dto.contactPersonName ?? '',
      contactPhone: dto.contactPhone ?? '',
      contactEmail: dto.contactEmail ?? '',
      timezone: dto.timezone ?? 'Europe/Amsterdam',
      websiteUrl: dto.websiteUrl ?? '',
      notes: dto.notes ?? '',
      address: {
        street: dto.street ?? '',
        houseNumber: dto.houseNumber ?? '',
        postalCode: dto.postalCode ?? '',
        city: dto.city ?? '',
        country: dto.country ?? '',
      },
      socialLinks: {
        instagram: dto.instagram ?? '',
        facebook: dto.facebook ?? '',
        tiktok: dto.tiktok ?? '',
      },
    });

    return {
      message: 'Business settings updated successfully',
      details,
    };
  }

  async updateOpeningHours(currentUser: JwtPayload, dto: UpdateOpeningHoursDto) {
    const tenantId = this.getTenantId(currentUser);

    const openingHours = dto.days.reduce<Record<string, { start: string; end: string }[]>>(
      (acc, day) => {
        if (day.enabled && day.start && day.end) {
          acc[day.key] = [{ start: day.start, end: day.end }];
        } else {
          acc[day.key] = [];
        }

        return acc;
      },
      {},
    );

    const details = await this.tenantDetailsService.upsertByTenantId(tenantId, {
      openingHours,
    });

    return {
      message: 'Opening hours updated successfully',
      details,
    };
  }
}
