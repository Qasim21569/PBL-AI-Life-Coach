"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Avatar, 
  Grid,
  Container,
  IconButton,
  List,
  ListItem,
  Card,
  CardContent,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/authContext';
import AuthModal from '@/components/auth/AuthModal';
import { getUserProfile } from '@/lib/firebase/userProfile';
import { themeColors } from '@/app/layout';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

type ChatLayoutProps = {
  title: string;
  icon: string;
  description: string;
  longDescription: string;
  benefits: string[];
  suggestedPrompts: string[];
  accentColor: string;
};

const ChatLayout: React.FC<ChatLayoutProps> = ({
  title,
  icon,
  description,
  longDescription,
  benefits,
  suggestedPrompts,
  accentColor
}) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auth related state
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Function to get user's name or email
  const getUserDisplayName = () => {
    if (user) {
      if (user.displayName) return user.displayName;
      if (user.email) return user.email.split('@')[0]; // Use part before @ in email
      return 'there'; // Fallback
    }
    return 'there';
  };
  
  // Fetch user profile data when user is authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && user.uid) {
        setProfileLoading(true);
        try {
          const profileResponse = await getUserProfile(user.uid);
          if (profileResponse.success) {
            setUserProfile(profileResponse.data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };
    
    if (user) {
      fetchUserProfile();
    }
  }, [user]);
  
  // Check if user is authenticated when component loads
  useEffect(() => {
    if (!loading && !user) {
      // Add a welcome message prompting login
      const welcomeMessage: Message = {
        id: 1,
        text: "Welcome to AI Life Coach! Please sign in or create an account to start chatting.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else if (!loading && user && messages.length === 0) {
      // Add a personalized welcome message if user is logged in
      const welcomeMessage: Message = {
        id: 1,
        text: `Hi ${getUserDisplayName()}, welcome to your ${title} coach! How can I help you today?`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user, loading, title, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get the mode based on the title
  const getModeFromTitle = (): 'career' | 'fitness' | 'finance' | 'mental' => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('career')) return 'career';
    if (titleLower.includes('fitness')) return 'fitness';
    if (titleLower.includes('financial') || titleLower.includes('finance')) return 'finance';
    if (titleLower.includes('mental')) return 'mental';
    return 'career'; // Default fallback
  };

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    
    // If user is not authenticated, show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Clear any previous errors
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format messages for the API
      const formattedMessages = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant', 
        content: msg.text
      }));

      // Add the new user message
      formattedMessages.push({
        role: 'user',
        content: text
      });

      // Determine the mode based on the title
      const mode = getModeFromTitle();

      // Call the API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages,
          mode: mode,
          userId: user?.uid, // Include user ID if authenticated
          userProfile: userProfile // Include user profile data if available
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response
      const botMessage: Message = {
        id: messages.length + 2,
        text: data.response || "I'm sorry, I couldn't generate a response. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I'm sorry, there was an error processing your request. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const navigateHome = () => {
    router.push('/');
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Add a welcome message after successful login
    const welcomeMessage: Message = {
      id: messages.length + 1,
      text: `Thanks for signing in ${getUserDisplayName()}! How can I help you today?`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, welcomeMessage]);
  };

  // determine the theme color based on title (for consistency)
  const getThemeColor = () => {
    switch(title.toLowerCase()) {
      case 'fitness coach':
        return themeColors.fitness;
      case 'career coach':
        return themeColors.career;
      case 'financial coach':
        return themeColors.finance;
      case 'mental wellbeing coach':
        return themeColors.mental;
      default:
        return accentColor;
    }
  };
  const themeColor = getThemeColor();

  return (
    <Container maxWidth="xl" disableGutters>
      <Grid container spacing={0} sx={{ height: '100vh' }}>
        {/* Sidebar */}
        {!isMobile && (
          <Grid item xs={12} md={3} lg={3} 
            sx={{ 
              bgcolor: 'background.paper',
              p: 3,
              borderRight: '1px solid',
              borderColor: 'divider',
              height: '100%',
              overflowY: 'auto'
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {longDescription}
              </Typography>
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Benefits:
                </Typography>
                <List sx={{ listStyleType: 'disc', pl: 2 }}>
                  {benefits.map((benefit, index) => (
                    <ListItem key={index} sx={{ display: 'list-item', p: 0.5 }}>
                      <Typography variant="body2">{benefit}</Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Try asking:
              </Typography>
              {suggestedPrompts.map((prompt, index) => (
                <Card 
                  key={index} 
                  variant="outlined" 
                  sx={{ 
                    mb: 2, 
                    cursor: 'pointer',
                    '&:hover': { 
                      borderColor: themeColor,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.05)' 
                    } 
                  }}
                  onClick={() => handleSuggestedPrompt(prompt)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2">{prompt}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>
        )}
        
        {/* Main Chat Area */}
        <Grid item xs={12} md={9} lg={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box 
            sx={{ 
              p: 2, 
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'background.paper'
            }}
          >
            <IconButton 
              onClick={() => router.push('/')}
              sx={{ mr: 1 }}
              aria-label="back to dashboard"
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Avatar 
              sx={{ 
                bgcolor: themeColor, 
                mr: 2,
                width: 36,
                height: 36
              }}
            >
              {icon}
            </Avatar>
            
            <Box>
              <Typography variant="h6" component="h1">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Box>
          
          {/* Messages area */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              p: 2, 
              overflowY: 'auto',
              bgcolor: theme.palette.mode === 'light' ? '#f8f9fa' : 'background.paper',
              display: 'flex',
              flexDirection: 'column'
            }}
            ref={messagesEndRef}
          >
            {/* Welcome message */}
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Avatar 
                  sx={{ 
                    bgcolor: themeColor, 
                    width: 56, 
                    height: 56,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {icon}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  Welcome to your {title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
                  {longDescription}
                </Typography>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1, 
                    justifyContent: 'center',
                    maxWidth: '700px',
                    mx: 'auto'
                  }}
                >
                  {suggestedPrompts.map((prompt, index) => (
                    <Button 
                      key={index}
                      variant="outlined" 
                      size="small"
                      onClick={() => handleSuggestedPrompt(prompt)}
                      sx={{ 
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': { 
                          borderColor: themeColor,
                          bgcolor: 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      {prompt}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Chat messages */}
            {messages.map((message) => (
              <Box 
                key={message.id}
                sx={{ 
                  display: 'flex', 
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2 
                }}
              >
                {message.sender === 'bot' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: themeColor, 
                      width: 40, 
                      height: 40,
                      mr: 1,
                      mt: 0.5,
                      fontSize: '1rem',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    {icon}
                  </Avatar>
                )}
                
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    bgcolor: message.sender === 'user' ? themeColor : '#fff',
                    color: message.sender === 'user' ? '#fff' : 'text.primary',
                    borderRadius: message.sender === 'user' 
                      ? '20px 4px 20px 20px' 
                      : '4px 20px 20px 20px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    '& a': {
                      color: message.sender === 'user' ? '#fff' : themeColor,
                      textDecoration: 'underline',
                      '&:hover': {
                        textDecoration: 'none'
                      }
                    }
                  }}
                >
                  <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </Typography>
                </Paper>
              </Box>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start',
                  mb: 2 
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: themeColor, 
                    width: 40, 
                    height: 40,
                    mr: 1,
                    mt: 0.5,
                    fontSize: '1rem',
                    boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {icon}
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#fff',
                    borderRadius: '4px 20px 20px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  <CircularProgress size={20} sx={{ color: themeColor }} />
                  <Typography variant="body2" color="text.primary">Thinking...</Typography>
                </Paper>
              </Box>
            )}
            
            {/* Error message */}
            {error && (
              <Box 
                sx={{ 
                  bgcolor: '#fff4f4',
                  p: 2,
                  borderRadius: '8px',
                  border: '1px solid #ffdbdb',
                  mb: 2,
                  boxShadow: '0 2px 8px rgba(255,0,0,0.05)'
                }}
              >
                <Typography variant="body2" color="error" fontWeight="medium">
                  Error: {error}
                </Typography>
              </Box>
            )}
            
            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input area */}
          <Box 
            sx={{ 
              p: 2, 
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'relative'
            }}
          >
            {!user && !loading && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  p: 2
                }}
              >
                <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
                  Please sign in to continue your conversation
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => setShowAuthModal(true)}
                  sx={{ bgcolor: themeColor, '&:hover': { bgcolor: themeColor } }}
                >
                  Sign In or Register
                </Button>
              </Box>
            )}
  
            <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder={`Message your ${title.toLowerCase()}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                variant="outlined"
                size="small"
                disabled={isLoading || !user}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '24px',
                    pr: 1,
                    bgcolor: 'background.default'
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      color="primary"
                      type="submit"
                      disabled={!input.trim() || isLoading || !user}
                      sx={{ 
                        bgcolor: themeColor, 
                        color: '#fff',
                        '&:hover': { bgcolor: themeColor },
                        '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' }
                      }}
                    >
                      <SendIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </Container>
  );
};

export default ChatLayout; 