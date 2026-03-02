import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Membership, MembershipDocument } from './membership.schema';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
export class MembershipsService {
    constructor(
        @InjectModel(Membership.name)
        private readonly membershipModel: Model<MembershipDocument>,
    ) { }

    async create(dto: CreateMembershipDto) {
        const existing = await this.membershipModel.findOne({
            tenantId: dto.tenantId,
            userId: dto.userId,
        });

        if (existing) {
            throw new BadRequestException('User is already a member of this tenant');
        }

        const created = await this.membershipModel.create(dto);
        return created.toObject();
    }

    async update(id: string, dto: UpdateMembershipDto) {
        return this.membershipModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true })
            .lean();
    }

      async findByUserId(userId: string) {

        return this.membershipModel.findOne({ userId, isActive: true }).exec();

      }

    

      async findAllByUserId(userId: string) {

        return this.membershipModel

          .find({ userId, isActive: true })

          .populate('tenantId', 'name slug')

          .lean();

      }

    

      async findByUserIdAndTenantId(userId: string, tenantId: string) {

        return this.membershipModel.findOne({ userId, tenantId }).exec();

      }

    

      async findActiveByUserIdAndTenantId(userId: string, tenantId: string) {

        return this.membershipModel

          .findOne({ userId, tenantId, isActive: true })

          .exec();

      }

    

      async listByTenant(tenantId: string) {

        return this.membershipModel

          .find({ tenantId })

          .populate('userId', 'name email')

          .sort({ createdAt: -1 })

          .lean();

      }

    }

    