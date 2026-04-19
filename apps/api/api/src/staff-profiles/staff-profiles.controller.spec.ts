import { Test, type TestingModule } from '@nestjs/testing';
import { StaffProfilesController } from './staff-profiles.controller';
import { StaffProfilesService } from './staff-profiles.service';

describe('StaffProfilesController', () => {
  let controller: StaffProfilesController;
  let service: StaffProfilesService;

  const mockService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffProfilesController],
      providers: [{ provide: StaffProfilesService, useValue: mockService }],
    }).compile();

    controller = module.get<StaffProfilesController>(StaffProfilesController);
    service = module.get<StaffProfilesService>(StaffProfilesService);
  });

  it('create should call service.create', async () => {
    const dto = { userId: 'u1', displayName: 'John' };
    await controller.create(dto as any);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findOne should call service.findOne', async () => {
    await controller.findOne('id1');
    expect(service.findOne).toHaveBeenCalledWith('id1');
  });

  it('update should call service.update', async () => {
    const dto = { displayName: 'New' };
    await controller.update('id1', dto as any);
    expect(service.update).toHaveBeenCalledWith('id1', dto);
  });

  it('remove should call service.remove', async () => {
    await controller.remove('id1');
    expect(service.remove).toHaveBeenCalledWith('id1');
  });
});
