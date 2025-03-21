import { NextRequest, NextResponse } from 'next/server';
import { generateLLMResponse, ChatRequest } from '../llm/service';
import { getUserProfile } from '@/lib/firebase/userProfile';

// Define a type for the user profile response
interface UserProfileResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json() as ChatRequest;
    
    // Validate the request
    if (!body.messages || !body.mode) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: messages or mode' }), 
        { status: 400 }
      );
    }
    
    // Check if we have a user ID in the request
    const userId = body.userId;
    
    // Add user profile data if user is authenticated
    let userProfileData = null;
    if (userId) {
      try {
        const profileResponse = await getUserProfile(userId) as UserProfileResponse;
        if (profileResponse.success) {
          userProfileData = profileResponse.data;
        }
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Continue even if we can't get the profile
      }
    }
    
    // Generate response from LLM
    const responseText = await generateLLMResponse({
      ...body,
      userProfile: userProfileData
    });
    
    // Return the response
    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Error in chat API route:', error);
    return new NextResponse(
      JSON.stringify({ error: 'An error occurred while processing your request' }), 
      { status: 500 }
    );
  }
}

// This is needed to configure the API route with proper CORS headers
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 