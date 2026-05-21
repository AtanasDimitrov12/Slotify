import { AuthProvider, reportWebVitals, ToastProvider } from '@barber/shared';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7C6CFF',
      light: '#A79BFF',
      dark: '#6B5CFA',
    },
    background: {
      default: '#F6F8FC',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
    h1: { fontWeight: 1000 },
    h2: { fontWeight: 1000 },
    h3: { fontWeight: 1000 },
    h4: { fontWeight: 1000 },
    h5: { fontWeight: 1000 },
    h6: { fontWeight: 1000 },
    button: { fontWeight: 900, textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 12px 30px rgba(124,108,255,0.24)',
          '&:hover': {
            boxShadow: '0 14px 34px rgba(124,108,255,0.32)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(15,23,42,0.06)',
          border: '1px solid rgba(15,23,42,0.06)',
        },
      },
    },
  },
});

const vitals = { fcp: 0, lcp: 0, cls: 0, inp: 0, ttfb: 0 };
let reported = false;

const sendVitals = () => {
  if (reported) return;
  if (vitals.fcp || vitals.lcp || vitals.ttfb) {
    reportWebVitals(vitals).catch(() => {});
    reported = true;
  }
};

onFCP((m) => {
  vitals.fcp = m.value;
});
onLCP((m) => {
  vitals.lcp = m.value;
});
onCLS((m) => {
  vitals.cls = m.value;
});
onINP((m) => {
  vitals.inp = m.value;
});
onTTFB((m) => {
  vitals.ttfb = m.value;
  setTimeout(sendVitals, 5000);
});

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    sendVitals();
  }
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ToastProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <BrowserRouter>
            <CssBaseline />
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  </React.StrictMode>,
);
