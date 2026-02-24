import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTenantDetailsDto } from './dto/create-tenant-details.dto';
import { UpdateTenantDetailsDto } from './dto/update-tenant-details.dto';
import { TenantDetails, TenantDetailsDocument } from './tenant-details.schema';

@Injectable()
export class TenantDetailsService {
  constructor(
    @InjectModel(TenantDetails.name) private readonly model: Model<TenantDetailsDocument>,
  ) {}

  async create(dto: CreateTenantDetailsDto) {
    const existing = await this.model.findOne({ tenantId: dto.tenantId }).lean();
    if (existing) throw new ConflictException('TenantDetails already exists for this tenantId');

    const created = await this.model.create(dto);
    return created.toObject();
  }

  async findByTenantId(tenantId: string) {
    const details = await this.model.findOne({ tenantId }).lean();
    if (!details) throw new NotFoundException('TenantDetails not found');
    return details;
  }

  async updateByTenantId(tenantId: string, dto: UpdateTenantDetailsDto) {
    const updated = await this.model
      .findOneAndUpdate({ tenantId }, { $set: dto }, { new: true })
      .lean();

    if (!updated) throw new NotFoundException('TenantDetails not found');
    return updated;
  }

  async upsertByTenantId(tenantId: string, dto: UpdateTenantDetailsDto) {
    const updated = await this.model
      .findOneAndUpdate(
        { tenantId },
        { $set: { ...dto, tenantId } },
        { new: true, upsert: true },
      )
      .lean();

    return updated;
  }
}