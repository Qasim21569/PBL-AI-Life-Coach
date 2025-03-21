'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box, 
  IconButton, 
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SignIn from './SignIn';
import SignUp from './SignUp';

const AuthModal = ({ open, onClose, onAuthSuccess }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
  };
  
  const handleAuthSuccess = (user) => {
    // Call the success callback with the authenticated user
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }
    // Close the modal
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : '16px',
          width: fullScreen ? '100%' : '450px',
          maxWidth: '100%',
        }
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'text.secondary',
          zIndex: 1
        }}
      >
        <CloseIcon />
      </IconButton>
      
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ pt: 2 }}>
          {isSignIn ? (
            <SignIn 
              onSuccess={handleAuthSuccess} 
              onSignUpClick={toggleAuthMode}
            />
          ) : (
            <SignUp 
              onSuccess={handleAuthSuccess} 
            />
          )}
          
          {!isSignIn && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Box 
                component="button" 
                onClick={toggleAuthMode}
                sx={{
                  background: 'none',
                  border: 'none',
                  color: '#3f51b5',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  p: 0,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Already have an account? Sign In
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal; 