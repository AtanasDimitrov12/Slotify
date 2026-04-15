import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MembershipsService } from '../memberships/memberships.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant, type TenantDocument } from './tenant.schema';

function slugify(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      // replace non-alphanumeric with dash
      .replace(/[^a-z0-9]+/g, '-')
      // trim dashes
      .replace(/^-+|-+$/g, '')
      // collapse multiple dashes
      .replace(/-+/g, '-')
      .slice(0, 60)
  );
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    @Inject(forwardRef(() => MembershipsService))
    private readonly membershipsService: MembershipsService,
  ) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name) || 'tenant';
    let slug = base;
    let n = 2;

    // Ensure uniqueness (fast enough for MVP)
    // If you expect high concurrency, we can also handle duplicate-key error retry.

    while (true) {
      const exists = await this.tenantModel.exists({ slug });
      if (!exists) return slug;
      slug = `${base}-${n++}`;
    }
  }

  async create(dto: CreateTenantDto) {
    const slug = await this.generateUniqueSlug(dto.name);

    const created = await this.tenantModel.create({
      ...dto,
      slug,
    });

    return created.toObject();
  }

  async createForOwner(userId: string, dto: CreateTenantDto) {
    const tenant = await this.create(dto);

    await this.membershipsService.create({
      tenantId: String(tenant._id),
      userId,
      role: 'owner',
    });

    return tenant;
  }

  async findAll() {
    return this.tenantModel.find().sort({ createdAt: -1 }).lean();
  }

  async findAllSalons() {
    return this.tenantModel
      .find({
        plan: { $ne: 'admin' },
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOne(id: string) {
    const tenant = await this.tenantModel.findById(id).lean();
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findByName(name: string) {
    return this.tenantModel.findOne({ name: name.trim() }).lean();
  }

  async findByNameOrThrow(name: string) {
    const tenant = await this.findByName(name);
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async findPublished() {
    return this.tenantModel
      .find({
        isPublished: true,
        status: 'active',
        plan: { $ne: 'admin' },
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findPublishedBySlug(slug: string) {
    return this.tenantModel
      .findOne({
        slug,
        isPublished: true,
        status: 'active',
        plan: { $ne: 'admin' },
      })
      .lean();
  }

  async update(id: string, dto: UpdateTenantDto) {
    const updated = await this.tenantModel
      .findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' })
      .lean();

    if (!updated) throw new NotFoundException('Tenant not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.tenantModel.findByIdAndDelete(id).lean();
    if (!deleted) throw new NotFoundException('Tenant not found');
    return { deleted: true, id };
  }
}
