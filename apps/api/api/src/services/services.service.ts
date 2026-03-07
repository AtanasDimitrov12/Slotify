import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from './service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  create(dto: CreateServiceDto) {
    return this.serviceModel.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
    });
  }

  findAllByTenant(tenantId: string) {
    return this.serviceModel.find({ tenantId, isActive: true }).lean();
  }

  findOne(id: string) {
    return this.serviceModel.findById(id).lean();
  }

  async update(id: string, dto: UpdateServiceDto) {
    const updated = await this.serviceModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();

    if (!updated) throw new NotFoundException('Service not found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.serviceModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean();

    if (!deleted) throw new NotFoundException('Service not found');
    return deleted;
  }
}