import { HfInference } from '@huggingface/inference';

// Define types internally instead of importing
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type CoachingMode = 'career' | 'fitness' | 'finance' | 'mental' | 'general';

// Create a Hugging Face Inference instance with your API token
// You'll need to get an API token from https://huggingface.co/settings/tokens
const HF_API_TOKEN = process.env.HUGGING_FACE_API_TOKEN || '';
const inference = new HfInference(HF_API_TOKEN);

// Default model to use - you can customize this
// Some good options for chat models:
// - meta-llama/Llama-2-7b-chat-hf
// - microsoft/Phi-2
// - google/gemma-7b-it
// - mistralai/Mistral-7B-Instruct-v0.2
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

// Interface for the chat request
export interface ChatRequest {
  messages: Message[];
  mode: CoachingMode;
  userId?: string; // Optional user ID for personalization
  userProfile?: UserProfile; // Optional user profile data
}

// Interface for user profile data (for better type safety)
export interface UserProfile {
  name?: string;
  age?: number | string;
  gender?: string;
  goals?: string | string[];
  interests?: string | string[];
  occupation?: string;
  experience?: string;
  healthConditions?: string | string[];
  fitnessLevel?: string;
  financialGoals?: string | string[];
  budget?: string;
  mentalHealthNeeds?: string | string[];
  [key: string]: any; // Allow for additional properties
}

// Prepare the system prompt based on the coaching mode
const getSystemPrompt = (mode: string): string => {
  const modePrompts = {
    career: 'You are an AI Career Coach. Provide helpful, actionable career advice. Focus on professional development, job searching, career planning, interviewing, resume building, and workplace skills. Be supportive, practical, and concise.',
    fitness: 'You are an AI Fitness Coach. Provide helpful, actionable fitness and wellness advice. Focus on workout routines, nutrition, physical health, recovery, and healthy habits. Be supportive, practical, and concise. Avoid medical advice that should come from a healthcare professional.',
    finance: 'You are an AI Financial Coach. Provide helpful, actionable financial advice. Focus on budgeting, saving, investing, debt management, and financial planning. Be supportive, practical, and concise. Clarify that you\'re not a licensed financial advisor when appropriate.',
    mental: 'You are an AI Mental Health Coach. Provide helpful, supportive guidance for mental wellbeing. Focus on stress management, mindfulness, emotional regulation, and self-care techniques. Be compassionate, practical, and concise. Clarify that you\'re not a licensed therapist and suggest professional help for serious issues.'
  };

  return modePrompts[mode as keyof typeof modePrompts] || 'You are a helpful AI assistant.';
};

// Format response instructions to ensure well-structured responses
const getFormattingInstructions = (): string => {
  return `
Format your responses in a clean, readable way that's easy to scan. You MUST follow these formatting rules:

1. Use short paragraphs (2-3 sentences max)
2. Use bullet points for lists with proper spacing between items
3. Use numbered steps for processes with proper spacing
4. Bold key points using **text** syntax
5. Use headings for sections with clear ### Heading format
6. Add empty lines between sections for readability
7. Keep your tone conversational and encouraging
8. NEVER format responses as continuous paragraphs

CRITICAL: Always structure your responses with proper spacing, line breaks, and formatting. Use vertical spacing to make content easy to read.
`;
};

