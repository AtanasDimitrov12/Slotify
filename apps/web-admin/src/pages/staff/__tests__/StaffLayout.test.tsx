import { getMyTenants, useAuth, useToast } from '@barber/shared';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StaffLayout from '../StaffLayout';

const mockUnifiedSidebar = vi.fn();
const mockSwitchTenant = vi.fn();

vi.mock('@barber/shared', async () => {
  const actual = await vi.importActual('@barber/shared');
  return {
    ...actual,
    getMyTenants: vi.fn(),
    useAuth: vi.fn(),
    useToast: vi.fn(),
  };
});

vi.mock('../../../layout/UnifiedSidebar', () => ({
  default: (props: unknown) => {
    mockUnifiedSidebar(props);
    return <div data-testid="staff-sidebar" />;
  },
}));

describe('StaffLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('min-width'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    vi.mocked(useAuth).mockReturnValue({
      user: {
        name: 'Staff User',
        email: 'staff@example.com',
        tenantId: 'tenant-2',
      },
      switchTenant: mockSwitchTenant,
    } as any);

    vi.mocked(useToast).mockReturnValue({
      showSuccess: vi.fn(),
      showError: vi.fn(),
    } as any);

    vi.mocked(getMyTenants).mockResolvedValue([
      { _id: 'tenant-1', name: 'Salon One', slug: 'salon-one' },
      { _id: 'tenant-2', name: 'Salon Two', slug: 'salon-two' },
    ] as any);
  });

  it('passes tenant switching props to the shared sidebar', async () => {
    render(
      <MemoryRouter initialEntries={['/staff/services']}>
        <StaffLayout />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('staff-sidebar')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockUnifiedSidebar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          availableTenants: [
            { _id: 'tenant-1', name: 'Salon One', slug: 'salon-one' },
            { _id: 'tenant-2', name: 'Salon Two', slug: 'salon-two' },
          ],
          currentTenantId: 'tenant-2',
          onSwitchTenant: expect.any(Function),
        }),
      );
    });
  });
});
