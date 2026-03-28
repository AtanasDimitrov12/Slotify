import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

  async createForTenant(tenantId: string, dto: CreateServiceDto) {
    const trimmedName = dto.name?.trim();

    if (!trimmedName) {
      throw new BadRequestException('Service name is required');
    }

    return this.serviceModel.create({
      name: trimmedName,
      durationMin: dto.durationMin,
      priceEUR: dto.priceEUR,
      description: dto.description?.trim() || '',
      tenantId: new Types.ObjectId(tenantId),
      isActive: true,
    });
  }

  async createManyForTenant(tenantId: string, dtos: CreateServiceDto[]) {
    const services = dtos.map((dto) => {
      const trimmedName = dto.name?.trim();
      if (!trimmedName) {
        throw new BadRequestException('All services must have a name');
      }
      return {
        name: trimmedName,
        durationMin: dto.durationMin,
        priceEUR: dto.priceEUR,
        description: dto.description?.trim() || '',
        tenantId: new Types.ObjectId(tenantId),
        isActive: true,
      };
    });

    return this.serviceModel.insertMany(services);
  }

  findAllByTenant(tenantId: string) {
    return this.serviceModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        isActive: true,
      })
      .sort({ name: 1 })
      .lean();
  }

  async findOneForTenant(tenantId: string, id: string) {
    const item = await this.serviceModel
      .findOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean();

    if (!item) {
      throw new NotFoundException('Service not found');
    }

    return item;
  }

  async updateForTenant(tenantId: string, id: string, dto: UpdateServiceDto) {
    const payload: Record<string, unknown> = {};

    if (typeof dto.name === 'string') {
      payload.name = dto.name.trim();
    }

    if (typeof dto.durationMin === 'number') {
      payload.durationMin = dto.durationMin;
    }

    if (typeof dto.priceEUR === 'number') {
      payload.priceEUR = dto.priceEUR;
    }

    if (typeof dto.description === 'string') {
      payload.description = dto.description.trim();
    }

    const updated = await this.serviceModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: new Types.ObjectId(tenantId),
          isActive: true,
        },
        { $set: payload },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException('Service not found');
    }

    return updated;
  }

  async removeForTenant(tenantId: string, id: string) {
    const deleted = await this.serviceModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: new Types.ObjectId(tenantId),
          isActive: true,
        },
        { $set: { isActive: false } },
        { new: true },
      )
      .lean();

    if (!deleted) {
      throw new NotFoundException('Service not found');
    }

    return { message: 'Service removed successfully' };
  }
}