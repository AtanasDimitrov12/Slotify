import { Test, type TestingModule } from '@nestjs/testing';
import type { JwtPayload } from '../auth/jwt.strategy';
import { CustomerProfilesService } from '../customer-profiles/customer-profiles.service';
import { CustomerReservationsController } from './customer-reservations.controller';
import { CustomerReservationsService } from './customer-reservations.service';
import type { CreateReviewDto } from './dto/create-review.dto';

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
    const user = { sub: 'u1', email: 'j@j.com' } as JwtPayload;
    mockProfilesService.findByUserId.mockResolvedValue({ phone: '123' });
    await controller.getMyReservations(user);
    expect(service.findAllByContact).toHaveBeenCalledWith('j@j.com', '123');
  });

  it('cancelReservation should call service', async () => {
    const user = { sub: 'u1', email: 'j@j.com' } as JwtPayload;
    mockProfilesService.findByUserId.mockResolvedValue({ phone: '123' });
    await controller.cancelReservation('res1', user);
    expect(service.cancelReservation).toHaveBeenCalledWith('res1', 'j@j.com', '123');
  });

  it('addReview should call service', async () => {
    const user = { sub: 'u1', email: 'j@j.com' } as JwtPayload;
    const dto: CreateReviewDto = { rating: 5 };
    mockProfilesService.findByUserId.mockResolvedValue({ phone: '123' });
    await controller.addReview('res1', dto, user);
    expect(service.addReview).toHaveBeenCalledWith('res1', dto, 'j@j.com', '123');
  });
});
