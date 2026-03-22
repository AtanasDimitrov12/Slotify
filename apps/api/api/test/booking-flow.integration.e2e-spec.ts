import request from 'supertest';
import { TestContext } from './integration-utils';

describe('Booking Flow (Integration)', () => {
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

  const ownerRegisterDto = {
    name: 'Salon Owner',
    email: 'owner@salon.com',
    password: 'password123',
    tenantName: 'Elite Cuts',
  };

  const serviceDto = {
    name: 'Classic Haircut',
    durationMin: 30,
    priceEUR: 25,
  };

  const staffDto = {
    name: 'Joe Barber',
    email: 'joe@salon.com',
    password: 'joepassword123',
  };

  it('should complete a full booking flow from setup to reservation', async () => {
    // 1. Register Owner
    const registerResponse = await request(ctx.app.getHttpServer())
      .post('/auth/register')
      .send(ownerRegisterDto)
      .expect(201);
    
    const ownerToken = registerResponse.body.accessToken;
    const tenantId = registerResponse.body.account.tenantId;
    const slug = 'elite-cuts'; // based on slugify('Elite Cuts')

    // 1.5 Set Opening Hours for Tenant (required for availability)
    await request(ctx.app.getHttpServer())
      .put('/owner/settings/opening-hours')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        days: [
          { key: 'mon', enabled: true, start: '09:00', end: '18:00' },
          { key: 'tue', enabled: true, start: '09:00', end: '18:00' },
          { key: 'wed', enabled: true, start: '09:00', end: '18:00' },
          { key: 'thu', enabled: true, start: '09:00', end: '18:00' },
          { key: 'fri', enabled: true, start: '09:00', end: '18:00' },
        ],
      })
      .expect(200);

    // 2. Create Service in catalog
    const serviceResponse = await request(ctx.app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(serviceDto)
      .expect(201);
    
    const serviceId = serviceResponse.body._id;

    // 3. Onboard Staff
    const onboardResponse = await request(ctx.app.getHttpServer())
      .post('/staff/onboard')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(staffDto)
      .expect(201);
    
    const staffUserId = onboardResponse.body.account.userId;

    // 4. Staff Login
    const loginResponse = await request(ctx.app.getHttpServer())
      .post('/auth/login')
      .send({ email: staffDto.email, password: staffDto.password })
      .expect(201);
    
    const staffToken = loginResponse.body.accessToken;

    // 5. Staff assigns Service to themselves
    await request(ctx.app.getHttpServer())
      .post('/staff/me/services')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ serviceId })
      .expect(201);

    // 6. Check Public Availability (for Monday, March 23, 2026)
    const availabilityResponse = await request(ctx.app.getHttpServer())
      .get(`/public/tenants/${slug}/availability`)
      .query({
        serviceId,
        date: '2026-03-23',
      })
      .expect(200);

    expect(availabilityResponse.body.slots.length).toBeGreaterThan(0);
    const firstSlot = availabilityResponse.body.slots[0];
    // We check that the slot is on the requested day
    expect(firstSlot.startTime).toContain('2026-03-23'); 

    // 7. Create Public Reservation
    const reservationDto = {
      serviceId,
      staffId: staffUserId,
      startTime: firstSlot.startTime,
      customerName: 'John Doe',
      customerPhone: '+31612345678',
      customerEmail: 'john@doe.com',
    };

    const reservationResponse = await request(ctx.app.getHttpServer())
      .post(`/public/tenants/${slug}/reservations`)
      .send(reservationDto)
      .expect(201);

    expect(reservationResponse.body).toHaveProperty('_id');
    expect(reservationResponse.body.status).toBe('confirmed');
    expect(reservationResponse.body.service.name).toBe(serviceDto.name);

    // 8. Verify Availability is updated (slot should be gone or blocked)
    // Actually, depending on the implementation, the slot might still be "available" if there are multiple staff, 
    // but here we only have one staff and they are now booked for that 30 min slot.
    const availabilityAfterResponse = await request(ctx.app.getHttpServer())
      .get(`/public/tenants/${slug}/availability`)
      .query({
        serviceId,
        date: '2026-03-23',
      })
      .expect(200);
    
    const slotStillThere = availabilityAfterResponse.body.slots.find(
        (s: any) => s.startTime === firstSlot.startTime
    );
    expect(slotStillThere).toBeUndefined();
  });
});
