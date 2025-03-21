'use client';

import React from 'react';
import { Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/authContext';

// Metadata needs to be in a separate file or used differently in Next.js 13+ with app directory
// See: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

// Define theme colors for consistency across the application
const themeColors = {
  primary: '#3f51b5', // Main app color (indigo)
  secondary: '#000000',
  career: '#3f51b5', // Career coaching color (indigo)
  fitness: '#4caf50', // Fitness coaching color (green)
  finance: '#ffc107', // Finance coaching color (amber)
  mental: '#9c27b0', // Mental coaching color (purple)
  background: '#f7f9fc',
  cardBackground: '#ffffff',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
};

const theme = createTheme({
  palette: {
    primary: {
      main: themeColors.primary,
    },
    secondary: {
      main: themeColors.secondary,
    },
    error: {
      main: themeColors.error,
    },
    warning: {
      main: themeColors.warning,
    },
    info: {
      main: themeColors.info,
    },
    success: {
      main: themeColors.success,
    },
    background: {
      default: themeColors.background,
      paper: themeColors.cardBackground,
    },
  },
  typography: {
    fontFamily: '"Inter", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

// Export theme colors for use in other components
export { themeColors };

// Client-side wrapper to avoid hydration mismatch
const ClientSideLayout = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Box
          width="100%"
          height="100%"
          m={0}
          p={0}
          sx={{
            overflowX: 'hidden',
            position: 'relative',
          }}
        >
          {children}
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <title>Coach AI - The Only AI Life Coach You Need</title>
        <meta name="description" content="Get personalized guidance for career, fitness, finance, and mental health with our AI coaching platform." />
        <meta name="keywords" content="AI coach, life coach, career guidance, fitness coach, financial advisor, mental health" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: 'white' }}>
        <ClientSideLayout>
          {children}
        </ClientSideLayout>
      </body>
    </html>
  );
}
