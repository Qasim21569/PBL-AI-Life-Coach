// Handle sending a user message
const handleSendMessage = async (text?: string) => {
  const currentText = text || input.trim();
  if (!currentText) return;

  // Add the user message to the chat
  const userMessage: Message = {
    id: messages.length + 1,
    text: currentText,
    sender: 'user',
    timestamp: new Date()
  };

  setMessages([...messages, userMessage]);
  setInput('');
  setIsLoading(true);

  try {
    const mode = getModeFromTitle();
    
    // If user is authenticated, fetch user profile
    let userProfile = null;
    if (user) {
      try {
        const profileData = await fetchUserProfile(user.uid);
        console.log("PROFILE FETCHED:", profileData);
        userProfile = profileData;
      } catch (error) {
        console.error('Error fetching user profile for chat:', error);
        // Continue without profile data if there's an error
      }
    }

    // Make API call to get response with user profile if available
    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: currentText }],
        mode,
        userId: user?.uid,
        userProfile
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const data = await response.json();
    const botResponse = data.response;

    // Add the bot response to the chat
    const botMessage: Message = {
      id: messages.length + 2,
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prevMessages => [...prevMessages, botMessage]);
  } catch (error) {
    console.error('Error getting bot response:', error);
    // Add an error message to the chat
    const errorMessage: Message = {
      id: messages.length + 2,
      text: "I'm sorry, I encountered an error while processing your request. Please try again later.",
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prevMessages => [...prevMessages, errorMessage]);
  } finally {
    setIsLoading(false);
  }
}; 