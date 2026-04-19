import request from 'supertest';
import { TestContext } from './integration-utils';

describe('Salon Management (Integration)', () => {
  const ctx = new TestContext();

  beforeAll(async () => {
    await ctx.setup();
  });

  afterAll(async () => {
    await ctx.close();
  });

  beforeEach(async () => {
    await ctx.cleanup();
  });

  async function registerOwner(id: string) {
    const response = await request(ctx.app.getHttpServer())
      .post('/auth/register')
      .send({
        name: `Owner ${id}`,
        email: `owner_${id}@services.com`,
        password: 'password123',
        tenantName: `Salon ${id}`,
      });
    return {
      token: response.body.accessToken,
      tenantId: response.body.account.tenantId,
      userId: response.body.account._id,
    };
  }

  it('should manage catalog services correctly', async () => {
    const testId = Math.random().toString(36).slice(2, 8);
    const { token } = await registerOwner(testId);

    // 1. Create Service
    const createResponse = await request(ctx.app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Service',
        durationMin: 45,
        priceEUR: 40,
        description: 'Testing description',
      })
      .expect(201);
    
    const serviceId = createResponse.body._id;
    expect(createResponse.body.name).toBe('Test Service');

    // 2. List Services
    const listResponse = await request(ctx.app.getHttpServer())
      .get('/services/catalog')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(listResponse.body.some((s: any) => s._id === serviceId)).toBe(true);

    // 3. Update Service
    await request(ctx.app.getHttpServer())
      .patch(`/services/${serviceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ priceEUR: 50 })
      .expect(200);

    const updated = await request(ctx.app.getHttpServer())
      .get(`/services/${serviceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(updated.body.priceEUR).toBe(50);

    // 4. Remove Service
    await request(ctx.app.getHttpServer())
      .delete(`/services/${serviceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    const listAfterDelete = await request(ctx.app.getHttpServer())
      .get('/services/catalog')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(listAfterDelete.body.some((s: any) => s._id === serviceId)).toBe(false);
  });

  it('should manage tenant settings and multiple salons', async () => {
    const testId = Math.random().toString(36).slice(2, 8);
    const { token } = await registerOwner(testId);

    // 1. Update Opening Hours
    await request(ctx.app.getHttpServer())
      .put('/owner/settings/opening-hours')
      .set('Authorization', `Bearer ${token}`)
      .send({
        days: [
          { key: 'mon', enabled: true, start: '10:00', end: '20:00' },
        ],
      })
      .expect(200);

    // 2. Create Second Salon
    const secondSaloneResponse = await request(ctx.app.getHttpServer())
      .post('/tenants/my-salons')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Second Salon' })
      .expect(201);
    
    const secondTenantId = secondSaloneResponse.body._id;

    // 3. List my tenants
    const tenantsResponse = await request(ctx.app.getHttpServer())
      .get('/auth/my-tenants')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(tenantsResponse.body.length).toBe(2);
    expect(tenantsResponse.body.some((t: any) => t.name === 'Second Salon')).toBe(true);

    // 4. Switch to second salon
    const switchResponse = await request(ctx.app.getHttpServer())
      .post('/auth/switch')
      .set('Authorization', `Bearer ${token}`)
      .send({ tenantId: secondTenantId })
      .expect(201);
    
    expect(switchResponse.body.account.tenantId).toBe(secondTenantId);
    const newToken = switchResponse.body.accessToken;

    // 5. Verify service list is empty in second salon
    const servicesInSecond = await request(ctx.app.getHttpServer())
      .get('/services/catalog')
      .set('Authorization', `Bearer ${newToken}`)
      .expect(200);
    
    expect(servicesInSecond.body.length).toBe(0);
  });
});
