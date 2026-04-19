import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, type TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Reservation } from '../reservations/reservation.schema';
import { CustomerReservationsService } from './customer-reservations.service';

describe('CustomerReservationsService', () => {
  let service: CustomerReservationsService;

  const mockReservation = {
    _id: new Types.ObjectId(),
    customerEmail: 'j@j.com',
    customerPhone: '123',
    status: 'confirmed',
    save: jest.fn().mockResolvedValue(this),
  };

  const mockReservationModel = {
    aggregate: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerReservationsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: mockReservationModel,
        },
      ],
    }).compile();

    service = module.get<CustomerReservationsService>(CustomerReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByContact', () => {
    it('should return empty array if no email or phone provided', async () => {
      const result = await service.findAllByContact();
      expect(result).toEqual([]);
    });

    it('should call aggregate with correct query', async () => {
      mockReservationModel.aggregate.mockResolvedValue([]);
      await service.findAllByContact('j@j.com', '123');
      expect(mockReservationModel.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            $match: {
              $or: [{ customerEmail: 'j@j.com' }, { customerPhone: '123' }],
            },
          },
        ]),
      );
    });
  });

  describe('cancelReservation', () => {
    it('should successfully cancel reservation', async () => {
      const res = {
        ...mockReservation,
        status: 'confirmed',
        save: jest.fn().mockResolvedValue({ status: 'cancelled' }),
      };
      mockReservationModel.findById.mockResolvedValue(res);

      const result = await service.cancelReservation(res._id.toString(), 'j@j.com');

      expect(res.status).toBe('cancelled');
      expect(res.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if reservation not found', async () => {
      mockReservationModel.findById.mockResolvedValue(null);
      await expect(
        service.cancelReservation(new Types.ObjectId().toString(), 'j@j.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const res = { ...mockReservation, customerEmail: 'other@o.com' };
      mockReservationModel.findById.mockResolvedValue(res);
      await expect(service.cancelReservation(res._id.toString(), 'j@j.com')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException if reservation is already completed', async () => {
      const res = { ...mockReservation, status: 'completed' };
      mockReservationModel.findById.mockResolvedValue(res);
      await expect(service.cancelReservation(res._id.toString(), 'j@j.com')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('addReview', () => {
    it('should successfully add review to completed reservation', async () => {
      const res = {
        ...mockReservation,
        status: 'completed',
        save: jest.fn().mockResolvedValue({ review: {} }),
      };
      mockReservationModel.findById.mockResolvedValue(res);

      const dto = { rating: 5, comment: 'Great!' };
      await service.addReview(res._id.toString(), dto, 'j@j.com');

      const updatedRes = res as any;
      expect(updatedRes.review).toBeDefined();
      expect(updatedRes.review.rating).toBe(5);
      expect(res.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if reservation is not completed', async () => {
      const res = { ...mockReservation, status: 'confirmed' };
      mockReservationModel.findById.mockResolvedValue(res);
      await expect(service.addReview(res._id.toString(), { rating: 5 }, 'j@j.com')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
