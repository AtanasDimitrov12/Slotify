import { test, expect, type APIRequestContext } from '@playwright/test';

test.describe('Public Booking Journey', () => {
  const timestamp = Date.now();
  const ownerEmail = `owner_${timestamp}@example.com`;
  const ownerPassword = 'password123';
  const staffEmail = `joe_${timestamp}@example.com`;
  const salonName = `E2E Salon ${timestamp}`;
  const salonSlug = `e2e-salon-${timestamp}`;

  async function setupEnvironment(request: APIRequestContext) {

    const registerRes = await request.post('http://localhost:4000/auth/register', {
      data: {
        name: 'E2E Owner',
        email: ownerEmail,
        password: ownerPassword,
        tenantName: salonName,
      },
    });

    expect(registerRes.ok()).toBeTruthy();
    return registerRes.json();
  }

  test('should complete a full booking from setup to confirmation', async ({ page, request }) => {
    try {
      await setupEnvironment(request);

      // 1. Owner login
      await page.goto('/login');
      await page.getByLabel(/Email/i).fill(ownerEmail);
      await page.getByLabel(/Password/i).fill(ownerPassword);
      await page.getByRole('button', { name: /Sign in/i }).click();

      await expect(page).toHaveURL(/\/owner/);

      // 2. Open Monday explicitly
      await page.goto('/owner/settings');
      await page.getByRole('tab', { name: /Opening Hours/i }).click();

      const mondayRow = page
        .locator('*')
        .filter({ has: page.getByText(/^Monday$/) })
        .filter({ has: page.getByRole('checkbox') })
        .first();

      const mondaySwitch = mondayRow.getByRole('checkbox').first();
      if (!(await mondaySwitch.isChecked())) {
        await mondaySwitch.click();
      }

      await page.getByRole('button', { name: /Save Hours/i }).click();
      await expect(page.getByText(/successfully/i)).toBeVisible();

      // 3. Create service
      await page.goto('/owner/services');
      await page.getByRole('button', { name: /Add Service/i }).click();
      await page.getByLabel(/Service Name/i).fill('E2E Haircut');
      await page.getByLabel(/Duration/i).fill('30');
      await page.getByLabel(/Price/i).fill('25');
      await page.getByRole('button', { name: /Create Service/i }).click();
      await expect(page.getByText(/E2E Haircut/i)).toBeVisible();

      // 4. Add staff
      await page.goto('/owner/team');
      await page.getByRole('button', { name: /Add Staff/i }).click();
      await page.getByLabel(/Full Name/i).fill('Joe E2E Barber');
      await page.getByLabel(/Email Address/i).fill(staffEmail);
      await page.getByLabel(/Account Password/i).fill('password123');
      await page.getByRole('button', { name: /Create Account/i }).click();
      await expect(page.getByText(/Joe E2E Barber/i)).toBeVisible();

      // 5. Staff login + assign service
      await page.goto('/login');
      await page.getByLabel(/Email/i).fill(staffEmail);
      await page.getByLabel(/Password/i).fill('password123');
      await page.getByRole('button', { name: /Sign in/i }).click();

      await expect(page).toHaveURL(/\/staff/);

      await page.goto('/staff/services');
      await page.getByRole('button', { name: /Add Service/i }).click();
      await page.getByLabel(/Select Service/i).click();
      await page.getByRole('option', { name: /E2E Haircut/i }).click();
      await page.getByRole('button', { name: /Start Offering Service/i }).click();
      await expect(page.getByText(/E2E Haircut/i)).toBeVisible();

      // 6. Staff availability — this is the missing piece
      await page.goto('/staff/availability');

      const mondayAvailabilityRow = page
        .locator('*')
        .filter({ has: page.getByText(/^Mon$/) })
        .filter({ has: page.getByRole('checkbox') })
        .first();

      const mondayAvailabilitySwitch = mondayAvailabilityRow.getByRole('checkbox').first();
      if (!(await mondayAvailabilitySwitch.isChecked())) {
        await mondayAvailabilitySwitch.click();
      }

      await page.getByRole('button', { name: /Save Schedule/i }).click();
      await expect(page.getByText(/successfully/i)).toBeVisible();

      // 7. Public booking
      await page.goto(`/salons/${salonSlug}`);
      await expect(page.getByText(salonName)).toBeVisible();

      await page.getByRole('button', { name: /Book Appointment Now/i }).click();

      const serviceButton = page.getByRole('button', { name: /E2E Haircut/i });
      if (await serviceButton.isVisible()) {
        await serviceButton.click();
      }

      await page.getByRole('button', { name: /Choose Staff/i }).click();
      await page.getByText(/Any available professional/i).click();
      await page.getByRole('button', { name: /Pick Time/i }).click();

      // Choose a Monday date explicitly
      await page.getByRole('button', { name: /^Mon /i }).first().click();

      const slotButtons = page.getByRole('button').filter({ hasText: /\b\d{1,2}:\d{2}\b/ });
      await expect(slotButtons.first()).toBeVisible({ timeout: 10000 });

      await slotButtons.first().click();
      await page.getByRole('button', { name: /Enter Details/i }).click();

      await page.getByLabel(/Full Name/i).fill('Jane Customer');
      await page.getByLabel(/Phone Number/i).fill('0612345678');
      await page.getByLabel(/Email Address/i).fill('jane@example.com');
      await page.getByRole('button', { name: /Confirm Reservation/i }).click();

      await expect(page.getByText(/Booking Confirmed/i)).toBeVisible();
      await expect(page.getByText(/E2E Haircut/i)).toBeVisible();
    } finally {
      await request.post('http://localhost:4000/test/cleanup-e2e', {
        data: {
          ownerEmail,
          staffEmail,
          salonName,
          salonSlug,
        },
      });
    }
  });
});
