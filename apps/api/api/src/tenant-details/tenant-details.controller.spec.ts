import { Test } from '@nestjs/testing';
import type { CreateTenantDetailsDto } from './dto/create-tenant-details.dto';
import type { UpdateTenantDetailsDto } from './dto/update-tenant-details.dto';
import { TenantDetailsController } from './tenant-details.controller';
import { TenantDetailsService } from './tenant-details.service';

describe('TenantDetailsController', () => {
  let controller: TenantDetailsController;
  let service: jest.Mocked<TenantDetailsService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TenantDetailsController],
      providers: [
        {
          provide: TenantDetailsService,
          useValue: {
            create: jest.fn(),
            findByTenantId: jest.fn(),
            updateByTenantId: jest.fn(),
            upsertByTenantId: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(TenantDetailsController);
    service = moduleRef.get(TenantDetailsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create calls service.create', async () => {
    service.create.mockResolvedValue({
      tenantId: 't1',
      __v: 0,
    } as any);

    const dto: CreateTenantDetailsDto = { tenantId: 't1' };
    const res = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ tenantId: 't1', __v: 0 });
  });

  it('get calls service.findByTenantId', async () => {
    service.findByTenantId.mockResolvedValue({
      tenantId: 't1',
      __v: 0,
    } as any);

    const res = await controller.get('t1');

    expect(service.findByTenantId).toHaveBeenCalledWith('t1');
    expect(res).toEqual({ tenantId: 't1', __v: 0 });
  });

  it('patch calls service.updateByTenantId', async () => {
    service.updateByTenantId.mockResolvedValue({
      tenantId: 't1',
      contactPhone: '123',
      __v: 0,
    } as any);

    const dto: UpdateTenantDetailsDto = { contactPhone: '123' };
    const res = await controller.patch('t1', dto);

    expect(service.updateByTenantId).toHaveBeenCalledWith('t1', dto);
    expect(res).toEqual({ tenantId: 't1', contactPhone: '123', __v: 0 });
  });

  it('upsert calls service.upsertByTenantId', async () => {
    service.upsertByTenantId.mockResolvedValue({
      tenantId: 't1',
      contactEmail: 'a@b.com',
      __v: 0,
    } as any);

    const dto: UpdateTenantDetailsDto = { contactEmail: 'a@b.com' };
    const res = await controller.upsert('t1', dto);

    expect(service.upsertByTenantId).toHaveBeenCalledWith('t1', dto);
    expect(res).toEqual({ tenantId: 't1', contactEmail: 'a@b.com', __v: 0 });
  });
});
