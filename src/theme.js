import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#9B82CC' : '#BCA8E8',
      light: mode === 'light' ? '#C8B4E8' : '#D4C4F8',
      dark: mode === 'light' ? '#7A64A8' : '#9A88CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: mode === 'light' ? '#D4B8F0' : '#88A8D8',
      contrastText: '#FFFFFF',
    },
    ...(mode === 'light' ? {
      background: {
        default: '#F8F2FF',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#2D2050',
        secondary: '#6B5A8C',
        disabled: '#B0A0C8',
      },
      divider: '#E4D8F8',
    } : {
      background: {
        default: '#0E0720',
        paper: '#1A0D35',
      },
      text: {
        primary: '#EDE6FF',
        secondary: '#B4A0CC',
        disabled: '#5A4878',
      },
      divider: '#2E1A50',
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
          borderRadius: 24,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'light' ? '#D8CFF0' : '#3A2560',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.mode === 'light' ? '#B8A0D8' : '#5A3A8C',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: '1.5px',
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          boxShadow: theme.palette.mode === 'light'
            ? '0 2px 16px rgba(155, 130, 204, 0.12)'
            : '0 2px 16px rgba(0, 0, 0, 0.4)',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: theme.palette.mode === 'light'
            ? '0 2px 12px rgba(155, 130, 204, 0.1)'
            : '0 2px 12px rgba(0, 0, 0, 0.35)',
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.85)'
            : 'rgba(26, 13, 53, 0.9)',
          backdropFilter: 'blur(12px)',
        }),
      },
    },
  },
});
