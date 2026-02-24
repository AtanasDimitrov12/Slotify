import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Tenant, TenantDocument } from './tenant.schema';

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // replace non-alphanumeric with dash
    .replace(/[^a-z0-9]+/g, '-')
    // trim dashes
    .replace(/^-+|-+$/g, '')
    // collapse multiple dashes
    .replace(/-+/g, '-')
    .slice(0, 60);
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<TenantDocument>,
  ) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name) || 'tenant';
    let slug = base;
    let n = 2;

    // Ensure uniqueness (fast enough for MVP)
    // If you expect high concurrency, we can also handle duplicate-key error retry.
    // eslint-disable-next-line no-constant-condition
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

  async findAll() {
    return this.tenantModel.find().sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    const tenant = await this.tenantModel.findById(id).lean();
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    const updated = await this.tenantModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
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