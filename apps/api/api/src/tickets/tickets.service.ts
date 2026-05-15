import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Counter, CounterDocument } from './counter.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketDocument } from './ticket.schema';

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
    @InjectModel(Counter.name)
    private readonly counterModel: Model<CounterDocument>,
  ) {}

  private async getNextCode(tenantId?: string): Promise<string> {
    const counterName = `tickets_${tenantId || 'global'}`;
    const counter = await this.counterModel.findOneAndUpdate(
      { name: counterName },
      { $inc: { count: 1 } },
      { upsert: true, new: true },
    );

    const num = counter.count.toString().padStart(3, '0');
    return `SLT-${num}`;
  }

  async create(
    tenantId: string | undefined,
    requestedBy: string,
    dto: CreateTicketDto,
  ): Promise<TicketDocument> {
    const code = await this.getNextCode(tenantId);
    const createdTicket = new this.ticketModel({
      ...dto,
      code,
      tenantId: tenantId ? new Types.ObjectId(tenantId) : undefined,
      requestedBy: new Types.ObjectId(requestedBy),
    });
    return createdTicket.save();
  }

  async findAll(
    tenantId?: string,
    filters?: { stage?: string; search?: string; requestedBy?: string },
  ): Promise<TicketDocument[]> {
    const query: any = {};
    if (tenantId) {
      query.tenantId = new Types.ObjectId(tenantId);
    }
    if (filters?.requestedBy) {
      query.requestedBy = new Types.ObjectId(filters.requestedBy);
    }
    if (filters?.stage) {
      query.stage = filters.stage;
    }
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { code: { $regex: filters.search, $options: 'i' } },
      ];
    }
    return this.ticketModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(
    tenantId: string | undefined,
    id: string,
    requestedBy?: string,
  ): Promise<TicketDocument> {
    const query: any = { _id: new Types.ObjectId(id) };
    if (tenantId) {
      query.tenantId = new Types.ObjectId(tenantId);
    }
    if (requestedBy) {
      query.requestedBy = new Types.ObjectId(requestedBy);
    }

    const ticket = await this.ticketModel.findOne(query).exec();

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async update(
    tenantId: string | undefined,
    id: string,
    dto: UpdateTicketDto,
    requestedBy?: string,
  ): Promise<TicketDocument> {
    const ticket = await this.findOne(tenantId, id, requestedBy);

    // If moving to 'done', set completedAt
    if (dto.stage === 'done' && ticket.stage !== 'done') {
      ticket.completedAt = new Date();
    }

    // Ensure ticket has a code (for legacy tickets being updated)
    if (!ticket.code) {
      ticket.code = await this.getNextCode(ticket.tenantId?.toString());
    }

    Object.assign(ticket, dto);
    return ticket.save();
  }

  async start(
    tenantId: string | undefined,
    id: string,
    requestedBy?: string,
  ): Promise<TicketDocument> {
    const ticket = await this.findOne(tenantId, id, requestedBy);

    ticket.stage = 'in_progress';
    ticket.startedAt = new Date();

    return ticket.save();
  }

  async finish(
    tenantId: string | undefined,
    id: string,
    requestedBy?: string,
  ): Promise<TicketDocument> {
    const ticket = await this.findOne(tenantId, id, requestedBy);

    ticket.stage = 'done';
    ticket.completedAt = new Date();

    return ticket.save();
  }

  async remove(
    tenantId: string | undefined,
    id: string,
    requestedBy?: string,
  ): Promise<void> {
    const query: any = { _id: new Types.ObjectId(id) };
    if (tenantId) {
      query.tenantId = new Types.ObjectId(tenantId);
    }
    if (requestedBy) {
      query.requestedBy = new Types.ObjectId(requestedBy);
    }

    const result = await this.ticketModel.deleteOne(query).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
  }
}
