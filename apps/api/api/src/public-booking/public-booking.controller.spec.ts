import { Test, type TestingModule } from '@nestjs/testing';
import { PublicBookingController } from './public-booking.controller';
import { PublicBookingService } from './public-booking.service';

describe('PublicBookingController', () => {
  let controller: PublicBookingController;
  let service: PublicBookingService;

  const mockService = {
    getBookingOptionsBySlug: jest.fn(),
    getAvailabilityBySlug: jest.fn(),
    createReservationLockBySlug: jest.fn(),
    createReservationBySlug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicBookingController],
      providers: [{ provide: PublicBookingService, useValue: mockService }],
    }).compile();

    controller = module.get<PublicBookingController>(PublicBookingController);
    service = module.get<PublicBookingService>(PublicBookingService);
  });

  it('getBookingOptions should call service', async () => {
    await controller.getBookingOptions('slug1');
    expect(service.getBookingOptionsBySlug).toHaveBeenCalledWith('slug1');
  });

  it('getAvailability should call service', async () => {
    const query = { serviceId: 's1', date: '2026-01-01' };
    await controller.getAvailability('slug1', query as any);
    expect(service.getAvailabilityBySlug).toHaveBeenCalledWith('slug1', query);
  });

  it('createLock should call service', async () => {
    const dto = { serviceId: 's1', staffId: 'u1', startTime: '...' };
    await controller.createLock('slug1', dto as any);
    expect(service.createReservationLockBySlug).toHaveBeenCalledWith('slug1', dto);
  });

  it('createReservation should call service', async () => {
    const dto = {
      serviceId: 's1',
      staffId: 'u1',
      startTime: '...',
      customerName: 'X',
      customerPhone: '1',
    };
    await controller.createReservation('slug1', dto as any);
    expect(service.createReservationBySlug).toHaveBeenCalledWith('slug1', dto);
  });
});
