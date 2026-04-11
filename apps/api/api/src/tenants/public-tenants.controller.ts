import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { MembershipsService } from '../memberships/memberships.service';
import { TenantDetailsService } from '../tenant-details/tenant-details.service';
import { TenantsService } from './tenants.service';

@Controller('public/tenants')
export class PublicTenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly tenantDetailsService: TenantDetailsService,
    private readonly membershipsService: MembershipsService,
  ) {}

  @Get()
  async listPublicTenants() {
    const tenants = await this.tenantsService.findPublished();

    const items = await Promise.all(
      tenants.map(async (tenant) => {
        // Check if tenant is administrative by looking for memberships with 'admin' role.
        // If it has any admin membership, it should not be listed as a public salon.
        const adminMemberships = await this.membershipsService.findByTenantAndRole(
          tenant._id.toString(),
          'admin',
        );

        if (adminMemberships.length > 0) {
          return null;
        }

        const details = await this.tenantDetailsService.findOptionalByTenantId(
          tenant._id.toString(),
        );

        return {
          _id: tenant._id,
          name: tenant.name,
          slug: tenant.slug,
          timezone: tenant.timezone,
          plan: tenant.plan,
          details,
        };
      }),
    );

    return items.filter((item): item is NonNullable<typeof item> => item !== null);
  }

  @Get(':slug')
  async getPublicTenantBySlug(@Param('slug') slug: string) {
    const tenant = await this.tenantsService.findPublishedBySlug(slug);

    if (!tenant) {
      throw new NotFoundException('Salon not found');
    }

    // Check if tenant is administrative
    const adminMemberships = await this.membershipsService.findByTenantAndRole(
      tenant._id.toString(),
      'admin',
    );

    if (adminMemberships.length > 0) {
      throw new NotFoundException('Salon not found');
    }

    const details = await this.tenantDetailsService.findOptionalByTenantId(tenant._id.toString());

    return {
      tenant,
      details,
    };
  }
}
