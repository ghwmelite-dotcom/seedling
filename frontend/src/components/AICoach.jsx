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

  // AI Response Generator (simulated - would connect to Claude API in production)
  const generateAIResponse = async (userMessage) => {
    setIsTyping(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500));

    const lowerMessage = userMessage.toLowerCase();
    let response = '';

    // Smart contextual responses based on simulation data and user query
    if (lowerMessage.includes('invest') || lowerMessage.includes('saving')) {
      const currentNetWorth = simulation?.baseline?.members?.[0]?.netWorth || 50000;
      const suggestedInvestment = Math.round(currentNetWorth * 0.15 / 12);
      response = `Great question! Based on your current profile, I'd suggest starting with **$${suggestedInvestment}/month** in diversified index funds.

Here's the magic: At a 7% average return, that could grow to **$${(suggestedInvestment * 12 * 30 * 1.07).toLocaleString()}** over 30 years!

**Quick Win:** Try adjusting the "Monthly Savings" in the simulator to see how this compounds across generations.

Want me to create a scenario showing this impact?`;
    } else if (lowerMessage.includes('house') || lowerMessage.includes('home') || lowerMessage.includes('property')) {
      response = `🏠 **Real Estate: The Generational Wealth Builder**

Homeownership is one of the most powerful wealth-building tools:

• **Forced Savings:** Mortgage payments build equity
• **Appreciation:** Historically 3-5% annually
• **Inheritance:** Assets pass to next generation
• **Tax Benefits:** Mortgage interest deductions

**Simulation Tip:** Try setting "Home Purchase Age" to 28-32 and watch how it affects your family tree!

The data shows families with homeownership often have **3-4x higher net worth** by generation 3.`;
    } else if (lowerMessage.includes('education') || lowerMessage.includes('college') || lowerMessage.includes('degree')) {
      response = `📚 **Education & Earning Potential**

Education is a multiplier for generational wealth:

| Education Level | Avg Lifetime Earnings |
|-----------------|----------------------|
| High School | $1.3M |
| Bachelor's | $2.3M |
| Master's | $2.7M |
| Professional | $3.6M |

**Key Insight:** Each generation that attains higher education typically increases family wealth by **40-60%**.

Try adjusting the income levels in your simulation to model this effect!`;
    } else if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('first')) {
      response = `🌱 **Starting Your Wealth Journey**

Here's a proven framework:

1. **Emergency Fund First** (3-6 months expenses)
2. **Eliminate High-Interest Debt** (>7% APR)
3. **Maximize Employer 401k Match** (free money!)
4. **Open a Roth IRA** ($6,500/year limit)
5. **Invest Consistently** (automate it!)

**Your Simulation Strategy:**
Set "Starting Savings Rate" to 20% and watch the compound effect over 4 generations!

The earlier you start, the more generations benefit. Even $100/month at age 22 beats $500/month at age 40.`;
    } else if (lowerMessage.includes('generation') || lowerMessage.includes('legacy') || lowerMessage.includes('inherit')) {
      response = `🌳 **Building Multi-Generational Wealth**

The wealthy don't just save—they create **systems**:

1. **Education Funds:** 529 plans for future generations
2. **Family Trusts:** Protect and transfer assets
3. **Life Insurance:** Create instant inheritance
4. **Family Business:** Income that spans generations
5. **Financial Literacy:** Teach money skills early

**Powerful Insight:** The simulation shows that wealth typically multiplies when each generation:
- Starts saving 5 years earlier
- Increases savings rate by 5%
- Passes down financial knowledge

Would you like me to set up a "Legacy Builder" scenario?`;
    } else if (lowerMessage.includes('habit') || lowerMessage.includes('coffee') || lowerMessage.includes('small')) {
      response = `☕ **The Latte Factor: Small Changes, Big Impact**

Here's the math on daily habits:

| Daily Spend | Monthly | 30yr @ 7% |
|-------------|---------|-----------|
| $5 coffee | $150 | $170,000 |
| $15 lunch | $450 | $510,000 |
| $10 subscriptions | $300 | $340,000 |

**Combined:** That's potentially **$1M+** from small daily choices!

**Try This:** Use the Habit Calculator to see how your specific habits compound.

The question isn't "Can I afford this?" It's "What is this costing my grandchildren?"`;
    } else if (lowerMessage.includes('scenario') || lowerMessage.includes('what if')) {
      response = `🎯 **Creating Powerful "What If" Scenarios**

Great scenarios to explore:

1. **Early Bird:** Start investing at 22 vs 32
2. **Homeowner's Edge:** Buy at 28 vs rent forever
3. **Education Multiplier:** College grad vs high school
4. **Side Hustle:** +$500/month extra income
5. **Frugal Family:** 30% savings rate vs 10%

**Click on "Scenario Library"** in the sidebar to load pre-built simulations, or describe what you want to test and I'll help configure it!

What specific "what if" are you curious about?`;
    } else {
      response = `I'm your AI Financial Coach! 🎯

Here are some things I can help with:

• **Investment Strategies** - "How should I start investing?"
• **Real Estate** - "Should I buy a house?"
• **Education ROI** - "Is college worth it?"
• **Small Habits** - "How much does my coffee habit cost?"
• **Generational Planning** - "How do I build a legacy?"
• **Scenario Analysis** - "What if I saved more?"

Just ask naturally, and I'll provide personalized insights based on your simulation!

**Pro Tip:** The more specific your question, the better I can tailor my advice. Try: "What if I invested $300/month starting at age 25?"`;
    }

    setIsTyping(false);
    return response;
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
