import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { Stage, StageDocument } from './stage.schema';

@Injectable()
export class StagesService {
  constructor(
    @InjectModel(Stage.name)
    private readonly stageModel: Model<StageDocument>,
  ) {}

  private readonly defaultStages = [
    { name: 'user_requested', label: 'User Requested', order: 0, color: '#FEE2E2' },
    { name: 'owner_requested', label: 'Owner Requests', order: 1, color: '#FEF3C7' },
    { name: 'internal', label: 'Internal Backlog', order: 2, color: '#F8FAFC' },
    { name: 'in_progress', label: 'In Progress', order: 3, color: '#DBEAFE' },
    { name: 'done', label: 'Done', order: 4, color: '#DCFCE7' },
  ];

  async findAll(tenantId: string): Promise<StageDocument[]> {
    const stages = await this.stageModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ order: 1 })
      .exec();

    if (stages.length === 0) {
      // Seed default stages
      const createdStages = await this.stageModel.insertMany(
        this.defaultStages.map((s) => ({
          ...s,
          tenantId: new Types.ObjectId(tenantId),
        })),
      );
      return createdStages as unknown as StageDocument[];
    }

    return stages;
  }

  async create(tenantId: string, dto: CreateStageDto): Promise<StageDocument> {
    const lastStage = await this.stageModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ order: -1 })
      .exec();

    const order = dto.order ?? (lastStage ? lastStage.order + 1 : 0);

    const createdStage = new this.stageModel({
      ...dto,
      order,
      tenantId: new Types.ObjectId(tenantId),
    });
    return createdStage.save();
  }

  async update(tenantId: string, id: string, dto: UpdateStageDto): Promise<StageDocument> {
    const stage = await this.stageModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
        { $set: dto },
        { new: true },
      )
      .exec();

    if (!stage) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }

    return stage;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await this.stageModel
      .deleteOne({ _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Stage with ID ${id} not found`);
    }
  }

  async updateOrder(tenantId: string, stageOrders: { id: string; order: number }[]): Promise<void> {
    const bulkOps = stageOrders.map((so) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(so.id), tenantId: new Types.ObjectId(tenantId) },
        update: { $set: { order: so.order } },
      },
    }));

    await this.stageModel.bulkWrite(bulkOps);
  }
}
