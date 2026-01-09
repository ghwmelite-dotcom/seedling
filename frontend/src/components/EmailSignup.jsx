import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.PROD
  ? 'https://seedling-api.ghwmelite.workers.dev'
  : 'http://localhost:8787';

// ============== FLOATING SEEDS ANIMATION ==============
const FloatingSeeds = () => {
  const seeds = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.3,
    x: 10 + (i * 12),
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {seeds.map((seed) => (
        <motion.div
          key={seed.id}
          className="absolute text-lg"
          style={{ left: `${seed.x}%`, bottom: '-20px' }}
          animate={{
            y: [0, -150, -300],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 4,
            delay: seed.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeOut",
          }}
        >
          🌱
        </motion.div>
      ))}
    </div>
  );
};

// ============== SUCCESS CELEBRATION ==============
const SuccessCelebration = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    y: Math.random() * -150 - 50,
    emoji: ['🌱', '✨', '🌿', '💚', '🍀'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 text-xl"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, 1.5, 1],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
};

// ============== MAIN EMAIL SIGNUP COMPONENT ==============
const EmailSignup = ({
  variant = 'default', // 'default', 'hero', 'minimal', 'inline'
  source = 'landing_page',
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [subscriberCount, setSubscriberCount] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Fetch subscriber count on mount
  useEffect(() => {
    fetch(`${API_URL}/api/subscribers/count`)
      .then(res => res.json())
      .then(data => setSubscriberCount(data.count))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`${API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
        if (onSuccess) onSuccess(data);
        if (!data.alreadySubscribed && subscriberCount !== null) {
          setSubscriberCount(prev => prev + 1);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Unable to connect. Please try again.');
    }
  };

  // ============== HERO VARIANT ==============
  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="relative w-full max-w-lg mx-auto"
      >
        <AnimatePresence>
          {showCelebration && <SuccessCelebration />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-6 px-8 rounded-2xl bg-emerald-500/20 border border-emerald-500/40"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-4xl mb-3"
              >
                🌱
              </motion.div>
              <h3 className="text-xl font-bold text-emerald-400 mb-2">You're In!</h3>
              <p className="text-slate-300">{message}</p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="relative"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-5 py-4 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  {status === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-6 left-0 text-red-400 text-sm"
                    >
                      {message}
                    </motion.p>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <span>Get Early Access</span>
                      <span>→</span>
                    </>
                  )}
                </motion.button>
              </div>

              {subscriberCount > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-slate-400 text-sm mt-4"
                >
                  Join <span className="text-emerald-400 font-semibold">{subscriberCount.toLocaleString()}</span> wealth builders already on the waitlist
                </motion.p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // ============== MINIMAL VARIANT ==============
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative"
      >
        <AnimatePresence>
          {showCelebration && <SuccessCelebration />}
        </AnimatePresence>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-emerald-400"
          >
            <span>✓</span>
            <span>{message}</span>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-70"
            >
              {status === 'loading' ? '...' : 'Subscribe'}
            </button>
          </form>
        )}
      </motion.div>
    );
  }

  // ============== INLINE VARIANT ==============
  if (variant === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative"
      >
        <AnimatePresence>
          {showCelebration && <SuccessCelebration />}
        </AnimatePresence>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-center"
          >
            <span className="text-emerald-400 font-medium">✓ {message}</span>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for updates"
              className="flex-1 px-5 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-70"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-red-400 text-sm mt-2">{message}</p>
        )}
      </motion.div>
    );
  }

  // ============== DEFAULT FULL VARIANT ==============
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden"
    >
      <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50">
        <FloatingSeeds />
        <AnimatePresence>
          {showCelebration && <SuccessCelebration />}
        </AnimatePresence>

        {/* Background Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="text-center mb-8">
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block text-5xl mb-4"
            >
              📬
            </motion.span>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Stay Rooted in{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Financial Wisdom
              </span>
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Get exclusive insights on generational wealth, early access to new features,
              and tips that could change your family's financial future.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center"
                >
                  <span className="text-4xl">🌳</span>
                </motion.div>
                <h4 className="text-xl font-bold text-emerald-400 mb-2">Welcome to the Family!</h4>
                <p className="text-slate-300">{message}</p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="max-w-xl mx-auto"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name (optional)"
                      className="flex-1 px-5 py-4 bg-slate-900/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email *"
                      required
                      className="flex-1 px-5 py-4 bg-slate-900/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold text-lg text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {status === 'loading' ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Planting your seed...</span>
                      </>
                    ) : (
                      <>
                        <span>🌱</span>
                        <span>Join the Waitlist</span>
                      </>
                    )}
                  </motion.button>

                  {status === 'error' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm text-center"
                    >
                      {message}
                    </motion.p>
                  )}
                </div>

                <p className="text-slate-500 text-xs text-center mt-4">
                  No spam, ever. Unsubscribe anytime. Your data stays private.
                </p>

                {subscriberCount > 10 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-2 mt-6"
                  >
                    <div className="flex -space-x-2">
                      {['🧑', '👩', '👨', '👩‍🦰'].map((emoji, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-sm"
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <span className="text-slate-400 text-sm">
                      <span className="text-emerald-400 font-semibold">{subscriberCount.toLocaleString()}+</span> builders already joined
                    </span>
                  </motion.div>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default EmailSignup;
