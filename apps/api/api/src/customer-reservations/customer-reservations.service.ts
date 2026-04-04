import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation, ReservationDocument } from '../reservations/reservation.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class CustomerReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async findAllByContact(email?: string, phone?: string): Promise<ReservationDocument[]> {
    if (!email && !phone) {
      return [];
    }

    const query: any = { $or: [] };
    if (email) query.$or.push({ customerEmail: email.toLowerCase() });
    if (phone) query.$or.push({ customerPhone: phone });

    return this.reservationModel
      .find(query)
      .populate('tenantId', 'name slug')
      .populate('staffId', 'name displayName avatarUrl')
      .sort({ startTime: -1 })
      .exec();
  }

  async addReview(
    reservationId: string,
    dto: CreateReviewDto,
    email?: string,
    phone?: string,
  ): Promise<ReservationDocument> {
    const reservation = await this.reservationModel.findById(new Types.ObjectId(reservationId));

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Security check: ensure the reservation belongs to this customer
    const isOwner =
      (email && reservation.customerEmail === email.toLowerCase()) ||
      (phone && reservation.customerPhone === phone);

    if (!isOwner) {
      throw new ForbiddenException('You can only review your own reservations');
    }

    if (reservation.status !== 'completed') {
      throw new ForbiddenException('You can only review completed reservations');
    }

    reservation.review = {
      rating: dto.rating,
      comment: dto.comment,
      pictures: dto.pictures || [],
      createdAt: new Date(),
    };

    return reservation.save();
  }
}
