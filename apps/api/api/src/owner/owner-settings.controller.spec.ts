import { Test, type TestingModule } from '@nestjs/testing';
import type { JwtPayload } from '../auth/jwt.strategy';
import type { UpdateBusinessGeneralDto } from './dto/update-business-general.dto';
import type { UpdateOpeningHoursDto } from './dto/update-opening-hours.dto';
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
    const user = { sub: 'u1' } as unknown as JwtPayload;
    await controller.getSettings(user);
    expect(service.getSettings).toHaveBeenCalledWith(user);
  });

  it('updateGeneral should call service', async () => {
    const user = { sub: 'u1' } as unknown as JwtPayload;
    const dto: UpdateBusinessGeneralDto = { salonName: 'New' };
    await controller.updateGeneral(user, dto);
    expect(service.updateGeneral).toHaveBeenCalledWith(user, dto);
  });

  it('updateOpeningHours should call service', async () => {
    const user = { sub: 'u1' } as unknown as JwtPayload;
    const dto: UpdateOpeningHoursDto = { days: [] };
    await controller.updateOpeningHours(user, dto);
    expect(service.updateOpeningHours).toHaveBeenCalledWith(user, dto);
  });
});
