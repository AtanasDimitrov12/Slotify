import { useToast } from '@barber/shared';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddStaffDialog from '../AddStaffDialog';

vi.mock('../../../../components/ToastProvider', () => ({
  useToast: vi.fn(),
}));

describe('AddStaffDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
    });
  });

  it('renders correctly when open', () => {
    render(<AddStaffDialog open={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    expect(screen.getByText(/Add Team Member/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeDisabled();
  });

  it('enables create button only when validation passes', () => {
    render(<AddStaffDialog open={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Account Password/i);
    const submitBtn = screen.getByRole('button', { name: /Create Account/i });

    // Invalid data
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    expect(submitBtn).toBeDisabled();

    // Valid data
    fireEvent.change(nameInput, { target: { value: 'John Barber' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepassword' } });
    expect(submitBtn).toBeEnabled();
  });

  it('calls onCreate and shows success on valid submission', async () => {
    mockOnCreate.mockResolvedValue(undefined);

    render(<AddStaffDialog open={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'john@doe.com' },
    });
    fireEvent.change(screen.getByLabelText(/Account Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'password123',
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(expect.stringContaining('successfully'));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error toast when onCreate fails', async () => {
    mockOnCreate.mockRejectedValue(new Error('Email already in use'));

    render(<AddStaffDialog open={true} onClose={mockOnClose} onCreate={mockOnCreate} />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'john@doe.com' },
    });
    fireEvent.change(screen.getByLabelText(/Account Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith('Email already in use');
    });
  });
});
