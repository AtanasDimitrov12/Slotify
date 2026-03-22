import request from 'supertest';
import { TestContext } from './integration-utils';

describe('Staff Time-Off (Integration)', () => {
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

  const staffDto = {
    name: 'Joe Barber',
    email: 'joe@salon.com',
    password: 'joepassword123',
  };

  it('should block availability when staff has approved time-off', async () => {
    // 1. Setup Owner & Opening Hours
    const registerResponse = await request(ctx.app.getHttpServer())
      .post('/auth/register')
      .send(ownerRegisterDto);
    const ownerToken = registerResponse.body.accessToken;
    const slug = 'elite-cuts';

    await request(ctx.app.getHttpServer())
      .put('/owner/settings/opening-hours')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        days: [{ key: 'mon', enabled: true, start: '09:00', end: '18:00' }],
      });

    // 2. Create Service & Onboard Staff
    const serviceResponse = await request(ctx.app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Haircut', durationMin: 60, priceEUR: 20 });
    const serviceId = serviceResponse.body._id;

    await request(ctx.app.getHttpServer())
      .post('/staff/onboard')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(staffDto);

    // 3. Staff Login & Assign Service
    const loginResponse = await request(ctx.app.getHttpServer())
      .post('/auth/login')
      .send({ email: staffDto.email, password: staffDto.password });
    const staffToken = loginResponse.body.accessToken;

    await request(ctx.app.getHttpServer())
      .post('/staff/me/services')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ serviceId });

    // 4. Verify initial availability (should have slots)
    const initialAvail = await request(ctx.app.getHttpServer())
      .get(`/public/tenants/${slug}/availability`)
      .query({ serviceId, date: '2026-03-23' })
      .expect(200);
    expect(initialAvail.body.slots.length).toBeGreaterThan(0);

    // 5. Staff requests time off for Monday morning (09:00 - 12:00 UTC)
    const timeOffResponse = await request(ctx.app.getHttpServer())
      .post('/staff/me/time-off')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        startDate: '2026-03-23T09:00:00Z',
        endDate: '2026-03-23T12:00:00Z',
        reason: 'Dentist appointment',
      })
      .expect(201);
    
    const requestId = timeOffResponse.body.id;

    // 5.5 Owner approves the request
    await request(ctx.app.getHttpServer())
      .patch(`/staff-time-off/owner/${requestId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'approved' })
      .expect(200);

    // 6. Verify availability is blocked for that period
    const afterTimeOffAvail = await request(ctx.app.getHttpServer())
      .get(`/public/tenants/${slug}/availability`)
      .query({ serviceId, date: '2026-03-23' })
      .expect(200);

    // Slot starting at 09:00Z should be blocked
    const blockedSlot = afterTimeOffAvail.body.slots.find(
      (s: any) => s.startTime === '2026-03-23T09:00:00.000Z'
    );
    expect(blockedSlot).toBeUndefined();

    // Afternoon slots (e.g., 13:00Z) should still be there
    const afternoonSlot = afterTimeOffAvail.body.slots.find(
        (s: any) => new Date(s.startTime).getUTCHours() >= 13
    );
    expect(afternoonSlot).toBeDefined();
  });
});
