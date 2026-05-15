import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#CDB4DB',
      contrastText: '#4A4A4A',
    },
    secondary: {
      main: '#B7E4C7',
      contrastText: '#4A4A4A',
    },
    ...(mode === 'light' ? {
      background: {
        default: '#FAF9F6',
        paper: '#F5EEFF',
      },
      text: {
        primary: '#4A4A4A',
        secondary: '#7A7A7A',
      },
    } : {
      background: {
        default: '#1a1025',
        paper: '#261637',
      },
      text: {
        primary: '#EEE8F5',
        secondary: '#B0A0C0',
      },
    }),
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          boxShadow: theme.palette.mode === 'light'
            ? '0 2px 12px rgba(205, 180, 219, 0.2)'
            : '0 2px 12px rgba(0, 0, 0, 0.3)',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: theme.palette.mode === 'light'
            ? '0 2px 8px rgba(205, 180, 219, 0.15)'
            : '0 2px 8px rgba(0, 0, 0, 0.25)',
        }),
      },
    },
  },
});
