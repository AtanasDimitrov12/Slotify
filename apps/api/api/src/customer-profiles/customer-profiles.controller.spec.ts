import { Test, type TestingModule } from '@nestjs/testing';
import type { JwtPayload } from '../auth/jwt.strategy';
import { CustomerProfilesController } from './customer-profiles.controller';
import { CustomerProfilesService } from './customer-profiles.service';
import type { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

describe('CustomerProfilesController', () => {
  let controller: CustomerProfilesController;
  let service: CustomerProfilesService;

  const mockService = {
    getOrCreateByUserId: jest.fn(),
    updateByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerProfilesController],
      providers: [{ provide: CustomerProfilesService, useValue: mockService }],
    }).compile();

    controller = module.get<CustomerProfilesController>(CustomerProfilesController);
    service = module.get<CustomerProfilesService>(CustomerProfilesService);
  });

  it('getMe should call service', async () => {
    const user = { sub: 'u1' } as JwtPayload;
    await controller.getMe(user);
    expect(service.getOrCreateByUserId).toHaveBeenCalledWith('u1');
  });

  it('updateMe should call service', async () => {
    const user = { sub: 'u1' } as JwtPayload;
    const dto: UpdateCustomerProfileDto = { phone: '123' };
    await controller.updateMe(user, dto);
    expect(service.updateByUserId).toHaveBeenCalledWith('u1', dto);
  });
});
