import { Test, type TestingModule } from '@nestjs/testing';
import { CustomerProfilesService } from '../customer-profiles/customer-profiles.service';
import { CustomerReservationsController } from './customer-reservations.controller';
import { CustomerReservationsService } from './customer-reservations.service';

describe('CustomerReservationsController', () => {
  let controller: CustomerReservationsController;
  let service: CustomerReservationsService;
  let profilesService: CustomerProfilesService;

  const mockService = {
    findAllByContact: jest.fn(),
    cancelReservation: jest.fn(),
    addReview: jest.fn(),
  };

  const mockProfilesService = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerReservationsController],
      providers: [
        { provide: CustomerReservationsService, useValue: mockService },
        { provide: CustomerProfilesService, useValue: mockProfilesService },
      ],
    }).compile();

    controller = module.get<CustomerReservationsController>(CustomerReservationsController);
    service = module.get<CustomerReservationsService>(CustomerReservationsService);
    profilesService = module.get<CustomerProfilesService>(CustomerProfilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getMyReservations should call service', async () => {
    const user = { sub: 'u1', email: 'j@j.com' };
    mockProfilesService.findByUserId.mockResolvedValue({ phone: '123' });
    await controller.getMyReservations(user as any);
    expect(service.findAllByContact).toHaveBeenCalledWith('j@j.com', '123');
  });

  it('cancelReservation should call service', async () => {
    const user = { sub: 'u1', email: 'j@j.com' };
    mockProfilesService.findByUserId.mockResolvedValue({ phone: '123' });
    await controller.cancelReservation('res1', user as any);
    expect(service.cancelReservation).toHaveBeenCalledWith('res1', 'j@j.com', '123');
  });

  it('addReview should call service', async () => {
    const user = { sub: 'u1', email: 'j@j.com' };
    const dto = { rating: 5 };
    mockProfilesService.findByUserId.mockResolvedValue({ phone: '123' });
    await controller.addReview('res1', dto as any, user as any);
    expect(service.addReview).toHaveBeenCalledWith('res1', dto, 'j@j.com', '123');
  });
});
