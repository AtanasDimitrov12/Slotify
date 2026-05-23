import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type QueryFilter, Types } from 'mongoose';
import { Reservation, ReservationDocument } from '../reservations/reservation.schema';
import { CreateReviewDto } from './dto/create-review.dto';

export interface AggregatedReservation extends Omit<Reservation, 'tenantId'> {
  _id: Types.ObjectId;
  tenantId: {
    _id: Types.ObjectId;
    name: string;
    slug: string;
  };
  staffName: string;
  staffAvatarUrl: string;
}

@Injectable()
export class CustomerReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
  ) {}

  async findAllByContact(email?: string, phone?: string): Promise<AggregatedReservation[]> {
    if (!email && !phone) {
      return [];
    }

    const query: QueryFilter<ReservationDocument> = { $or: [] };
    if (email && query.$or) query.$or.push({ customerEmail: email.toLowerCase() });
    if (phone && query.$or) query.$or.push({ customerPhone: phone });

    return this.reservationModel.aggregate<AggregatedReservation>([
      { $match: query },
      { $sort: { startTime: -1 } },
      {
        $lookup: {
          from: 'tenants',
          localField: 'tenantId',
          foreignField: '_id',
          as: 'tenantId',
        },
      },
      { $unwind: '$tenantId' },
      {
        $lookup: {
          from: 'staffprofiles',
          localField: 'staffId',
          foreignField: 'userId',
          as: 'staffProfile',
        },
      },
      {
        $addFields: {
          staffName: {
            $ifNull: [
              { $arrayElemAt: ['$staffProfile.displayName', 0] },
              '$staffName',
              'Professional',
            ],
          },
          staffAvatarUrl: {
            $ifNull: [{ $arrayElemAt: ['$staffProfile.avatarUrl', 0] }, '$staffAvatarUrl', ''],
          },
        },
      },
      {
        $project: {
          staffProfile: 0,
        },
      },
    ]);
  }

  async cancelReservation(
    reservationId: string,
    email?: string,
    phone?: string,
  ): Promise<ReservationDocument> {
    const reservation = await this.reservationModel.findById(new Types.ObjectId(reservationId));

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const isOwner =
      (email && reservation.customerEmail === email.toLowerCase()) ||
      (phone && reservation.customerPhone === phone);

    if (!isOwner) {
      throw new ForbiddenException('You can only cancel your own reservations');
    }

    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      throw new ForbiddenException(
        `Cannot cancel a reservation that is already ${reservation.status}`,
      );
    }

    reservation.status = 'cancelled';
    return reservation.save();
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
