import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { TenantAccount, TenantAccountDocument } from './tenant-accounts.schema';
import { CreateTenantAccountDto } from './dto/create-tenant-account.dto';
import { UpdateTenantAccountDto } from './dto/update-tenant-account.dto';

@Injectable()
export class TenantAccountsService {
  constructor(
    @InjectModel(TenantAccount.name)
    private readonly accountModel: Model<TenantAccountDocument>,
  ) {}

  async create(dto: CreateTenantAccountDto) {
    const existing = await this.accountModel.findOne({ email: dto.email });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const accountsCount = await this.accountModel.countDocuments({
      tenantId: dto.tenantId,
    });

    const hashed = await bcrypt.hash(dto.password, 10);

    const created = await this.accountModel.create({
      ...dto,
      password: hashed,
      isMain: accountsCount === 0 ? true : dto.isMain ?? false,
    });

    return created.toObject();
  }

  async findByEmail(email: string) {
    return this.accountModel.findOne({ email }).lean();
  }

  async update(id: string, dto: UpdateTenantAccountDto) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    return this.accountModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean();
  }

  async listByTenant(tenantId: string) {
  return this.accountModel
    .find({ tenantId })
    .select('-password') 
    .sort({ createdAt: -1 })
    .lean();
}
}