import { Test, type TestingModule } from '@nestjs/testing';
import { CustomerProfilesController } from './customer-profiles.controller';
import { CustomerProfilesService } from './customer-profiles.service';

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
    const user = { sub: 'u1' };
    await controller.getMe(user as any);
    expect(service.getOrCreateByUserId).toHaveBeenCalledWith('u1');
  });

  it('updateMe should call service', async () => {
    const user = { sub: 'u1' };
    const dto = { phone: '123' };
    await controller.updateMe(user as any, dto as any);
    expect(service.updateByUserId).toHaveBeenCalledWith('u1', dto);
  });
});
