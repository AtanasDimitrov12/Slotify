import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createTheme, ThemeProvider } from '@mui/material';
import { AuthProvider, ToastProvider } from '@barber/shared';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';

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

ReactDOM.createRoot(document.getElementById('root')!).render(
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
  </React.StrictMode>
);
