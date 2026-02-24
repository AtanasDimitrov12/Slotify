import { Test } from '@nestjs/testing';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

describe('TenantsController', () => {
  let controller: TenantsController;
  let service: jest.Mocked<TenantsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(TenantsController);
    service = moduleRef.get(TenantsService) as jest.Mocked<TenantsService>;
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to service.create', async () => {
    service.create.mockResolvedValue({ _id: 't1', slug: 'fade-factory' } as any);

    const dto: any = { name: 'Fade Factory', ownerEmail: 'owner@x.com' };
    const res = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ _id: 't1', slug: 'fade-factory' });
  });

  it('findAll delegates to service.findAll', async () => {
    service.findAll.mockResolvedValue([{ _id: 't1' }] as any);

    const res = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(res).toEqual([{ _id: 't1' }]);
  });

  it('findOne delegates to service.findOne', async () => {
    service.findOne.mockResolvedValue({ _id: 't1' } as any);

    const res = await controller.findOne('t1');

    expect(service.findOne).toHaveBeenCalledWith('t1');
    expect(res).toEqual({ _id: 't1' });
  });

  it('update delegates to service.update', async () => {
    service.update.mockResolvedValue({ _id: 't1', timezone: 'Europe/Sofia' } as any);

    const dto: any = { timezone: 'Europe/Sofia' };
    const res = await controller.update('t1', dto);

    expect(service.update).toHaveBeenCalledWith('t1', dto);
    expect(res).toEqual({ _id: 't1', timezone: 'Europe/Sofia' });
  });

  it('remove delegates to service.remove', async () => {
    service.remove.mockResolvedValue({ deleted: true, id: 't1' } as any);

    const res = await controller.remove('t1');

    expect(service.remove).toHaveBeenCalledWith('t1');
    expect(res).toEqual({ deleted: true, id: 't1' });
  });
});