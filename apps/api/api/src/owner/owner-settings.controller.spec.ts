import { Test, type TestingModule } from '@nestjs/testing';
import { OwnerSettingsController } from './owner-settings.controller';
import { OwnerSettingsService } from './owner-settings.service';

describe('OwnerSettingsController', () => {
  let controller: OwnerSettingsController;
  let service: OwnerSettingsService;

  const mockService = {
    getSettings: jest.fn(),
    updateGeneral: jest.fn(),
    updateOpeningHours: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OwnerSettingsController],
      providers: [{ provide: OwnerSettingsService, useValue: mockService }],
    }).compile();

    controller = module.get<OwnerSettingsController>(OwnerSettingsController);
    service = module.get<OwnerSettingsService>(OwnerSettingsService);
  });

  it('getSettings should call service', async () => {
    const user = { sub: 'u1' };
    await controller.getSettings(user as any);
    expect(service.getSettings).toHaveBeenCalledWith(user);
  });

  it('updateGeneral should call service', async () => {
    const user = { sub: 'u1' };
    const dto = { salonName: 'New' };
    await controller.updateGeneral(user as any, dto as any);
    expect(service.updateGeneral).toHaveBeenCalledWith(user, dto);
  });

  it('updateOpeningHours should call service', async () => {
    const user = { sub: 'u1' };
    const dto = { days: [] };
    await controller.updateOpeningHours(user as any, dto as any);
    expect(service.updateOpeningHours).toHaveBeenCalledWith(user, dto);
  });
});
