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
    career: `You are a friendly, supportive Career Booster buddy. Talk like a helpful friend, not a formal coach.

Your tone should be casual, upbeat, and encouraging - use conversational language, slang, and even emojis occasionally! You're chatting with a friend, not lecturing them.

Provide practical, actionable career advice about job searching, interviewing, resumes, workplace drama, and professional growth. Be their cheerleader but keep it real.

Use phrases like "Hey there!", "You've got this!", "Let's figure this out together" and other friendly expressions. Avoid corporate jargon or overly formal language.`,

    fitness: `You are a friendly, motivating Fit & Fab workout buddy. Talk like an encouraging friend, not a drill sergeant.

Your tone should be energetic, supportive and relatable - use conversational language, fitness slang, and emojis occasionally! You're their workout partner, not their boss.

Provide practical fitness advice about workouts, nutrition, motivation, and creating sustainable healthy habits. Be enthusiastic but understanding of struggles.

Use phrases like "You're crushing it!", "Let's get moving!", "Don't worry, we all have off days" and other supportive expressions. Avoid overly technical terms or judgmental language.`,

    finance: `You are a down-to-earth Smart Finances buddy. Talk like a savvy friend who's good with money, not a stuffy financial advisor.

Your tone should be casual, practical, and slightly irreverent - use conversational language, money slang, and emojis occasionally! You're helping a friend with their finances, not lecturing them.

Provide realistic financial advice about budgeting, saving, investing, debt, and building wealth. Be encouraging but honest about financial realities.

Use phrases like "Let's sort out your money situation", "You've got this!", "Money hack for you" and other friendly expressions. Avoid complex financial jargon or judgmental language about spending.`,

    mental: `You are a compassionate Mind Spa friend. Talk like a supportive bestie, not a therapist.

Your tone should be gentle, warm, and validating - use conversational language, encouraging phrases, and calming emojis occasionally! You're their safe space to talk about feelings.

Provide practical mental wellness advice for stress management, mindfulness, emotional regulation, self-care, and building resilience. Be validating and normalize struggles.

PAY SPECIAL ATTENTION to any challenges the user shares about discrimination, racial issues, bullying, or traumatic experiences. When mentioned, these MUST be directly acknowledged with sensitivity and care.

If the user mentions racial discrimination or slurs, recognize this as serious and requiring validation, boundary-setting advice, and suggestions for strengthening identity and self-worth.

Use phrases like "I hear you", "It's totally normal to feel that way", "Let's take a deep breath together" and other supportive expressions. Create a judgment-free zone while reminding them you're not a licensed therapist when appropriate.`
  };

  return modePrompts[mode as keyof typeof modePrompts] || 'You are a helpful, friendly AI assistant who talks like a supportive friend.';
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
  let systemPrompt = getSystemPrompt(mode);
  
  // Add formatting instructions
  systemPrompt += " " + getFormattingInstructions();
  
  // Add global personalization requirement for all modes
  systemPrompt += `\n\nCRITICAL INSTRUCTION FOR ALL MODES: Your responses MUST be highly personalized to the user. This includes:
- Using their name frequently throughout your response
- Directly referencing their specific situation, background, and unique circumstances
- Tailoring all advice to their particular profile details
- Ensuring recommendations are relevant to their interests, goals, and needs
- Making them feel that this response was crafted specifically for them and couldn't apply to anyone else`;
  
  // Add user profile information if available
  if (userProfile) {
    // Log the profile data being used
    console.log('FORMATTING WITH PROFILE:', JSON.stringify(userProfile, null, 2));
    
    systemPrompt += "\n\nIMPORTANT USER PROFILE DATA (YOU MUST USE THIS TO PERSONALIZE YOUR RESPONSE):";
    
    if (userProfile.name) {
      systemPrompt += `\n- Name: ${userProfile.name}`;
      systemPrompt += `\n  (YOU MUST ADDRESS THE USER BY NAME MULTIPLE TIMES IN YOUR RESPONSE)`;
    }
    
    if (userProfile.age) {
      systemPrompt += `\n- Age: ${userProfile.age}`;
      systemPrompt += `\n  (YOU MUST CONSIDER THIS AGE IN YOUR ADVICE AND RECOMMENDATIONS)`;
    }
    
    if (userProfile.gender) {
      systemPrompt += `\n- Gender: ${userProfile.gender}`;
      systemPrompt += `\n  (YOU MUST ENSURE YOUR ADVICE IS APPROPRIATE FOR THIS GENDER)`;
    }
    
    if (userProfile.healthConditions) {
      const conditions = Array.isArray(userProfile.healthConditions) 
        ? userProfile.healthConditions.join(', ') 
        : userProfile.healthConditions;
      
      systemPrompt += `\n- Health Conditions: ${conditions}`;
      systemPrompt += `\n  (YOU MUST DIRECTLY ADDRESS THESE HEALTH CONDITIONS IN YOUR RESPONSE REGARDLESS OF MODE)`;
    }
    
    if (userProfile.fitnessLevel) {
      systemPrompt += `\n- Fitness Level: ${userProfile.fitnessLevel}`;
      systemPrompt += `\n  (YOU MUST TAILOR YOUR ADVICE TO THIS FITNESS LEVEL)`;
    }
    
    if (userProfile.goals) {
      const goals = Array.isArray(userProfile.goals) 
        ? userProfile.goals.join(', ') 
        : userProfile.goals;
      
      systemPrompt += `\n- Goals: ${goals}`;
      systemPrompt += `\n  (YOU MUST DIRECTLY REFERENCE THESE SPECIFIC GOALS IN YOUR RESPONSE)`;
    }
    
    // Add interests/hobbies across all modes
    if (userProfile.interests) {
      const interests = Array.isArray(userProfile.interests) 
        ? userProfile.interests.join(', ') 
        : userProfile.interests;
      
      systemPrompt += `\n- Interests/Hobbies: ${interests}`;
      systemPrompt += `\n  (YOU MUST INCORPORATE THESE INTERESTS INTO YOUR RESPONSE REGARDLESS OF MODE)`;
      
      if (mode === 'career') {
        systemPrompt += `\n  (FOR CAREER MODE: YOU MUST SUGGEST SPECIFIC CAREER PATHS RELATED TO THESE INTERESTS)`;
      } else if (mode === 'fitness') {
        systemPrompt += `\n  (FOR FITNESS MODE: YOU MUST SUGGEST EXERCISE OPTIONS RELATED TO THESE INTERESTS)`;
      } else if (mode === 'mental') {
        systemPrompt += `\n  (FOR MENTAL MODE: YOU MUST SUGGEST SELF-CARE ACTIVITIES RELATED TO THESE INTERESTS)`;
      } else if (mode === 'finance') {
        systemPrompt += `\n  (FOR FINANCE MODE: YOU MUST RELATE FINANCIAL ADVICE TO THESE INTERESTS WHERE POSSIBLE)`;
      }
    }
    
    // Add occupation across all modes
    if (userProfile.occupation) {
      systemPrompt += `\n- Occupation: ${userProfile.occupation}`;
      systemPrompt += `\n  (YOU MUST CONSIDER THIS OCCUPATION IN YOUR RESPONSE REGARDLESS OF MODE)`;
      
      if (mode === 'fitness') {
        systemPrompt += `\n  (FOR FITNESS MODE: INCLUDE EXERCISE SUGGESTIONS THAT COMPLEMENT OR COUNTERBALANCE THEIR OCCUPATION)`;
      } else if (mode === 'finance') {
        systemPrompt += `\n  (FOR FINANCE MODE: TAILOR FINANCIAL ADVICE TO THEIR OCCUPATION AND LIKELY INCOME LEVEL)`;
      } else if (mode === 'mental') {
        systemPrompt += `\n  (FOR MENTAL MODE: ADDRESS STRESS FACTORS LIKELY IN THEIR OCCUPATION)`;
      }
    }
    
    // Add experience for all modes
    if (userProfile.experience) {
      systemPrompt += `\n- Experience: ${userProfile.experience}`;
      systemPrompt += `\n  (YOU MUST CONSIDER THIS EXPERIENCE LEVEL IN YOUR RESPONSE REGARDLESS OF MODE)`;
    }
    
    // Add mental health needs for all modes
    if (userProfile.mentalHealthNeeds) {
      const mentalHealthNeeds = Array.isArray(userProfile.mentalHealthNeeds)
        ? userProfile.mentalHealthNeeds.join(', ')
        : userProfile.mentalHealthNeeds;
      
      systemPrompt += `\n- Mental Health Needs: ${mentalHealthNeeds}`;
      systemPrompt += `\n  (YOU MUST BE SENSITIVE TO THESE MENTAL HEALTH NEEDS IN ALL RESPONSES REGARDLESS OF MODE)`;
      
      // Special handling for racial issues
      if (mentalHealthNeeds.toLowerCase().includes('racial') ||
          mentalHealthNeeds.toLowerCase().includes('racism') ||
          mentalHealthNeeds.toLowerCase().includes('black') ||
          mentalHealthNeeds.toLowerCase().includes('slur')) {
        
        systemPrompt += `\n\nSPECIAL FOCUS: The user has mentioned racial discrimination or slurs. This MUST be treated as a priority topic in your response. Include:
        - Validation of their feelings and experiences
        - Advice on setting healthy boundaries with people who use slurs
        - Guidance on maintaining self-worth and identity in the face of discrimination
        - Specific coping mechanisms for racial trauma
        - Recommendations for community support or professional help`;
      }
    }
    
    // Add financial information for all modes
    if (userProfile.financialGoals) {
      const financialGoals = Array.isArray(userProfile.financialGoals)
        ? userProfile.financialGoals.join(', ')
        : userProfile.financialGoals;
      
      systemPrompt += `\n- Financial Goals: ${financialGoals}`;
      systemPrompt += `\n  (YOU MUST CONSIDER THESE FINANCIAL GOALS IN YOUR RESPONSE REGARDLESS OF MODE)`;
    }
    
    if (userProfile.budget) {
      systemPrompt += `\n- Budget: ${userProfile.budget}`;
      systemPrompt += `\n  (YOU MUST CONSIDER THIS BUDGET IN YOUR RESPONSE REGARDLESS OF MODE)`;
    }
    
    // Add specific instructions for fitness mode with health conditions
    if (mode === 'fitness' && userProfile.healthConditions) {
      const healthConditions = Array.isArray(userProfile.healthConditions) 
        ? userProfile.healthConditions 
        : [userProfile.healthConditions];
      
      systemPrompt += `\n\nCRITICAL INSTRUCTION FOR FITNESS ADVICE:`;
      systemPrompt += `\nYou MUST explicitly acknowledge and address the user's health conditions in your response. For each condition, provide specific adaptations or precautions.`;
      
      // Check for asthma-related conditions
      if (healthConditions.some(condition => condition.toLowerCase().includes('asthma'))) {
        systemPrompt += `\n\nSPECIFIC ASTHMA GUIDANCE:`;
        systemPrompt += `\n- Begin with a dedicated section on exercising safely with asthma`;
        systemPrompt += `\n- Recommend warming up properly to prevent exercise-induced asthma`;
        systemPrompt += `\n- Suggest lower-intensity activities or interval training that won't overtax the respiratory system`;
        systemPrompt += `\n- Advise carrying a rescue inhaler during workouts`;
        systemPrompt += `\n- Recommend indoor workouts during high pollen days or cold weather if these are triggers`;
        systemPrompt += `\n- Suggest swimming as a good exercise option (moist air is better for asthma)`;
      }
      
      // Check for BMI-related conditions
      if (healthConditions.some(condition => 
          condition.toLowerCase().includes('bmi') || 
          condition.toLowerCase().includes('weight') ||
          condition.toLowerCase().includes('underweight') ||
          condition.toLowerCase().includes('overweight')
      )) {
        systemPrompt += `\n\nSPECIFIC BMI GUIDANCE:`;
        
        // For low BMI
        if (healthConditions.some(condition => 
            condition.toLowerCase().includes('low bmi') || 
            condition.toLowerCase().includes('underweight')
        )) {
          systemPrompt += `\n- Begin with a dedicated section on how to build muscle and gain weight healthily`;
          systemPrompt += `\n- Emphasize protein intake and caloric surplus`;
          systemPrompt += `\n- Focus on strength training over excessive cardio`;
          systemPrompt += `\n- Suggest smaller, more frequent meals if appetite is an issue`;
          systemPrompt += `\n- Recommend protein shakes or smoothies as supplements to regular meals`;
        }
        // For high BMI
        else if (healthConditions.some(condition => 
            condition.toLowerCase().includes('high bmi') || 
            condition.toLowerCase().includes('overweight')
        )) {
          systemPrompt += `\n- Begin with a dedicated section on safe weight management`;
          systemPrompt += `\n- Emphasize gradual, sustainable weight loss (1-2 pounds per week)`;
          systemPrompt += `\n- Recommend low-impact exercises to protect joints`;
          systemPrompt += `\n- Focus on both strength training and cardio`;
          systemPrompt += `\n- Suggest balanced meals with focus on protein and vegetables`;
        }
      }
    }
    
    systemPrompt += `\n\nYou MUST address the user by name when possible and tailor your advice to their specific profile information. Format your response with clear section headings and proper spacing.`;
    
    // Final instruction on personalization
    systemPrompt += `\n\nREMEMBER: Make the user feel that this response was created SPECIFICALLY for them, referencing their exact profile details throughout your response.`;
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
    
    // Check if response is properly personalized and contains relevant user details
    if (userProfile) {
      const lowerResponse = processedResponse.toLowerCase();
      let needsPersonalization = false;
      let personalizationNote = '';
      const userName = userProfile.name || '';
      
      // Check if user's name is mentioned (if provided)
      if (userName && !lowerResponse.includes(userName.toLowerCase())) {
        needsPersonalization = true;
        personalizationNote += `### Personalized Advice for ${userName}\n\n`;
      }
      
      // Check if user's interests are mentioned (if provided)
      const hasInterests = userProfile.interests && 
        (Array.isArray(userProfile.interests) ? userProfile.interests.length > 0 : userProfile.interests);
      
      let interests: string[] = [];
      if (hasInterests) {
        interests = Array.isArray(userProfile.interests) 
          ? userProfile.interests 
          : [userProfile.interests as string];
        
        // Check if any interest is mentioned
        const interestMentioned = interests.some(interest => 
          lowerResponse.includes(interest.toLowerCase())
        );
        
        if (!interestMentioned) {
          needsPersonalization = true;
        }
      }
      
      // Check if user's goals are mentioned (if provided)
      const hasGoals = userProfile.goals && 
        (Array.isArray(userProfile.goals) ? userProfile.goals.length > 0 : userProfile.goals);
      
      let goals: string[] = [];
      if (hasGoals) {
        goals = Array.isArray(userProfile.goals) 
          ? userProfile.goals 
          : [userProfile.goals as string];
        
        // Check if any goal is mentioned
        const goalMentioned = goals.some(goal => 
          lowerResponse.includes(goal.toLowerCase())
        );
        
        if (!goalMentioned) {
          needsPersonalization = true;
        }
      }
      
      // Add personalization header based on mode and profile
      if (needsPersonalization) {
        let personalDetails = '';
        
        if (mode === 'fitness') {
          personalDetails = `Based on your profile as a ${userProfile.gender || ''} ${userProfile.age ? `${userProfile.age}-year-old` : ''} with ${userProfile.fitnessLevel || 'your current'} fitness level${userProfile.healthConditions ? ` and health considerations (${Array.isArray(userProfile.healthConditions) ? userProfile.healthConditions.join(', ') : userProfile.healthConditions})` : ''}, here's some tailored advice:\n\n`;
        } else if (mode === 'career') {
          personalDetails = `As ${userName ? `${userName}, ` : ''}${userProfile.occupation ? `a ${userProfile.occupation} with ${userProfile.experience || 'your experience level'}` : 'someone with your background'} and interests in ${Array.isArray(userProfile.interests) ? userProfile.interests.join(', ') : userProfile.interests || 'your areas'}, here's targeted career guidance:\n\n`;
        } else if (mode === 'finance') {
          personalDetails = `With ${userProfile.budget ? `your budget of ${userProfile.budget}` : 'your financial situation'} and goals ${userProfile.financialGoals ? `of ${Array.isArray(userProfile.financialGoals) ? userProfile.financialGoals.join(', ') : userProfile.financialGoals}` : 'in mind'}, here's personalized financial advice:\n\n`;
        } else if (mode === 'mental') {
          personalDetails = `${userName ? `${userName}, considering ` : 'Considering '}your mental health needs${userProfile.mentalHealthNeeds ? ` related to ${Array.isArray(userProfile.mentalHealthNeeds) ? userProfile.mentalHealthNeeds.join(', ') : userProfile.mentalHealthNeeds}` : ''}, here's some supportive guidance:\n\n`;
        } else {
          personalDetails = `Based on your specific profile and background, here's personalized advice:\n\n`;
        }
        
        personalizationNote += personalDetails;
        
        // Add relevant sections based on what's missing
        
        // Add interests section if interests weren't mentioned
        if (hasInterests && interests.length > 0 && !interests.some(interest => lowerResponse.includes(interest.toLowerCase()))) {
          const interestsStr = Array.isArray(userProfile.interests) 
            ? userProfile.interests.join(', ') 
            : userProfile.interests as string;
          
          personalizationNote += `### Incorporating Your Interests: ${interestsStr}\n\n`;
          
          if (mode === 'fitness') {
            personalizationNote += `Since you enjoy ${interestsStr}, consider these activities:\n\n`;
            
            // Add specific suggestions based on common interests
            if (interests.some(i => i.toLowerCase().includes('swimming'))) {
              personalizationNote += `* **Swimming** - Great for full-body exercise with minimal joint impact\n`;
            }
            if (interests.some(i => i.toLowerCase().includes('football') || i.toLowerCase().includes('soccer') || i.toLowerCase().includes('fifa'))) {
              personalizationNote += `* **Football/Soccer** - Excellent for cardio, agility and team building\n`;
              personalizationNote += `* **Interval Training** - Similar to the stop-start nature of football matches\n`;
            }
            personalizationNote += `\n`;
          } else if (mode === 'mental') {
            personalizationNote += `Your interests in ${interestsStr} can be integrated into your self-care routine:\n\n`;
            personalizationNote += `* Use these activities as mindful breaks during stressful periods\n`;
            personalizationNote += `* Schedule regular time for these hobbies to maintain work-life balance\n\n`;
          }
        }
        
        // Add goals section if goals weren't mentioned
        if (hasGoals && goals.length > 0 && !goals.some(goal => lowerResponse.includes(goal.toLowerCase()))) {
          const goalsStr = Array.isArray(userProfile.goals) 
            ? userProfile.goals.join(', ') 
            : userProfile.goals as string;
          
          personalizationNote += `### Addressing Your Goals: ${goalsStr}\n\n`;
          personalizationNote += `To help you achieve these specific goals, consider these targeted approaches:\n\n`;
          
          // Add goal-specific advice based on mode
          if (mode === 'career') {
            personalizationNote += `* Create a step-by-step plan with milestones for each goal\n`;
            personalizationNote += `* Identify the specific skills needed to accomplish these goals\n`;
            personalizationNote += `* Consider mentorship opportunities to accelerate your progress\n\n`;
          } else if (mode === 'finance') {
            personalizationNote += `* Break down each goal into measurable financial targets\n`;
            personalizationNote += `* Allocate specific portions of your income toward each goal\n`;
            personalizationNote += `* Set realistic timeframes based on your current financial situation\n\n`;
          }
        }
        
        return personalizationNote + processedResponse;
      }
    }
    
    // Check if user needs are addressed in the respective modes
    // FITNESS MODE: Health conditions check
    if (mode === 'fitness' && userProfile?.healthConditions) {
      const healthConditions = Array.isArray(userProfile.healthConditions) 
        ? userProfile.healthConditions 
        : [userProfile.healthConditions];
      
      // Check if asthma is mentioned
      const hasAsthma = healthConditions.some(condition => 
        condition.toLowerCase().includes('asthma')
      );
      
      const hasBMIIssue = healthConditions.some(condition => 
        condition.toLowerCase().includes('bmi') || 
        condition.toLowerCase().includes('weight') ||
        condition.toLowerCase().includes('underweight') ||
        condition.toLowerCase().includes('overweight')
      );
      
      // If we have asthma but it's not addressed in the response
      if (hasAsthma && !processedResponse.toLowerCase().includes('asthma')) {
        const asthmaNote = `
### Important Health Considerations: Asthma

Based on your asthma condition, please note:

* **Warm up properly** to prevent exercise-induced asthma
* **Carry your rescue inhaler** during all workouts
* **Monitor breathing intensity** and take breaks as needed
* **Consider lower-intensity or interval training** to manage respiratory stress
* **Swimming** is often beneficial as moist air is better for asthma
* **Avoid outdoor exercise** during high pollen days or cold weather if these trigger your symptoms

`;
        return asthmaNote + processedResponse;
      }
      
      // If we have BMI issues but they're not addressed in the response
      if (hasBMIIssue && !processedResponse.toLowerCase().includes('bmi') && !processedResponse.toLowerCase().includes('weight')) {
        // Check for low BMI/underweight
        if (healthConditions.some(condition => 
          condition.toLowerCase().includes('low bmi') || 
          condition.toLowerCase().includes('underweight')
        )) {
          const bmiBulkNote = `
### Important Health Considerations: Below Average BMI

Based on your BMI profile, this plan focuses on:

* **Increasing calorie intake** with nutrient-dense foods
* **Emphasizing protein consumption** to support muscle growth
* **Focusing on strength training** over excessive cardio
* **Including smaller, frequent meals** throughout the day
* **Incorporating healthy calorie-dense foods** like nuts, avocados, and whole grains

`;
          return bmiBulkNote + processedResponse;
        }
        // Check for high BMI/overweight
        else if (healthConditions.some(condition => 
          condition.toLowerCase().includes('high bmi') || 
          condition.toLowerCase().includes('overweight')
        )) {
          const bmiLossNote = `
### Important Health Considerations: Above Average BMI

Based on your BMI profile, this plan focuses on:

* **Gradual, sustainable weight management** (1-2 pounds per week)
* **Low-impact exercises** to protect joints while building strength
* **Balanced approach** to cardio and strength training
* **Nutrient-dense foods** that create a mild caloric deficit
* **Consistent monitoring** of progress and adjusting as needed

`;
          return bmiLossNote + processedResponse;
        }
      }
    }
    
    // MENTAL MODE: Check if mental health needs are addressed
    if (mode === 'mental' && userProfile?.mentalHealthNeeds) {
      const mentalHealthNeeds = Array.isArray(userProfile.mentalHealthNeeds)
        ? userProfile.mentalHealthNeeds
        : [userProfile.mentalHealthNeeds];
      
      // Check for racial discrimination or racism-related issues
      const hasRacialIssues = mentalHealthNeeds.some(need => 
        need.toLowerCase().includes('racial') || 
        need.toLowerCase().includes('racism') || 
        need.toLowerCase().includes('black') ||
        need.toLowerCase().includes('slur')
      );
      
      const lowerResponse = processedResponse.toLowerCase();
      
      // If there are racial issues but they're not addressed in the response
      if (hasRacialIssues && 
          !lowerResponse.includes('racial') && 
          !lowerResponse.includes('racism') && 
          !lowerResponse.includes('discriminat') &&
          !lowerResponse.includes('slur')) {
        
        const racialSupportNote = `
### Addressing Racial Discrimination and Slurs

I noticed you mentioned dealing with racial slurs and discrimination. This is an important and deeply personal issue that deserves direct attention:

* **Your feelings are valid** - Experiencing racial discrimination is painful and traumatic
* **Setting boundaries** is essential - You have the right to distance yourself from people who use racial slurs
* **Prioritize your mental health** - Consider whether these "friends" are truly supportive of your wellbeing
* **Find community support** - Connect with others who understand your experiences
* **Practice self-care** - Engage in activities that affirm your identity and worth
* **Consider professional support** - A therapist experienced in racial trauma can provide valuable guidance

`;
        return racialSupportNote + processedResponse;
      }
    }
    
    // FINANCE MODE: Check if financial goals are addressed
    if (mode === 'finance' && userProfile?.financialGoals) {
      const financialGoals = Array.isArray(userProfile.financialGoals)
        ? userProfile.financialGoals
        : [userProfile.financialGoals];
      
      const lowerResponse = processedResponse.toLowerCase();
      
      // Check for debt reduction goals
      const hasDebtGoals = financialGoals.some(goal => 
        goal.toLowerCase().includes('debt') || 
        goal.toLowerCase().includes('loan') ||
        goal.toLowerCase().includes('credit card')
      );
      
      // Check for saving/investment goals
      const hasSavingGoals = financialGoals.some(goal => 
        goal.toLowerCase().includes('sav') || 
        goal.toLowerCase().includes('invest') ||
        goal.toLowerCase().includes('retire') ||
        goal.toLowerCase().includes('emergency fund')
      );
      
      // Check for budget goals
      const hasBudgetGoals = financialGoals.some(goal => 
        goal.toLowerCase().includes('budget') || 
        goal.toLowerCase().includes('spend') ||
        goal.toLowerCase().includes('track')
      );
      
      // If debt goals aren't addressed in the response
      if (hasDebtGoals && 
          !lowerResponse.includes('debt') && 
          !lowerResponse.includes('loan') && 
          !lowerResponse.includes('credit card')) {
        
        const debtNote = `
### Important Financial Focus: Debt Management

Based on your financial goal of addressing debt, here are key strategies to consider:

* **Prioritize high-interest debt first** - Focus on paying down credit cards or loans with the highest interest rates
* **Consider debt consolidation** - Combining multiple debts into a single lower-interest loan can simplify payments
* **Create a debt reduction schedule** - Plan specific payment amounts and dates for each debt
* **Automate minimum payments** - Ensure you never miss a payment date
* **Negotiate with creditors** - Some may offer lower interest rates or settlement options
* **Track your progress** - Seeing your debt decrease can be motivating

`;
        return debtNote + processedResponse;
      }
      
      // If saving goals aren't addressed in the response
      if (hasSavingGoals && 
          !lowerResponse.includes('sav') && 
          !lowerResponse.includes('invest') && 
          !lowerResponse.includes('retire')) {
        
        const savingNote = `
### Important Financial Focus: Saving & Investing

Based on your financial goal of building savings or investments, here are key strategies to consider:

* **Automate your savings** - Set up automatic transfers on payday
* **Build an emergency fund first** - Aim for 3-6 months of essential expenses
* **Take advantage of employer matching** - Maximize any retirement account matching
* **Consider tax-advantaged accounts** - IRAs, 401(k)s, or HSAs can reduce your tax burden
* **Diversify investments** - Spread risk across different asset classes
* **Start with low-cost index funds** - These provide broad market exposure with minimal fees

`;
        return savingNote + processedResponse;
      }
      
      // If budget goals aren't addressed in the response
      if (hasBudgetGoals && 
          !lowerResponse.includes('budget') && 
          !lowerResponse.includes('track') && 
          !lowerResponse.includes('spend')) {
        
        const budgetNote = `
### Important Financial Focus: Budgeting

Based on your financial goal of better budgeting, here are key strategies to consider:

* **Track all expenses** - Use apps or spreadsheets to monitor where your money goes
* **Categorize spending** - Group expenses into needs, wants, and savings
* **Follow the 50/30/20 rule** - Allocate 50% to needs, 30% to wants, and 20% to savings
* **Plan for irregular expenses** - Set aside money monthly for annual bills
* **Review and adjust regularly** - Monthly budget reviews help identify improvement areas
* **Use cash envelopes or digital equivalents** - For categories where you tend to overspend

`;
        return budgetNote + processedResponse;
      }
    }
    
    // CAREER MODE: Check if occupation and experience are addressed
    if (mode === 'career' && (userProfile?.occupation || userProfile?.experience || userProfile?.interests)) {
      const lowerResponse = processedResponse.toLowerCase();
      const occupation = userProfile.occupation ? userProfile.occupation.toLowerCase() : '';
      const experience = userProfile.experience ? userProfile.experience.toLowerCase() : '';
      
      // If occupation isn't mentioned in the response
      if (occupation && 
          !lowerResponse.includes(occupation) && 
          !lowerResponse.includes('current role') && 
          !lowerResponse.includes('your field')) {
        
        const careerNote = `
### Career Guidance Based on Your Current Role

As a ${userProfile.occupation}, there are specific strategies that can help you advance your career:

* **Industry-specific skill development** - Focus on the most in-demand skills for your field
* **Professional networking** - Connect with others in your industry through LinkedIn and professional associations
* **Continuing education** - Consider certifications or training that would enhance your value
* **Career progression paths** - Research typical advancement routes for professionals in your position
* **Personal branding** - Highlight your specialized experience in your resume and online profiles

`;
        return careerNote + processedResponse;
      }
      
      // Check if interests/hobbies are addressed in career mode
      if (userProfile.interests && mode === 'career') {
        const interests = Array.isArray(userProfile.interests) 
          ? userProfile.interests 
          : [userProfile.interests];
        
        // Check if any of the interests are mentioned in the response
        const interestMentioned = interests.some(interest => 
          lowerResponse.includes(interest.toLowerCase())
        );
        
        // If none of the interests are mentioned, add a section about them
        if (!interestMentioned && interests.length > 0) {
          const interestsStr = interests.join(', ');
          
          const hobbiesNote = `
### Career Paths Based on Your Interests: ${interestsStr}

Based on your interests and hobbies, here are some potential career paths to explore:

`;
          
          // Add specific career suggestions based on common interests
          let careerSuggestions = '';
          
          if (interests.some(i => i.toLowerCase().includes('fifa') || i.toLowerCase().includes('football') || i.toLowerCase().includes('soccer'))) {
            careerSuggestions += `
* **Sports Management** - Work with professional football clubs in administrative roles
* **Sports Marketing** - Promote sports events, teams, or products
* **Football Coaching** - Work with youth or amateur teams
* **Sports Journalism** - Write about football matches and news
* **E-Sports Professional** - Compete in FIFA gaming tournaments
* **Football Analytics** - Use data to improve team performance
`;
          }
          
          if (interests.some(i => i.toLowerCase().includes('swimming'))) {
            careerSuggestions += `
* **Swimming Coach** - Train competitive or recreational swimmers
* **Aquatic Facility Management** - Run pools or water parks
* **Physical Therapy** - Specialize in aquatic therapy
* **Competitive Swimming** - Professional competition or coaching
* **Water Safety Instruction** - Teach swimming and water safety
`;
          }
          
          // Add general advice if we don't have specific suggestions
          if (!careerSuggestions) {
            careerSuggestions = interests.map(interest => 
              `* **${interest} Industry Professional** - Use your passion for ${interest} in a related field\n`
            ).join('');
          }
          
          careerSuggestions += `
**Next Steps to Explore These Paths:**

* **Research** - Look into educational requirements and job prospects
* **Connect** - Network with professionals already in these fields
* **Gain Experience** - Start with part-time or volunteer work to build skills
* **Build a Portfolio** - Document your hobby projects to showcase your expertise
* **Consider Education** - Look into certifications or courses that would help transition

`;
          
          return hobbiesNote + careerSuggestions + processedResponse;
        }
      }
      
      // If experience level isn't addressed appropriately
      if (experience && !lowerResponse.includes(experience)) {
        let experienceNote = '';
        
        if (experience.includes('entry') || experience.includes('junior') || experience.includes('beginner')) {
          experienceNote = `
### Early Career Development Strategies

As someone in the early stages of your career, consider these approaches:

* **Find a mentor** - Seek guidance from experienced professionals in your field
* **Build foundational skills** - Focus on developing core competencies needed in your industry
* **Say yes to diverse opportunities** - Gain broad experience through different projects
* **Document your achievements** - Start building a portfolio of your work and successes
* **Develop soft skills** - Communication and teamwork are as important as technical abilities

`;
        } else if (experience.includes('mid') || experience.includes('intermediate')) {
          experienceNote = `
### Mid-Career Advancement Strategies

At your mid-career stage, consider these approaches:

* **Specialize or broaden** - Decide whether to deepen expertise or expand your skill set
* **Lead projects** - Seek opportunities to demonstrate leadership abilities
* **Build your network strategically** - Focus on quality connections in your industry
* **Reassess your goals** - Ensure your current path aligns with your long-term objectives
* **Consider management training** - If leadership interests you, develop those skills

`;
        } else if (experience.includes('senior') || experience.includes('experienced') || experience.includes('advanced')) {
          experienceNote = `
### Senior Professional Growth Strategies

With your extensive experience, consider these approaches:

* **Mentorship and leadership** - Guide others while continuing to grow yourself
* **Strategic career positioning** - Focus on high-impact roles and projects
* **Thought leadership** - Share your expertise through speaking or writing
* **Executive skills development** - Enhance business acumen and strategic thinking
* **Work-life integration** - Design a sustainable approach to career advancement

`;
        }
        
        if (experienceNote) {
          return experienceNote + processedResponse;
        }
      }
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
  
  // Add spacing after headings
  processed = processed.replace(/(#{1,3}\s+.*)\n/g, '$1\n\n');
  
  // Convert continuous paragraph text to better-spaced format
  if (!processed.includes('\n\n') && processed.length > 100) {
    processed = processed.replace(/\. /g, '.\n\n');
  }
  
  // Improve list formatting
  processed = processed.replace(/(\*|\-|\d+\.)\s+(.*?)(?=\n)/g, '$1 $2\n');
  
  // Add extra line break before sections
  processed = processed.replace(/([.!?])\n(#{1,3})/g, '$1\n\n$2');
  
  // Fix bold formatting - ensure there's a space after closing **
  processed = processed.replace(/\*\*([^*]+)\*\*([^\s])/g, '**$1** $2');
  
  // Add horizontal rule before major sections
  processed = processed.replace(/\n(#{1,2}\s+(?:Diet|Exercise|Health|Workout|Nutrition|Training))/gi, '\n\n---\n\n$1');
  
  return processed;
}; 