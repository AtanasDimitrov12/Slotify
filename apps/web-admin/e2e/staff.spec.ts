import { expect, test } from '@playwright/test';
import {
  assignServiceToStaff,
  createCatalogService,
  loginApi,
  loginThroughUi,
  onboardStaff,
  registerOwner,
  setOwnerOpeningHours,
  setStaffAvailability,
} from './helpers';

test.describe('Staff Operations', () => {
  const getTestId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  test('should manage personal services', async ({ page, request }) => {
    const testId = getTestId();
    const staffEmail = `staff_svc_barber_${testId}@example.com`;
    const password = 'password123';

    const { accessToken } = await registerOwner(request, { testId: `staff-svc-${testId}` });

    await onboardStaff(request, accessToken, {
      name: 'Barber',
      email: staffEmail,
      password,
    });

    await createCatalogService(request, accessToken, {
      name: 'Staff Op Service',
      durationMin: 30,
      priceEUR: 20,
    });

    await loginThroughUi(page, staffEmail, password);
    await expect(page).toHaveURL(/\/staff/);

    await page.goto('/staff/services');
    await page.getByRole('button', { name: /Add Service/i }).click();

    await page.getByLabel(/Select Service/i).click();
    await page.getByRole('option', { name: /Staff Op Service/i }).click();
    await page.getByLabel(/Price Override/i).fill('25');
    await page.getByRole('button', { name: /Start Offering Service/i }).click();

    await expect(page.getByText(/Staff Op Service/i)).toBeVisible();
    await expect(page.getByText(/€25/i)).toBeVisible();
  });

  test('should manage availability', async ({ page, request }) => {
    const testId = getTestId();
    const staffEmail = `staff_avail_barber_${testId}@example.com`;
    const password = 'password123';

    await registerOwner(request, { testId: `staff-avail-${testId}` }).then(({ accessToken }) =>
      onboardStaff(request, accessToken, {
        name: 'Barber',
        email: staffEmail,
        password,
      }),
    );

    await loginThroughUi(page, staffEmail, password, {
      expectedPath: /\/staff/,
    });

    await expect(page).toHaveURL(/\/staff/);

    await page.goto('/staff/availability');

    const mondayCard = page.locator('text=Mon').locator('..').locator('..').first();
    const saveButton = page.getByRole('button', { name: /Save Schedule/i });

    await mondayCard.getByRole('button', { name: /Add Slot/i }).click();
    await saveButton.click();

    await expect(saveButton).toBeEnabled({
      timeout: 15000,
    });
  });

  test('should block slots correctly', async ({ page, request }) => {
    const testId = getTestId();
    const staffEmail = `staff_block_barber_${testId}@example.com`;
    const password = 'password123';

    await registerOwner(request, { testId: `staff-block-${testId}` }).then(({ accessToken }) =>
      onboardStaff(request, accessToken, {
        name: 'Barber',
        email: staffEmail,
        password,
      }),
    );

    await loginThroughUi(page, staffEmail, password);
    await expect(page).toHaveURL(/\/staff/);

    await page.goto('/staff/blocked-slots');
    await page.getByRole('button', { name: /Block Hours/i }).click();

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];

    await page.getByLabel(/^Date$/i).fill(dateStr);
    await page.getByLabel(/Start Time/i).fill('10:00');
    await page.getByLabel(/End Time/i).fill('12:00');
    await page.getByLabel(/Reason/i).fill('Personal Errand');

    // Use a more specific selector for the button in the dialog to avoid confusion with the header button
    const blockButton = page.getByRole('dialog').getByRole('button', { name: /^Block Hours$/i });
    await blockButton.click();

    // Wait for the dialog to be hidden to avoid multiple matches for the text (one in dialog, one in list)
    await expect(page.getByRole('dialog')).toBeHidden();

    await expect(page.getByText('Personal Errand')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should handle manual appointments', async ({ page, request }) => {
    const testId = getTestId();
    const staffEmail = `staff_appt_barber_${testId}@example.com`;
    const password = 'password123';

    const { accessToken, tenantId, salonName } = await registerOwner(request, {
      testId: `staff-appt-${testId}`,
    });

    await setOwnerOpeningHours(request, accessToken);

    const staff = await onboardStaff(request, accessToken, {
      name: 'Barber',
      email: staffEmail,
      password,
    });

    const service = await createCatalogService(request, accessToken, {
      name: 'Manual Service',
      durationMin: 30,
      priceEUR: 20,
    });

    const staffLogin = await loginApi(request, staffEmail, password, tenantId);

    await setStaffAvailability(request, staffLogin.accessToken, tenantId);

    await assignServiceToStaff(request, staffLogin.accessToken, service.id, {
      durationMin: 30,
      priceEUR: 20,
    });

    await loginThroughUi(page, staffEmail, password, {
      expectedPath: /\/staff/,
    });

    await expect(page).toHaveURL(/\/staff/);

    await page.goto('/staff/schedule');

    await page.getByRole('button', { name: /Add Appointment/i }).click();

    await page.getByLabel(/Select Salon/i).click();
    await page.getByRole('option', { name: new RegExp(salonName, 'i') }).click();

    await page.getByLabel(/Select Service/i).click();
    await page.getByRole('option', { name: /Manual Service/i }).click();

    await page.getByLabel(/Start Time/i).fill('14:00');
    await page.getByLabel(/Customer Name/i).fill('Test Client');
    await page.getByLabel(/Phone Number/i).fill('+31612345678');

    const bookButton = page.getByRole('button', { name: /^Book Appointment$/i });

    await expect(bookButton).toBeVisible();
    await expect(bookButton).toBeEnabled();

    const [createAppointmentResponse] = await Promise.all([
      page.waitForResponse((response) => {
        const url = response.url().toLowerCase();

        return response.request().method() === 'POST' && url.includes('appointment');
      }),
      bookButton.click(),
    ]);

    const responseBody = await createAppointmentResponse.text();
    expect(createAppointmentResponse.ok(), responseBody).toBeTruthy();

    await expect(page.getByRole('dialog')).toBeHidden();

    await expect(page.getByText(/Appointment booked successfully/i)).toBeVisible({
      timeout: 15000,
    });

    await expect(page.getByText(/Test Client/i).first()).toBeVisible({
      timeout: 15000,
    });

    await page
      .getByText(/Test Client/i)
      .first()
      .click({ force: true });

    await page.getByRole('button', { name: /Mark as Done/i }).click();

    await expect(page.getByText(/Done|Completed/i).first()).toBeVisible({
      timeout: 10000,
    });
  });
});
