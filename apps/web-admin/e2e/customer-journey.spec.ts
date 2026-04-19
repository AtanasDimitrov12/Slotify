import { expect, test } from '@playwright/test';
import {
  API_URL,
  assignServiceToStaff,
  createCatalogService,
  loginApi,
  loginCustomerThroughUi,
  onboardStaff,
  registerOwner,
  setOwnerOpeningHours,
  setStaffAvailability,
  USER_URL,
} from './helpers';

test.describe('Customer Journey', () => {
  test('should complete a full customer journey', async ({ page, request }) => {
    const testId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const customerEmail = `customer_${testId}@example.com`;
    const password = 'password123';
    const staffEmail = `barber_${testId}@example.com`;

    const { accessToken, tenantId, salonName } = await registerOwner(request, {
      testId: `customer-journey-${testId}`,
    });

    const serviceName = `Service ${testId}`;

    const service = await createCatalogService(request, accessToken, {
      name: serviceName,
      durationMin: 30,
      priceEUR: 20,
    });
    await onboardStaff(request, accessToken, {
      name: `Barber ${testId}`,
      email: staffEmail,
      password,
    });
    const staffLogin = await loginApi(request, staffEmail, password, tenantId);
    await assignServiceToStaff(request, staffLogin.accessToken, service.id, {
      durationMin: 30,
      priceEUR: 20,
    });
    await setOwnerOpeningHours(request, accessToken);
    await setStaffAvailability(request, staffLogin.accessToken, tenantId);

    await page.goto(`${USER_URL}/register`);
    await page.getByLabel(/Full Name/i).fill('Jane Customer');
    await page.getByLabel(/Email/i).fill(customerEmail);
    await page.getByLabel(/Phone Number/i).fill('+31612345678');
    await page.getByLabel(/Password/i).fill(password);
    await page.getByRole('button', { name: /Create account/i }).click();

    await expect(page.getByText(/Account created successfully/i)).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(`${USER_URL}/`);

    await page.goto(`${USER_URL}/salons`);
    await expect(page.getByText(salonName)).toBeVisible({ timeout: 15000 });
    await page.getByText(salonName).first().click();

    await page.getByRole('button', { name: /Book Appointment Now/i }).click();

    const bookingDialog = page.getByRole('dialog');
    await expect(bookingDialog.getByText(serviceName)).toBeVisible({ timeout: 15000 });
    await bookingDialog.getByText(serviceName).click();
    await page.getByRole('button', { name: /Pick Time/i }).click();

    const slotButtons = bookingDialog.getByRole('button').filter({ hasText: /\b\d{1,2}:\d{2}\b/ });
    await expect(slotButtons.first()).toBeVisible({ timeout: 15000 });
    await slotButtons.first().click();

    await page.getByRole('button', { name: /Enter Details/i }).click();
    await page.getByRole('button', { name: /Review Booking/i }).click();
    await page.getByRole('button', { name: /Confirm Reservation/i }).click();

    await expect(page.getByText(/Booking Confirmed/i)).toBeVisible({ timeout: 15000 });
  });

  test('should handle reservation cancellation', async ({ page, request }) => {
    const testId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const customerEmail = `cancel_customer_${testId}@example.com`;
    const password = 'password123';

    await request.post(`${API_URL}/auth/register-customer`, {
      data: {
        name: 'Cancelling Jane',
        email: customerEmail,
        password,
        phone: '+31612345678',
      },
    });

    await loginCustomerThroughUi(page, customerEmail, password);

    await page.goto(`${USER_URL}/profile`);
    await expect(page.getByText(/My Bookings/i)).toBeVisible();
  });
});
