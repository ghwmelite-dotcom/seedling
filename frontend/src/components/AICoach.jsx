import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

const AICoach = ({ simulation, onScenarioSuggestion }) => {
  const { chatHistory, addChatMessage, clearChatHistory } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // API base URL
  const API_URL = import.meta.env.VITE_API_URL || 'https://seedling-api.anthropic-code.workers.dev';

  // AI Response Generator using Cloudflare Workers AI (Llama 3)
  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);

    try {
      // Build context from simulation data
      const context = simulation ? {
        netWorth: simulation.baseline?.tree?.netWorth,
        income: simulation.baseline?.tree?.income,
        savings: simulation.baseline?.tree?.savings,
        debt: simulation.baseline?.tree?.debt,
        generations: simulation.baseline?.tree?.children?.length || 0,
        financialHealth: simulation.baseline?.tree?.financialHealth,
      } : null;

      // Get recent chat history for context
      const recentMessages = chatHistory.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Add current message
      recentMessages.push({ role: 'user', content: userMessage });

      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentMessages,
          context
        })
      });

      const data = await response.json();

      if (data.success && data.response) {
        setIsTyping(false);
        return data.response;
      } else {
        throw new Error(data.error || 'AI service unavailable');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      setIsTyping(false);

      // Fallback to helpful error message
      return `I'm having trouble connecting to the AI service right now. Here are some quick tips while we fix this:

**Getting Started with Wealth Building:**
1. Start with an emergency fund (3-6 months expenses)
2. Pay off high-interest debt first
3. Invest consistently, even small amounts
4. Use the Simulator to see compound growth!

Try asking again in a moment, or explore the Scenario Library for pre-built wealth simulations.`;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, timestamp: Date.now() };
    addChatMessage(userMessage);
    setInput('');

    const response = await generateAIResponse(input);
    const aiMessage = { role: 'assistant', content: response, timestamp: Date.now() };
    addChatMessage(aiMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "How do I start building wealth?",
    "What if I invested $200/month?",
    "Should I buy a house?",
    "How do small habits add up?",
  ];

  return (
    <motion.div
      className={`glass-card overflow-hidden transition-all duration-500 ${
        isExpanded ? 'fixed inset-4 z-50' : ''
      }`}
      layout
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 20px rgba(16, 185, 129, 0.3)',
                '0 0 40px rgba(16, 185, 129, 0.5)',
                '0 0 20px rgba(16, 185, 129, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl">🤖</span>
          </motion.div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              AI Financial Coach
              <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                Powered by AI
              </span>
            </h3>
            <p className="text-slate-400 text-sm">Ask me anything about building wealth</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={clearChatHistory}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Clear chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className={`overflow-y-auto p-4 space-y-4 ${isExpanded ? 'h-[calc(100%-180px)]' : 'h-64'}`}>
        {chatHistory.length === 0 ? (
          <div className="text-center py-8">
            <motion.div
              className="text-6xl mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              💡
            </motion.div>
            <p className="text-slate-400 mb-6">Start a conversation about your financial future!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map((question, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setInput(question)}
                  className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-sm text-slate-300 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((message, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                    : 'bg-slate-700/50 text-slate-100'
                }`}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">
                      {line.startsWith('**') && line.endsWith('**')
                        ? <strong>{line.slice(2, -2)}</strong>
                        : line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-slate-700/50 rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
                <span className="text-slate-400 text-sm">AI is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about investing, savings, real estate..."
            className="flex-1 bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
          />
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AICoach;
