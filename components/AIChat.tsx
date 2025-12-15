import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Zap, Brain, Loader2, Sparkles, Bot } from 'lucide-react';
import { EXAM_DATE, BENEFITS, OFFERINGS, BRANCHES } from '../constants';

const SYSTEM_INSTRUCTION = `You are a friendly and helpful AI assistant for the SCC SAT (Shiv Chhatrapati Classes Scholarship Admission Test) Registration 2025.

Key Information to use:
- **Exam Date:** ${EXAM_DATE}
- **Fee:** FREE for 10th Standard students.
- **Scholarship:** Top 30 students get their 12th Standard coaching completely FREE.
- **Courses Offered:** ${OFFERINGS.join(', ')}.
- **Benefits:** ${BENEFITS.join(', ')}.
- **Locations:**
  1. Satpur (Main): ${BRANCHES.SATPUR.address}. Phone: ${BRANCHES.SATPUR.phones.join(', ')}.
  2. Meri: ${BRANCHES.MERI.address}. Phone: ${BRANCHES.MERI.phones.join(', ')}.

Instructions:
- Keep answers concise, encouraging, and easy to read.
- Help students with registration queries, syllabus questions, or general motivation.
- If asked about "Thinking Mode" or complex study plans, explain you can think deeply to help them.
- Format responses with bullet points where appropriate.
`;

type Message = {
  role: 'user' | 'model';
  text: string;
};

type Mode = 'fast' | 'thinking';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I can help you with SCC SAT registration or exam questions. Try my 'Deep Think' mode for complex study plans!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('fast');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // Initialize AI client with API Key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let responseText = '';

      // Prepare history for context
      // Note: The SDK expects history in a specific format if using chat, 
      // but here we are using generateContent with a list of contents to simulate chat history + system instruction.
      const historyParts = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      // Add current message
      historyParts.push({ role: 'user', parts: [{ text: userText }] });

      if (mode === 'thinking') {
        // Thinking Mode: Uses gemini-3-pro-preview with high thinking budget
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: historyParts,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            thinkingConfig: { thinkingBudget: 16000 } // Budget for reasoning
          }
        });
        responseText = response.text || "I couldn't generate a response.";
      } else {
        // Fast Mode: Uses gemini-2.5-flash for standard tasks
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: historyParts,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          }
        });
        responseText = response.text || "I couldn't generate a response.";
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an issue connecting to the AI. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${
          isOpen ? 'bg-red-600 rotate-90' : 'bg-[#2E3192] hover:bg-blue-800'
        }`}
        aria-label="Toggle AI Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
             <MessageCircle className="w-7 h-7 text-white" />
             <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
             </span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-[#1a1a1a] p-4 flex flex-col gap-3 border-b border-gray-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center text-white gap-2">
                    <Bot className="w-6 h-6 text-blue-400" />
                    <h3 className="font-bold font-logo tracking-wide">SCC AI Helper</h3>
                </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-gray-800 p-1 rounded-lg">
                <button 
                    onClick={() => setMode('fast')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                        mode === 'fast' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Zap className="w-3.5 h-3.5" /> Fast
                </button>
                <button 
                    onClick={() => setMode('thinking')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                        mode === 'thinking' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <Brain className="w-3.5 h-3.5" /> Deep Think
                </button>
            </div>
            <div className="text-[10px] text-gray-400 text-center">
                {mode === 'thinking' ? 'Uses Gemini 3 Pro (High Reasoning)' : 'Uses Gemini 2.5 Flash (Standard)'}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                   {msg.role === 'model' && mode === 'thinking' && idx === messages.length - 1 && isLoading ? (
                       <span className="flex items-center gap-2 text-purple-600 font-bold text-xs mb-1">
                           <Sparkles className="w-3 h-3 animate-pulse" /> Thinking...
                       </span>
                   ) : null}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                    {mode === 'thinking' ? (
                        <>
                            <Brain className="w-4 h-4 text-purple-500 animate-pulse" />
                            <span className="text-xs text-purple-600 font-bold animate-pulse">Reasoning...</span>
                        </>
                    ) : (
                         <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === 'thinking' ? "Ask a complex question..." : "Ask me anything..."}
                className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none border border-transparent focus:border-blue-200 transition-all text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}