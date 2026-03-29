import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { TenantDetailsService } from '../tenant-details/tenant-details.service';
import { TenantsService } from './tenants.service';

@Controller('public/tenants')
export class PublicTenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly tenantDetailsService: TenantDetailsService,
  ) {}

  @Get()
  async listPublicTenants() {
    const tenants = await this.tenantsService.findPublished();

    const items = await Promise.all(
      tenants.map(async (tenant) => {
        const details = await this.tenantDetailsService.findOptionalByTenantId(
          tenant._id.toString(),
        );

        return {
          _id: tenant._id,
          name: tenant.name,
          slug: tenant.slug,
          timezone: tenant.timezone,
          details,
        };
      }),
    );

    return items;
  }

  @Get(':slug')
  async getPublicTenantBySlug(@Param('slug') slug: string) {
    const tenant = await this.tenantsService.findPublishedBySlug(slug);

    if (!tenant) {
      throw new NotFoundException('Salon not found');
    }

    const details = await this.tenantDetailsService.findOptionalByTenantId(tenant._id.toString());

    return {
      tenant,
      details,
    };
  }
}
