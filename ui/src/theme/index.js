import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const baseTheme = createTheme({
  palette: {
    primary: { main: '#2E7D32' },
    secondary: { main: '#FF6F00' },
    background: {
      default: '#FAFAF7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E2A21',
      secondary: '#5F6F63',
    },
  },
  typography: {
    fontFamily: '"Nunito", Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: 0 },
    h2: { fontWeight: 700, letterSpacing: 0 },
    h3: { fontWeight: 700, letterSpacing: 0 },
    h4: { fontWeight: 700, letterSpacing: 0 },
    h5: { fontWeight: 700, letterSpacing: 0 },
    h6: { fontWeight: 700, letterSpacing: 0 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
    body1: { fontSize: '1rem', letterSpacing: 0 },
    body2: { fontSize: '0.875rem', letterSpacing: 0 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minWidth: 0,
          overflowX: 'hidden',
          backgroundColor: '#FAFAF7',
        },
        '*': { boxSizing: 'border-box' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 8,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 2 },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
        },
      },
    },
  },
});

export default responsiveFontSizes(baseTheme);
