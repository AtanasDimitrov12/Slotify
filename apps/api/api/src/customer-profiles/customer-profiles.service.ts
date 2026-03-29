import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomerProfile, type CustomerProfileDocument } from './customer-profile.schema';
import type { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';

@Injectable()
export class CustomerProfilesService {
  constructor(
    @InjectModel(CustomerProfile.name)
    private readonly customerProfileModel: Model<CustomerProfileDocument>,
  ) {}

  async create(dto: CreateCustomerProfileDto): Promise<CustomerProfileDocument> {
    const profile = new this.customerProfileModel({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
    });
    return profile.save();
  }

  async findByUserId(userId: string): Promise<CustomerProfileDocument | null> {
    return this.customerProfileModel.findOne({ userId: new Types.ObjectId(userId) }).lean();
  }
}