// Format messages for the LLM
export const formatMessagesForLLM = (
  messages: Message[],
  mode: CoachingMode = 'general',
  userProfile?: UserProfile
): string => {
  // Set the system prompt based on the selected coaching mode
  let systemPrompt = `You are an AI Life Coach, specializing in ${mode} coaching. Your responses should be supportive, practical, and actionable.`;
  
  // Add formatting instructions
  systemPrompt += " " + getFormattingInstructions();
  
  // Add user profile information if available
  if (userProfile) {
    // Log the profile data being used
    console.log('FORMATTING WITH PROFILE:', JSON.stringify(userProfile, null, 2));
    
    systemPrompt += "\n\nIMPORTANT USER PROFILE DATA (USE THIS TO PERSONALIZE YOUR RESPONSE):";
    
    if (userProfile.name) {
      systemPrompt += `\n- Name: ${userProfile.name}`;
    }
    
    if (userProfile.age) {
      systemPrompt += `\n- Age: ${userProfile.age}`;
    }
    
    if (userProfile.gender) {
      systemPrompt += `\n- Gender: ${userProfile.gender}`;
    }
    
    if (userProfile.healthConditions) {
      const conditions = Array.isArray(userProfile.healthConditions) 
        ? userProfile.healthConditions.join(', ') 
        : userProfile.healthConditions;
      
      systemPrompt += `\n- Health Conditions: ${conditions}`;
      systemPrompt += `\n  (YOU MUST DIRECTLY ADDRESS THESE HEALTH CONDITIONS IN YOUR RESPONSE)`;
    }
    
    if (userProfile.fitnessLevel) {
      systemPrompt += `\n- Fitness Level: ${userProfile.fitnessLevel}`;
    }
    
    if (userProfile.goals) {
      systemPrompt += `\n- Goals: ${userProfile.goals}`;
    }
    
    if (mode === 'fitness' && userProfile.healthConditions) {
      systemPrompt += `\n\nCRITICAL INSTRUCTION: Since this is a fitness conversation and the user has health conditions (${userProfile.healthConditions}), you MUST explicitly acknowledge these conditions in your response and provide specific adaptations or precautions related to them. Include a dedicated section addressing each health condition.`;
    }
    
    systemPrompt += `\n\nAlways address the user by name when possible and tailor your advice to their specific profile information.`;
  }
  
  // Format the messages for the LLM
  let prompt = `<s>[INST] ${systemPrompt} [/INST]</s>`;
  
  // Add the conversation history
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const role = message.role === 'user' ? '[INST]' : '[/INST]';
    const closeRole = message.role === 'user' ? '[/INST]' : '[INST]';
    
    prompt += `<s>${role} ${message.content} ${closeRole}</s>`;
  }
  
  return prompt;
};

// Generate a response from the LLM
export const generateLLMResponse = async (chatRequest: ChatRequest): Promise<string> => {
  try {
    const { messages, mode, userProfile } = chatRequest;
    
    // Log profile data for debugging
    console.log('PROFILE DATA RECEIVED:', JSON.stringify(userProfile, null, 2));
    
    // Format the messages for the model
    const prompt = formatMessagesForLLM(messages, mode, userProfile);
    
    // Log the prompt for debugging
    console.log('PROMPT SENT TO LLM:', prompt);
    
    // Call the Hugging Face Inference API
    const response = await inference.textGeneration({
      model: DEFAULT_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
        return_full_text: false,
      },
    });
    
    // Extract and clean the response text
    let responseText = response.generated_text || '';
    
    // Log the raw response for debugging
    console.log('RAW LLM RESPONSE:', responseText);
    
    // Clean up any leftover formatting tags that might have been generated
    responseText = responseText.replace(/<s>|<\/s>|\[INST\]|\[\/INST\]/g, '').trim();
    
    // Post-process the response to ensure it has proper formatting
    const processedResponse = postProcessResponse(responseText);
    
    // If health conditions exist but aren't mentioned in the response for fitness questions,
    // add a note at the beginning about accommodating these health conditions
    if (
      mode === 'fitness' && 
      userProfile?.healthConditions && 
      !processedResponse.toLowerCase().includes('asthma') && 
      !processedResponse.toLowerCase().includes('bmi')
    ) {
      const healthNote = `### Important Health Considerations\n\nBased on your health profile (${Array.isArray(userProfile.healthConditions) ? userProfile.healthConditions.join(', ') : userProfile.healthConditions}), please note that the following plan has been adjusted to accommodate your specific needs.\n\n`;
      return healthNote + processedResponse;
    }
    
    return processedResponse;
  } catch (error) {
    console.error('Error generating LLM response:', error);
    return "I'm sorry, I encountered an error while processing your request. Please try again later.";
  }
};

// Post-process the LLM response to ensure proper formatting
const postProcessResponse = (text: string): string => {
  // Remove excessive newlines (more than 2 in a row)
  let processed = text.replace(/\n{3,}/g, '\n\n');
  
  // Ensure paragraphs are properly spaced
  processed = processed.replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2');
  
  // Ensure bullet points have proper spacing
  processed = processed.replace(/\n([•\-\*])\s+/g, '\n\n$1 ');
  
  // Ensure numbered lists have proper spacing
  processed = processed.replace(/\n(\d+\.)\s+/g, '\n\n$1 ');
  
  // Ensure headings have proper spacing
  processed = processed.replace(/\n(#{1,3})\s+/g, '\n\n$1 ');
  
  // Convert continuous paragraph text to better-spaced format
  if (!processed.includes('\n\n') && processed.length > 100) {
    processed = processed.replace(/\. /g, '.\n\n');
  }
  
  return processed;
}; 