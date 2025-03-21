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

      // Make sure we have the latest user profile data
      let currentUserProfile = userProfile;
      if (user && !currentUserProfile) {
        try {
          console.log("Fetching user profile for chat...");
          const profileResponse = await getUserProfile(user.uid);
          if (profileResponse.success) {
            currentUserProfile = profileResponse.data;
            console.log("Profile fetched successfully:", currentUserProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile for chat:', error);
        }
      }

      // Debug log the profile data
      console.log(`SENDING ${mode.toUpperCase()} REQUEST WITH PROFILE:`, JSON.stringify(currentUserProfile, null, 2));

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
          userProfile: currentUserProfile // Include user profile data if available
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

  return (
    <Box 
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#f7f9fc'
      }}
    >
      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onAuthSuccess={handleAuthSuccess}
      />
      
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          bgcolor: '#fff',
          zIndex: 10,
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
        }}
      >
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={navigateHome}
          sx={{
            fontWeight: 'medium',
            color: 'text.primary'
          }}
        >
          Back to Home
        </Button>
      </Box>
      
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        height: 'calc(100vh - 60px)' // subtract header height
      }}>
        {/* Left sidebar - About section */}
        <Box 
          sx={{ 
            width: { xs: '100%', md: '32%' },
            height: { xs: 'auto', md: '100%' },
            p: 3,
            bgcolor: '#fff',
            borderRight: '1px solid rgba(0,0,0,0.08)',
            overflowY: 'auto',
            boxShadow: { xs: 'none', md: '4px 0 12px rgba(0,0,0,0.03)' },
            zIndex: 5,
            display: { xs: isMobile && messages.length > 0 ? 'none' : 'block', md: 'block' }
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              pb: 3,
              borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <Avatar 
              sx={{ 
                bgcolor: accentColor, 
                mr: 2, 
                width: 48, 
                height: 48,
                fontSize: '1.5rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              {icon}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              {title}
            </Typography>
          </Box>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              color: 'text.primary',
              fontWeight: 'medium'
            }}
          >
            {description}
          </Typography>

          <Typography 
            variant="body2" 
            sx={{ 
              mb: 3,
              color: 'text.primary'
            }}
          >
            {longDescription}
          </Typography>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
            Benefits
          </Typography>
          <List disablePadding sx={{ mb: 3 }}>
            {benefits.map((benefit, index) => (
              <ListItem 
                key={index}
                disablePadding
                sx={{ 
                  mb: 1,
                  display: 'flex',
                  alignItems: 'flex-start'
                }}
              >
                <Box component="span" sx={{ mr: 1, color: accentColor, fontSize: '1.2rem' }}>•</Box>
                <Typography variant="body2" color="text.primary">
                  {benefit}
                </Typography>
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: 'text.primary' }}>
            Try asking about
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                onClick={() => handleSuggestedPrompt(prompt)}
                sx={{ 
                  borderRadius: '50px',
                  borderColor: 'rgba(0,0,0,0.12)', 
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: accentColor,
                    bgcolor: `${accentColor}10`,
                    color: accentColor
                  },
                  textTransform: 'none',
                  fontWeight: 'medium',
                  py: 0.6
                }}
              >
                {prompt}
              </Button>
            ))}
          </Box>
        </Box>
        
        {/* Right side - Chat interface */}
        <Box
          sx={{ 
            width: { xs: '100%', md: '68%' },
            height: { xs: isMobile ? 'calc(100vh - 60px - 300px)' : '100%', md: '100%' },
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: '#f7f9fc',
            position: 'relative'
          }}
        >
          {/* Chat header */}
          <Box 
            sx={{ 
              p: 2, 
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              bgcolor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {title} Coach
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
              Ask me anything about {title.toLowerCase()}
            </Typography>
          </Box>
          
          {/* Chat messages area */}
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflowY: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              '&::-webkit-scrollbar': {
                width: '8px',
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '8px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: 'rgba(0,0,0,0.2)',
              }
            }}
          >
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
                      bgcolor: accentColor, 
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
                    maxWidth: '80%',
                    p: 2,
                    bgcolor: message.sender === 'user' ? accentColor : '#fff',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: message.sender === 'user' 
                      ? '20px 4px 20px 20px' 
                      : '4px 20px 20px 20px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                  }}
                >
                  {message.sender === 'bot' ? (
                    <Box sx={{ 
                      '& p': { my: 1 },
                      '& ul, & ol': { pl: 2, my: 1 },
                      '& li': { mb: 0.5 },
                      '& h3, & h4': { mt: 2, mb: 1, fontWeight: 'bold' },
                      '& hr': { my: 2, borderColor: 'rgba(0,0,0,0.1)' }
                    }}>
                      {message.text.split('\n').map((line, i) => {
                        // Handle headings (###)
                        if (line.startsWith('###')) {
                          return (
                            <Typography key={i} variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                              {line.replace(/^###\s*/, '')}
                            </Typography>
                          );
                        }
                        
                        // Handle headings (##)
                        if (line.startsWith('##')) {
                          return (
                            <Typography key={i} variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                              {line.replace(/^##\s*/, '')}
                            </Typography>
                          );
                        }
                        
                        // Handle horizontal rules
                        if (line.startsWith('---')) {
                          return <hr key={i} style={{ margin: '16px 0', border: 'none', borderTop: '1px solid rgba(0,0,0,0.1)' }} />;
                        }
                        
                        // Handle bullet points
                        if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                          return (
                            <Typography component="div" key={i} variant="body1" sx={{ ml: 2, display: 'flex', alignItems: 'flex-start' }}>
                              <span style={{ marginRight: '8px', minWidth: '16px', display: 'inline-block' }}>•</span>
                              <span dangerouslySetInnerHTML={{ 
                                __html: line.replace(/^\s*[\*\-]\s*/, '')
                                  // Convert markdown bold to HTML bold
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              }} />
                            </Typography>
                          );
                        }
                        
                        // Handle numbered lists
                        if (/^\s*\d+\.\s/.test(line)) {
                          const number = line.match(/^\s*(\d+)\.\s/)?.[1] || '';
                          return (
                            <Typography component="div" key={i} variant="body1" sx={{ ml: 2, display: 'flex', alignItems: 'flex-start' }}>
                              <span style={{ marginRight: '8px', minWidth: '16px', display: 'inline-block' }}>{number}.</span>
                              <span dangerouslySetInnerHTML={{ 
                                __html: line.replace(/^\s*\d+\.\s*/, '')
                                  // Convert markdown bold to HTML bold
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              }} />
                            </Typography>
                          );
                        }
                        
                        // Handle regular text with bold formatting
                        if (line.trim()) {
                          return (
                            <Typography key={i} variant="body1" paragraph={true} sx={{ my: 0.5 }}>
                              <span dangerouslySetInnerHTML={{ 
                                __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                              }} />
                            </Typography>
                          );
                        }
                        
                        // Handle empty lines as spacing
                        return <Box key={i} sx={{ height: '0.5rem' }} />;
                      })}
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ fontWeight: 400 }}>
                      {message.text}
                    </Typography>
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      mt: 1,
                      opacity: 0.7,
                      color: message.sender === 'user' ? 'rgba(255,255,255,0.9)' : 'text.secondary'
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
                
                {message.sender === 'user' && (
                  <Avatar 
                    sx={{ 
                      bgcolor: '#404040', 
                      width: 40, 
                      height: 40,
                      ml: 1,
                      mt: 0.5,
                      boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    U
                  </Avatar>
                )}
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
                    bgcolor: accentColor, 
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
                  <CircularProgress size={20} sx={{ color: accentColor }} />
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
            
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Chat input area */}
          <Box 
            sx={{ 
              p: 2, 
              borderTop: '1px solid rgba(0,0,0,0.08)',
              bgcolor: '#fff',
              boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
            }}
          >
            {!user ? (
              <Button
                fullWidth
                variant="contained"
                onClick={() => setShowAuthModal(true)}
                sx={{
                  py: 1.5,
                  bgcolor: accentColor,
                  '&:hover': {
                    bgcolor: theme.palette.augmentColor({ color: { main: accentColor } }).dark
                  }
                }}
              >
                Sign in to Start Chatting
              </Button>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your message..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '50px',
                      pr: 1,
                      bgcolor: '#f7f9fc'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0,0,0,0.1)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0,0,0,0.2)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: accentColor
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        color="primary" 
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        sx={{ 
                          bgcolor: input.trim() && !isLoading ? accentColor : 'transparent',
                          color: input.trim() && !isLoading ? 'white' : 'inherit',
                          '&:hover': {
                            bgcolor: input.trim() && !isLoading ? accentColor : 'transparent',
                            opacity: input.trim() && !isLoading ? 0.9 : 1
                          },
                          transition: 'all 0.2s ease',
                          boxShadow: input.trim() && !isLoading ? '0 3px 8px rgba(0,0,0,0.15)' : 'none'
                        }}
                      >
                        {isLoading ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : <SendIcon />}
                      </IconButton>
                    )
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatLayout; 