'use client';

import React, { useRef, useState } from 'react';
import { Typography, Button, Box, Container, Grid, Card, CardContent, Paper, Divider, AppBar, Toolbar, IconButton, useScrollTrigger, Drawer, List, ListItem, ListItemText } from '@mui/material';
import FeaturedModes from '@/components/FeaturedModes';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WorkIcon from '@mui/icons-material/Work';
import MenuIcon from '@mui/icons-material/Menu';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/authContext';
import AuthModal from '@/components/auth/AuthModal';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebaseConfig';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { User } from 'firebase/auth';

// Navbar with scroll effect
function NavBar() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Career', path: '/career' },
    { name: 'Fitness', path: '/fitness' },
    { name: 'Finance', path: '/finance' },
    { name: 'Mental', path: '/mental' },
  ];
  
  const handleNavClick = (path: string) => {
    router.push(path);
    setMobileOpen(false);
  };

  const handleAuthClick = () => {
    setAuthModalOpen(true);
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Optionally redirect or show success message
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Type guard to check if user has email
  const getUserEmail = (user: User | null): string => {
    // Type assertion for safety
    const userWithEmail = user as { email?: string } | null;
    if (userWithEmail && userWithEmail.email) {
      return userWithEmail.email;
    }
    return 'User';
  };
  
  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SmartToyIcon sx={{ color: '#3f51b5', mr: 1 }} />
          <Typography variant="h6" fontWeight="bold" color="#3f51b5">AI Coach</Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.name} 
            onClick={() => handleNavClick(item.path)}
            sx={{ 
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(63, 81, 181, 0.05)'
              },
              cursor: 'pointer'
            }}
          >
            <ListItemText 
              primary={item.name} 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: 'medium'
                }
              }}
            />
          </ListItem>
        ))}
        {!user ? (
          <ListItem 
            onClick={handleAuthClick}
            sx={{ 
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(63, 81, 181, 0.05)'
              },
              cursor: 'pointer'
            }}
          >
            <ListItemText 
              primary="Sign In / Sign Up" 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: 'medium'
                }
              }}
            />
          </ListItem>
        ) : (
          <>
            <ListItem 
              sx={{ 
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(63, 81, 181, 0.05)'
                },
                cursor: 'pointer'
              }}
            >
              <ListItemText 
                primary={
                  <Box 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      borderRadius: '8px',
                      bgcolor: 'rgba(63, 81, 181, 0.1)',
                      color: '#3f51b5',
                      mb: 2
                    }}
                  >
                    <AccountCircleIcon />
                    <Typography variant="body2" fontWeight="medium" noWrap>
                      {getUserEmail(user)}
                    </Typography>
                  </Box>
                } 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: 'medium'
                  }
                }}
              />
            </ListItem>
            <ListItem 
              onClick={handleProfileClick}
              sx={{ 
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(63, 81, 181, 0.05)'
                },
                cursor: 'pointer'
              }}
            >
              <ListItemText 
                primary="My Profile" 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: 'medium'
                  }
                }}
              />
            </ListItem>
            <ListItem 
              onClick={handleLogout}
              sx={{ 
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(63, 81, 181, 0.05)'
                },
                cursor: 'pointer'
              }}
            >
              <ListItemText 
                primary="Sign Out" 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    fontWeight: 'medium'
                  }
                }}
              />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onAuthSuccess={() => setAuthModalOpen(false)}
      />
      <AppBar 
        position="fixed" 
        color="transparent" 
        elevation={0}
        sx={{
          bgcolor: trigger ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          boxShadow: trigger ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.3s ease',
          backdropFilter: trigger ? 'blur(10px)' : 'none',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <SmartToyIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: trigger ? '#3f51b5' : '#3f51b5' }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 'bold',
                  color: trigger ? '#3f51b5' : '#3f51b5',
                }}
              >
                AI Life Coach
              </Typography>
            </Box>

            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: trigger ? '#333' : '#3f51b5' }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1, alignItems: 'center' }}>
              <SmartToyIcon sx={{ mr: 1, color: trigger ? '#3f51b5' : '#3f51b5' }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 'bold',
                  color: trigger ? '#3f51b5' : '#3f51b5',
                }}
              >
                AI Coach
              </Typography>
            </Box>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    color: trigger ? 'text.primary' : item.name === 'Home' ? '#3f51b5' : '#3f51b5',
                    fontWeight: 'medium',
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(63, 81, 181, 0.08)',
                    },
                  }}
                >
                  {item.name}
                </Button>
              ))}
              
              {!loading && (
                !user ? (
                  <Button
                    variant="contained"
                    onClick={handleAuthClick}
                    sx={{ 
                      ml: 2,
                      bgcolor: '#3f51b5',
                      '&:hover': { bgcolor: '#303f9f' },
                      boxShadow: 'none'
                    }}
                  >
                    Sign In
                  </Button>
                ) : (
                  <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                    <Button
                      sx={{ 
                        color: trigger ? 'text.primary' : '#3f51b5',
                        fontWeight: 'medium',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                      onClick={handleProfileClick}
                    >
                      <AccountCircleIcon />
                      <Box 
                        component="span" 
                        sx={{ 
                          maxWidth: '150px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: { xs: 'none', lg: 'inline' }
                        }}
                      >
                        {getUserEmail(user)}
                      </Box>
                    </Button>
                    <Button
                      onClick={handleLogout}
                      sx={{ 
                        color: trigger ? 'text.secondary' : 'rgba(63, 81, 181, 0.7)',
                        '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.08)' }
                      }}
                    >
                      Sign Out
                    </Button>
                  </Box>
                )
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default function Home() {
  const modesRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();

  const scrollToModes = () => {
    modesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get user's display name
  const getUserDisplayName = () => {
    if (user) {
      // Type assertion to fix property access
      const userWithProfile = user as { displayName?: string; email?: string };
      if (userWithProfile.displayName) return userWithProfile.displayName;
      if (userWithProfile.email) return userWithProfile.email.split('@')[0]; // Use part before @ in email
      return 'there'; // Fallback
    }
    return 'there';
  };

  return (
    <main>
      <NavBar />
      
      {/* Hero Section with Gradient Overlay */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 'auto', md: '90vh' },
          minHeight: { xs: '500px', md: '700px' },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          pt: { xs: 16, md: 8 },
          pb: { xs: 10, md: 0 },
          backgroundColor: '#f7f9fc',
          backgroundImage: 'linear-gradient(135deg, #f8faff 0%, #f0f4fb 100%)',
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            backgroundColor: '#3f51b5',
            opacity: 0.03,
            top: '-100px',
            left: '-100px',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            backgroundColor: '#4caf50',
            opacity: 0.04,
            bottom: '-150px',
            right: '-150px',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: '#9c27b0',
            opacity: 0.03,
            top: '40%',
            right: '5%',
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container alignItems="center" spacing={3} sx={{ minHeight: '100%' }}>
            <Grid item xs={12} md={6} sx={{ zIndex: 2 }}>
              <Box sx={{ 
                pr: { md: 5 },
                animation: 'fadeInUp 0.8s ease',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(20px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                },
              }}>
                <Box sx={{ display: 'inline-block', mb: 2, bgcolor: 'rgba(63, 81, 181, 0.1)', px: 2, py: 0.8, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                    AI-POWERED LIFE COACHING
                  </Typography>
                </Box>
                
                <Typography
                  variant="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                    background: 'linear-gradient(90deg, #3f51b5 0%, #9c27b0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                  }}
                >
                  {!loading && user ? `Welcome back, ${getUserDisplayName()}!` : 'Your Personal AI Life Coach'}
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 4, 
                    color: 'text.secondary',
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    fontWeight: 'normal',
                    lineHeight: 1.6,
                    maxWidth: '550px'
                  }}
                >
                  {!loading && user 
                    ? 'Continue your personal development journey with personalized guidance in career, fitness, finance, and mental wellness.'
                    : 'Get expert guidance in career development, physical fitness, financial management, and mental wellness with our AI-powered coaching platform.'}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<KeyboardArrowDownIcon />}
                    onClick={scrollToModes}
                    sx={{ 
                      bgcolor: '#3f51b5',
                      py: 1.5,
                      px: 3,
                      borderRadius: '50px',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 20px rgba(63, 81, 181, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 15px 25px rgba(63, 81, 181, 0.4)',
                        bgcolor: '#3949ab',
                      },
                    }}
                  >
                    Try Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ 
                      borderColor: '#3f51b5',
                      color: '#3f51b5',
                      py: 1.5,
                      px: 3,
                      borderRadius: '50px',
                      fontWeight: 'bold',
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        bgcolor: 'rgba(63, 81, 181, 0.05)'
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: { xs: 1, md: 3 } }}>
                  {[
                    { text: 'Free to use', icon: <CheckCircleIcon sx={{ fontSize: '1rem', color: '#4caf50' }} /> },
                    { text: 'AI Powered', icon: <CheckCircleIcon sx={{ fontSize: '1rem', color: '#4caf50' }} /> },
                    { text: 'Expert guidance', icon: <CheckCircleIcon sx={{ fontSize: '1rem', color: '#4caf50' }} /> }
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {item.icon}
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                        {item.text}
        </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' }, zIndex: 2 }}>
              <Box sx={{ 
                position: 'relative',
                animation: 'fadeIn 1s ease',
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0,
                  },
                  '100%': {
                    opacity: 1,
                  }
                },
              }}>
                {/* Main image with frame */}
        <Paper
                  elevation={0}
                  sx={{
                    overflow: 'hidden',
                    borderRadius: '20px',
                    position: 'relative',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
                    border: '10px solid white',
                    height: '450px',
                    maxWidth: '550px',
                    ml: 'auto',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: 'url(/images/hero-coach.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      transition: 'transform 0.5s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
        </Paper>
                
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -30,
                    left: 20,
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    p: 2,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    animation: 'float 4s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-15px)' },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PsychologyAltIcon sx={{ color: '#9c27b0', fontSize: '2rem' }} />
                    <Typography variant="subtitle2" fontWeight="bold">Mental Wellness</Typography>
                  </Box>
                </Box>
                
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -20,
                    right: 40,
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    p: 2,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    animation: 'float 4s ease-in-out infinite 1s',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-15px)' },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon sx={{ color: '#3f51b5', fontSize: '2rem' }} />
                    <Typography variant="subtitle2" fontWeight="bold">Career Guidance</Typography>
                  </Box>
                </Box>
                
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: -30,
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    p: 2,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                    animation: 'float 4s ease-in-out infinite 0.5s',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0px)' },
                      '50%': { transform: 'translateY(-15px)' },
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HealthAndSafetyIcon sx={{ color: '#4caf50', fontSize: '2rem' }} />
                    <Typography variant="subtitle2" fontWeight="bold">Fitness Planning</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
      </Container>
        
        {/* Scroll down indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0) translateX(-50%)' },
              '40%': { transform: 'translateY(-20px) translateX(-50%)' },
              '60%': { transform: 'translateY(-10px) translateX(-50%)' },
            },
          }}
          onClick={scrollToModes}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Explore Coaching Modes
          </Typography>
          <KeyboardArrowDownIcon sx={{ color: '#3f51b5' }} />
        </Box>
      </Box>

      {/* Featured Modes */}
      <Box
        ref={modesRef}
        sx={{
          py: { xs: 8, md: 12 },
          px: 2,
          bgcolor: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            opacity: 0.03,
            backgroundImage: 'radial-gradient(circle at 20% 30%, #3f51b5 0%, transparent 20%), radial-gradient(circle at 80% 70%, #4caf50 0%, transparent 20%), radial-gradient(circle at 50% 50%, #9c27b0 0%, transparent 60%)',
            zIndex: 0,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: { xs: 6, md: 8 }
          }}>
            <Box sx={{ 
              width: '80px', 
              height: '4px', 
              backgroundColor: '#3f51b5', 
              borderRadius: '2px', 
              mb: 2 
            }} />
            <Typography
              variant="h3"
              textAlign="center"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '2rem', md: '2.5rem' },
                color: 'text.primary',
                mb: 2,
              }}
            >
              Coaching Modes
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              sx={{
                color: 'text.secondary',
                fontWeight: 'normal',
                maxWidth: '700px',
                mb: 1,
              }}
            >
              Select a coaching mode to get personalized guidance tailored to your specific needs
            </Typography>
          </Box>
          
          <FeaturedModes />
          
          {/* Stats section */}
          <Box 
            sx={{ 
              mt: { xs: 8, md: 12 },
              py: 5,
              px: { xs: 3, md: 5 },
              borderRadius: '16px',
              backgroundColor: 'rgba(63, 81, 181, 0.03)',
              border: '1px solid rgba(63, 81, 181, 0.1)',
            }}
          >
            <Grid container spacing={3}>
              {[
                { number: '10,000+', text: 'Active Users' },
                { number: '24/7', text: 'AI Availability' },
                { number: '97%', text: 'Satisfaction Rate' },
                { number: '4', text: 'Coaching Domains' },
              ].map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      p: 2,
                      borderRadius: '12px',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'white',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: '#3f51b5',
                        mb: 1,
                        fontSize: { xs: '2rem', md: '2.5rem' } 
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 'medium' 
                      }}
                    >
                      {stat.text}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          {/* CTA Section */}
          <Box 
            sx={{ 
              mt: { xs: 8, md: 12 },
              py: { xs: 5, md: 7 },
              px: { xs: 3, md: 5 },
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
              boxShadow: '0 20px 40px rgba(63, 81, 181, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background: 'radial-gradient(circle at 20% 30%, rgba(63, 81, 181, 0.4) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(76, 175, 80, 0.4) 0%, transparent 30%), radial-gradient(circle at 50% 50%, rgba(156, 39, 176, 0.3) 0%, transparent 50%)',
                mixBlendMode: 'overlay'
              }}
            />
            
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    mb: 2,
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  Ready to transform your life with AI coaching?
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 'normal',
                    mb: 3,
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  Get personalized guidance across multiple life domains with our AI coach.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={scrollToModes}
                  sx={{ 
                    bgcolor: 'white',
                    color: '#3f51b5',
                    py: 1.5,
                    px: 3,
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                    },
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  Start Now
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
    </Box>
    </main>
  );
}
