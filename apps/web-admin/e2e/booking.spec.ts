import { type APIRequestContext, expect, test } from '@playwright/test';
import {
  assignServiceToStaff,
  createCatalogService,
  loginApi,
  onboardStaff,
  registerOwner,
  setOwnerOpeningHours,
  setStaffAvailability,
  USER_URL,
} from './helpers';

test.describe('Public Booking Journey', () => {
  async function setupEnvironment(request: APIRequestContext) {
    const testId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const staffEmail = `joe_${testId}@example.com`;
    const password = 'password123';
    const owner = await registerOwner(request, { testId: `booking-${testId}` });

    const service = await createCatalogService(request, owner.accessToken, {
      name: 'E2E Haircut',
      durationMin: 30,
      priceEUR: 25,
    });
    await onboardStaff(request, owner.accessToken, {
      name: 'Joe E2E Barber',
      email: staffEmail,
      password,
    });
    const staffLogin = await loginApi(request, staffEmail, password, owner.tenantId);
    await assignServiceToStaff(request, staffLogin.accessToken, service.id, {
      durationMin: 30,
      priceEUR: 25,
    });
    await setOwnerOpeningHours(request, owner.accessToken);
    await setStaffAvailability(request, staffLogin.accessToken, owner.tenantId);

    return {
      owner,
    };
  }

  test('should complete a full booking from setup to confirmation', async ({ page, request }) => {
    const { owner } = await setupEnvironment(request);

    await page.goto(`${USER_URL}/salons/${owner.salonSlug}`);
    await expect(page.getByText(owner.salonName)).toBeVisible();

    await page.getByRole('button', { name: /Book Appointment Now/i }).click();

    const bookingDialog = page.getByRole('dialog');
    await expect(bookingDialog.getByText(/E2E Haircut/i)).toBeVisible({ timeout: 15000 });
    await bookingDialog.getByText(/E2E Haircut/i).click();
    await page.getByRole('button', { name: /Pick Time/i }).click();

    const slotButtons = bookingDialog.getByRole('button').filter({ hasText: /\b\d{1,2}:\d{2}\b/ });
    await expect(slotButtons.first()).toBeVisible({ timeout: 10000 });

    await slotButtons.first().click();
    await page.getByRole('button', { name: /Enter Details/i }).click();

    await page.getByLabel(/Full Name/i).fill('Jane Customer');
    await page.getByLabel(/Phone Number/i).fill('+31612345678');
    await page.getByLabel(/Email Address/i).fill('jane@example.com');
    await page.getByRole('button', { name: /Review Booking/i }).click();
    await page.getByRole('button', { name: /Confirm Reservation/i }).click();

    await expect(page.getByText(/Booking Confirmed/i)).toBeVisible();
  });
});
