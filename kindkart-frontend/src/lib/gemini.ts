/**
 * Gemini AI API integration
 * Uses Google's Gemini API for AI-powered assistance
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export async function callGeminiAPI(
  prompt: string,
  context?: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, using fallback response');
    return generateFallbackResponse(prompt, context);
  }

  try {
    // Build the system context for KindKart
    const systemContext = `You are a helpful AI assistant for KindKart, a neighborhood community platform. 
KindKart helps neighbors connect and help each other with tasks like groceries, repairs, tutoring, etc.

Key features:
- Communities: Users can create or join communities with invite codes
- Help Requests: Users can post requests for help or offer to help others
- Payments: Secure escrow payment system with 20-minute verification window
- Reputation: Users earn points and badges for helping others
- Chat: Real-time messaging between community members

${context ? `Current context: ${context}` : ''}

Provide helpful, concise, and friendly responses. If asked about features, explain how they work in KindKart.`;

    // Convert conversation history to Gemini format
    const contents: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: systemContext }],
      },
    ];

    // Add conversation history (last 5 messages to keep context manageable)
    const recentHistory = conversationHistory.slice(-5);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Add current prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }

    throw new Error('Invalid response from Gemini API');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to local response generator
    return generateFallbackResponse(prompt, context);
  }
}

function generateFallbackResponse(query: string, context?: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('community') || lowerQuery.includes('create')) {
    return "To create a community, click the 'Create Community' button on your dashboard. You'll need to provide a name and optional rules. Once created, you'll get a unique 6-character invite code to share with neighbors. As the creator, you'll be the admin and can approve member requests.";
  }

  if (lowerQuery.includes('payment') || lowerQuery.includes('wallet') || lowerQuery.includes('money')) {
    return "KindKart uses an escrow payment system for security. When you make a payment, the money is held in escrow until the work is completed and verified. You have 20 minutes after completion to verify. If there's a dispute, community admins can help resolve it. All transactions are secure and tracked in your wallet.";
  }

  if (lowerQuery.includes('reputation') || lowerQuery.includes('points') || lowerQuery.includes('badge')) {
    return "You earn reputation points by helping others and completing requests. Points are awarded for: completing help requests (+10), receiving positive reviews (+5), being a reliable helper (+3 per request). Badges are unlocked at milestones like 'First Helper', 'Community Champion', and 'Top Contributor'. Check your reputation page to see your progress!";
  }

  if (lowerQuery.includes('request') || lowerQuery.includes('help')) {
    return "To create a help request, go to a community and click 'Create Request'. Choose a category (like groceries, repairs, tutoring), add details, set timing, and privacy level. Others can respond, and you can accept the best helper. Use clear descriptions and realistic timing to get better responses!";
  }

  if (lowerQuery.includes('join') || lowerQuery.includes('invite')) {
    return "To join a community, you need an invite code from an existing member. Go to 'Join Community' and enter the 6-character code. Your request will be sent to the community admin for approval. Once approved, you can participate in all community activities!";
  }

  return "I'm here to help! KindKart is a platform for neighbors to help each other. You can create or join communities, post help requests, offer assistance, and build your reputation. Is there something specific you'd like to know more about?";
}

