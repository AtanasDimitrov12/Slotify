import { Alert, type AlertColor, Snackbar } from '@mui/material';
import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

type ToastContextType = {
  showToast: (message: string, severity?: AlertColor) => void;
  showError: (error: any) => void;
  showSuccess: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const showToast = useCallback((msg: string, sev: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const showError = useCallback(
    (error: any) => {
      let msg = 'An unexpected error occurred';
      if (typeof error === 'string') {
        msg = error;
      } else if (error instanceof Error) {
        msg = error.message;
      } else if (error?.message) {
        msg = error.message;
      }
      showToast(msg, 'error');
    },
    [showToast],
  );

  const showSuccess = useCallback(
    (msg: string) => {
      showToast(msg, 'success');
    },
    [showToast],
  );

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
