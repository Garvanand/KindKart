'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, Lightbulb, HelpCircle, MessageSquare } from 'lucide-react';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant({ context }: { context?: string }) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: context 
        ? `Hello! I'm your KindKart AI assistant. I can help you with ${context}. What would you like to know?`
        : "Hello! I'm your KindKart AI assistant. I can help you with communities, requests, payments, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickSuggestions = [
    "How do I create a community?",
    "How does the payment system work?",
    "How do I earn reputation points?",
    "What are the best practices for requests?",
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Call Gemini API
      const { callGeminiAPI } = await import('@/lib/gemini');
      
      // Convert messages to format expected by Gemini
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await callGeminiAPI(currentInput, context, conversationHistory);
      
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback response
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or check your internet connection.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-primary/20 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-white">AI Assistant</CardTitle>
            <CardDescription className="text-white/80">Your helpful community guide</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Messages */}
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSuggestion(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about KindKart..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="gradient-primary text-white">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


