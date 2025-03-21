"use client";

import { Box, Button, Typography, Container, IconButton, Drawer, List, ListItem, Fade } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';

const menuItems = [
  { name: 'Home', path: '#' },
  { name: 'Coaching', path: '#' },
  { name: 'Resources', path: '#' },
  { name: 'Community', path: '#' },
  { name: 'Pricing', path: '#' }
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setIsMobile(window.innerWidth < 960); // 960px is MUI's md breakpoint
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <Box
      component="nav"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backgroundColor: 'black',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease'
      }}
    >
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          py={2}
        >
          {/* Left Section - Logo */}
          <Fade in={true} timeout={1000}>
            <Box display="flex" alignItems="center">
              <Typography
                variant="h5"
                fontWeight="bold"
                color="white"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    color: '#facc15',
                    cursor: 'pointer'
                  },
                  transition: 'color 0.2s ease'
                }}
              >
                <span style={{ color: '#facc15' }}>Coach</span>AI
              </Typography>
            </Box>
          </Fade>

          {/* Middle Section - Navigation (Desktop only) */}
          {!isMobile && (
            <Fade in={true} timeout={1000}>
              <Box
                display="flex"
                gap={4}
                sx={{ ml: 5 }}
              >
                {menuItems.map((item, index) => (
                  <Typography
                    key={index}
                    variant="body1"
                    sx={{
                      cursor: 'pointer',
                      color: 'white',
                      position: 'relative',
                      padding: '5px 0',
                      fontWeight: 500,
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        width: '0%',
                        height: '2px',
                        bottom: 0,
                        left: 0,
                        backgroundColor: '#facc15',
                        transition: 'width 0.3s ease'
                      },
                      '&:hover': {
                        color: '#facc15',
                        '&:after': {
                          width: '100%'
                        }
                      },
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {item.name}
                  </Typography>
                ))}
              </Box>
            </Fade>
          )}

          {/* Right Section - Buttons */}
          <Fade in={true} timeout={1000}>
            <Box display="flex" alignItems="center" gap={2}>
              {!isMobile ? (
                <>
                  <Button
                    variant="outlined"
                    sx={{
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.3)',
                      borderRadius: '50px',
                      px: 3,
                      '&:hover': {
                        borderColor: '#facc15',
                        backgroundColor: 'rgba(250, 204, 21, 0.1)'
                      }
                    }}
                  >
                    Log in
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#facc15',
                      color: 'black',
                      borderRadius: '50px',
                      px: 3,
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: '#e6b800',
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Sign up
                  </Button>
                </>
              ) : (
                <IconButton
                  color="inherit"
                  onClick={toggleMobileMenu}
                  sx={{ color: 'white' }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Fade>
        </Box>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: '70%',
            maxWidth: '300px',
            backgroundColor: 'black',
            color: 'white',
            padding: '20px'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={toggleMobileMenu} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" color="white" sx={{ mb: 3 }}>
            <span style={{ color: '#facc15' }}>Coach</span>AI
          </Typography>
        </Box>

        <List>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                py: 1.5,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              <Typography variant="body1">{item.name}</Typography>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2, px: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: '#facc15',
                backgroundColor: 'rgba(250, 204, 21, 0.1)'
              }
            }}
          >
            Log in
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#facc15',
              color: 'black',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#e6b800'
              }
            }}
          >
            Sign up
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Navbar;
