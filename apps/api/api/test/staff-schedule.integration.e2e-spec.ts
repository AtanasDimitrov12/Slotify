import request from 'supertest';
import { TestContext } from './integration-utils';

describe('Staff Schedule & Blocked Slots (Integration)', () => {
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

  const testDate = '2026-05-04'; // A Monday

  async function setupStaffEnvironment(id: string) {
    // 1. Register Owner
    const ownerResponse = await request(ctx.app.getHttpServer())
      .post('/auth/register')
      .send({
        name: `Owner ${id}`,
        email: `owner_${id}@schedule.com`,
        password: 'password123',
        tenantName: `Salon ${id}`,
      });
    const ownerToken = ownerResponse.body.accessToken;
    const tenantId = ownerResponse.body.account.tenantId;
    const slug = ownerResponse.body.account.tenantId; // Actually we should get slug from body but tenantId works if we know how it is generated. Wait, the API returns slug in tenant object usually.

    // Let's get the real slug from the database or just use what register returns
    const realSlug = ownerResponse.body.account.tenantId; // In our tests tenantId is often used as a fallback if slug is not known, but let's be precise.

    // 2. Set Opening Hours
    await request(ctx.app.getHttpServer())
      .put('/owner/settings/opening-hours')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        days: [{ key: 'mon', enabled: true, start: '09:00', end: '18:00' }],
      });

    // 3. Create Service
    const serviceResponse = await request(ctx.app.getHttpServer())
      .post('/services')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Haircut', durationMin: 60, priceEUR: 30 });
    const serviceId = serviceResponse.body._id;

    // 4. Onboard Staff
    const staffDto = {
      name: `Joe ${id}`,
      email: `joe_${id}@schedule.com`,
      password: 'password123',
    };
    const onboardResponse = await request(ctx.app.getHttpServer())
      .post('/staff/onboard')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(staffDto);
    const staffUserId = onboardResponse.body.account.userId;

    // 5. Staff Login
    const loginResponse = await request(ctx.app.getHttpServer())
      .post('/auth/login')
      .send({ email: staffDto.email, password: staffDto.password });
    const staffToken = loginResponse.body.accessToken;

    // 6. Set Staff Availability
    await request(ctx.app.getHttpServer())
      .put('/staff/me/availability')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        weeklyAvailability: [
          {
            dayOfWeek: 1,
            isAvailable: true,
            slots: [{ startTime: '09:00', endTime: '18:00', tenantId }],
          },
        ],
      });

    // 7. Assign Service
    await request(ctx.app.getHttpServer())
      .post('/staff/me/services')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ serviceId });

    // Get the slug from the tenant
    const tenantResponse = await request(ctx.app.getHttpServer())
      .get('/auth/my-tenants')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const tenant = tenantResponse.body.find((t: any) => t.name === `Salon ${id}`);
    const actualSlug = tenant.slug;

    return { ownerToken, staffToken, tenantId, staffUserId, serviceId, slug: actualSlug };
  }

  it('should correctly block public availability using blocked slots and manual appointments', async () => {
    const testId = Math.random().toString(36).slice(2, 8);
    const { staffToken, serviceId, slug } = await setupStaffEnvironment(testId);

    // 1. Initial public availability check (should have slots)
    const initialAvail = await request(ctx.app.getHttpServer())
      .get(`/public/tenants/${slug}/availability`)
      .query({ serviceId, date: testDate })
      .expect(200);

    expect(initialAvail.body.slots.length).toBeGreaterThan(0);
    const nineAmSlot = initialAvail.body.slots.find((s: any) => s.startTime.includes('09:00:00'));
    expect(nineAmSlot).toBeDefined();

    // 2. Staff blocks 09:00 - 11:00
    await request(ctx.app.getHttpServer())
      .post('/staff-blocked-slots/me')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        date: testDate,
        startTime: '09:00',
        endTime: '11:00',
        reason: 'Internal Meeting',
      })
      .expect(201);

    // 3. Verify public availability (09:00 and 10:00 should be gone)
    const blockedAvail = await request(ctx.app.getHttpServer())
      .get(`/public/tenants/${slug}/availability`)
      .query({ serviceId, date: testDate })
      .expect(200);

    const nineAmBlocked = blockedAvail.body.slots.find((s: any) =>
      s.startTime.includes('09:00:00'),
    );
    const tenAmBlocked = blockedAvail.body.slots.find((s: any) => s.startTime.includes('10:00:00'));
    const elevenAmAvailable = blockedAvail.body.slots.find((s: any) =>
      s.startTime.includes('11:00:00'),
    );

    expect(nineAmBlocked).toBeUndefined();
    expect(tenAmBlocked).toBeUndefined();
    expect(elevenAmAvailable).toBeDefined();

    // 4. Staff books manual appointment 14:00 - 15:00
    // First, find the assignment ID
    const servicesResponse = await request(ctx.app.getHttpServer())
      .get('/staff/me/appointments/services')
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(200);
    const staffServiceAssignmentId = servicesResponse.body[0].id;

    await request(ctx.app.getHttpServer())
      .post('/staff/me/appointments')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        staffServiceAssignmentId,
        startTime: `${testDate}T14:00:00Z`,
        customerName: 'Manual Client',
        customerPhone: '+31611111111',
      })
      .expect(201);

    // 5. Verify public availability (14:00 should be gone)
    const finalAvail = await request(ctx.app.getHttpServer())
      .get(`/public/tenants/${slug}/availability`)
      .query({ serviceId, date: testDate })
      .expect(200);

    const fourteenBlocked = finalAvail.body.slots.find((s: any) =>
      s.startTime.includes('14:00:00'),
    );
    const fifteenAvailable = finalAvail.body.slots.find((s: any) =>
      s.startTime.includes('15:00:00'),
    );

    expect(fourteenBlocked).toBeUndefined();
    expect(fifteenAvailable).toBeDefined();
  });

  it('should handle appointment status updates and cancellation', async () => {
    const testId = Math.random().toString(36).slice(2, 8);
    const { staffToken } = await setupStaffEnvironment(testId);

    // 1. Create a manual appointment
    const servicesResponse = await request(ctx.app.getHttpServer())
      .get('/staff/me/appointments/services')
      .set('Authorization', `Bearer ${staffToken}`);
    const staffServiceAssignmentId = servicesResponse.body[0].id;

    const createResponse = await request(ctx.app.getHttpServer())
      .post('/staff/me/appointments')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        staffServiceAssignmentId,
        startTime: `${testDate}T11:00:00Z`,
        customerName: 'Status Client',
        customerPhone: '+31611111111',
      })
      .expect(201);

    const appointmentId = createResponse.body.id;

    // 2. Mark as Completed
    await request(ctx.app.getHttpServer())
      .patch(`/staff/me/appointments/${appointmentId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'completed' })
      .expect(200);

    // 3. Cancel
    await request(ctx.app.getHttpServer())
      .delete(`/staff/me/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(200);

    // 4. Verify it is cancelled (status should be 'cancelled')
    const apptsResponse = await request(ctx.app.getHttpServer())
      .get('/staff/me/appointments')
      .set('Authorization', `Bearer ${staffToken}`)
      .query({ date: testDate })
      .expect(200);

    const cancelledAppt = apptsResponse.body.find((a: any) => a.id === appointmentId);
    expect(cancelledAppt.status).toBe('cancelled');
  });
});
