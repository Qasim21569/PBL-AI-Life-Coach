'use client';

import React from 'react';
import { Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './globals.css';
import { AuthProvider } from '@/lib/firebase/authContext';

// Metadata needs to be in a separate file or used differently in Next.js 13+ with app directory
// See: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

const theme = createTheme({
  palette: {
    primary: {
      main: '#facc15',
    },
    secondary: {
      main: '#000000',
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
  },
});

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
