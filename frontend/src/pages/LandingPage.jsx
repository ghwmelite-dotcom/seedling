import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import EmailSignup from '../components/EmailSignup';
import { analytics, trackPageView } from '../hooks/useAnalytics';

// ============== ANIMATED TREE COMPONENT ==============
const GrowingTree = ({ progress = 1 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 600;
    const height = canvas.height = 700;

    const drawBranch = (x, y, length, angle, depth, maxDepth, growthProgress) => {
      if (depth > maxDepth || length < 4) return;

      const depthProgress = Math.max(0, Math.min(1, (growthProgress * maxDepth - (maxDepth - depth)) / 1));
      if (depthProgress <= 0) return;

      const endX = x + Math.cos(angle) * length * depthProgress;
      const endY = y + Math.sin(angle) * length * depthProgress;

      // Branch gradient based on depth
      const hue = 140 + depth * 5;
      const lightness = 25 + depth * 8;
      const alpha = 0.6 + (depth / maxDepth) * 0.4;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `hsla(${hue}, 70%, ${lightness}%, ${alpha})`;
      ctx.lineWidth = Math.max(1, (maxDepth - depth) * 2.5);
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glow effect for outer branches
      if (depth > maxDepth - 3) {
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw leaves at branch tips
      if (depth === maxDepth && depthProgress > 0.8) {
        const leafAlpha = (depthProgress - 0.8) * 5;
        ctx.beginPath();
        ctx.arc(endX, endY, 3 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${130 + Math.random() * 30}, 80%, 50%, ${leafAlpha})`;
        ctx.fill();
      }

      // Recursive branches
      const branchAngle = 0.4 + (depth * 0.05);
      const lengthFactor = 0.72 + Math.random() * 0.1;

      drawBranch(endX, endY, length * lengthFactor, angle - branchAngle, depth + 1, maxDepth, growthProgress);
      drawBranch(endX, endY, length * lengthFactor, angle + branchAngle, depth + 1, maxDepth, growthProgress);

      // Extra branch for fuller tree
      if (depth < maxDepth - 2 && Math.random() > 0.5) {
        drawBranch(endX, endY, length * 0.6, angle + (Math.random() - 0.5) * 0.8, depth + 2, maxDepth, growthProgress);
      }
    };

    // Clear and draw
    ctx.clearRect(0, 0, width, height);

    // Draw trunk
    const trunkHeight = 120 * progress;
    const gradient = ctx.createLinearGradient(width/2, height, width/2, height - trunkHeight);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#2d5a3d');

    ctx.beginPath();
    ctx.moveTo(width/2 - 15, height);
    ctx.lineTo(width/2 - 8, height - trunkHeight);
    ctx.lineTo(width/2 + 8, height - trunkHeight);
    ctx.lineTo(width/2 + 15, height);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw branches from trunk top
    if (progress > 0.2) {
      const branchProgress = (progress - 0.2) / 0.8;
      drawBranch(width/2, height - trunkHeight, 80, -Math.PI/2 - 0.2, 0, 8, branchProgress);
      drawBranch(width/2, height - trunkHeight, 80, -Math.PI/2 + 0.2, 0, 8, branchProgress);
      drawBranch(width/2, height - trunkHeight + 20, 60, -Math.PI/2, 0, 7, branchProgress * 0.9);
    }

  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none opacity-90"
      style={{ width: '600px', height: '700px' }}
    />
  );
};

// ============== FLOATING PARTICLES ==============
const FloatingParticles = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 15 + Math.random() * 20,
    delay: Math.random() * 10,
    type: Math.random() > 0.7 ? 'gold' : 'green'
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${
            p.type === 'gold'
              ? 'bg-amber-400/40'
              : 'bg-emerald-400/30'
          }`}
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            boxShadow: p.type === 'gold'
              ? '0 0 10px rgba(251, 191, 36, 0.5)'
              : '0 0 10px rgba(52, 211, 153, 0.4)'
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.sin(p.id) * 30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// ============== COMPOUND GROWTH CALCULATOR ==============
const InteractiveDemo = () => {
  const [monthly, setMonthly] = useState(100);
  const [years, setYears] = useState(30);
  const [hasInteracted, setHasInteracted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleInteraction = (type, value) => {
    if (!hasInteracted) {
      analytics.demoInteraction('first_interaction');
      setHasInteracted(true);
    }
    analytics.demoInteraction(`${type}_change`);
  };

  const calculate = (amount, yrs, rate = 0.07) => {
    const monthlyRate = rate / 12;
    const months = yrs * 12;
    return amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  };

  const gen1 = calculate(monthly, years);
  const gen2 = gen1 * Math.pow(1.07, 30);
  const gen3 = gen2 * Math.pow(1.07, 30);

  const formatMoney = (n) => {
    if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n/1000).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="glass-panel p-8 md:p-12 rounded-3xl">
        <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-8 text-center">
          See Your Impact in Real-Time
        </h3>

        {/* Sliders */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <label className="block text-emerald-300 mb-3 font-medium">
              Monthly Investment
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={monthly}
              onChange={(e) => {
                setMonthly(Number(e.target.value));
                handleInteraction('monthly', e.target.value);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="text-3xl font-bold text-white mt-2">${monthly}/mo</div>
          </div>

          <div>
            <label className="block text-emerald-300 mb-3 font-medium">
              Investment Period
            </label>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={years}
              onChange={(e) => {
                setYears(Number(e.target.value));
                handleInteraction('years', e.target.value);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="text-3xl font-bold text-white mt-2">{years} years</div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {[
            { label: 'Your Retirement', value: gen1, gen: '1st Gen', color: 'emerald' },
            { label: 'Your Children', value: gen2, gen: '2nd Gen', color: 'teal' },
            { label: 'Your Grandchildren', value: gen3, gen: '3rd Gen', color: 'amber' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
              className="text-center"
            >
              <div className={`text-xs md:text-sm uppercase tracking-wider text-${item.color}-400 mb-1`}>
                {item.gen}
              </div>
              <motion.div
                key={item.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={`text-2xl md:text-4xl font-bold text-${item.color}-400`}
              >
                {formatMoney(item.value)}
              </motion.div>
              <div className="text-slate-400 text-xs md:text-sm mt-1">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Insight */}
        <motion.div
          className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <p className="text-emerald-300">
            <span className="font-bold text-white">${monthly}/month</span> could become{' '}
            <span className="font-bold text-amber-400">{formatMoney(gen3)}</span> for your grandchildren
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============== FEATURE CARD ==============
const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group"
    >
      <div className="h-full p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
          <span className="text-3xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
          {title}
        </h3>
        <p className="text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

// ============== STEP COMPONENT ==============
const Step = ({ number, title, description, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="flex gap-6"
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30">
          {number}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
};

// ============== STAT COUNTER ==============
const StatCounter = ({ value, suffix, label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-slate-400">{label}</div>
    </div>
  );
};

// ============== MAIN LANDING PAGE ==============
const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const treeProgress = useTransform(scrollYProgress, [0, 0.3], [0.3, 1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const [treeGrowth, setTreeGrowth] = useState(0.3);
  const [scrollDepthTracked, setScrollDepthTracked] = useState({ 25: false, 50: false, 75: false, 100: false });

  // Track page view on mount
  useEffect(() => {
    trackPageView('/landing');
  }, []);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      [25, 50, 75, 100].forEach(depth => {
        if (scrollPercent >= depth && !scrollDepthTracked[depth]) {
          analytics.scrollDepth(depth);
          setScrollDepthTracked(prev => ({ ...prev, [depth]: true }));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDepthTracked]);

  useEffect(() => {
    return treeProgress.on("change", (v) => setTreeGrowth(v));
  }, [treeProgress]);

  // Track CTA clicks
  const handleCtaClick = (ctaName) => {
    analytics.ctaClick(ctaName);
  };

  const features = [
    {
      icon: '🌳',
      title: 'Interactive Family Tree',
      description: 'Watch your financial legacy grow with beautiful visualizations. See branches thicken as wealth compounds across generations.'
    },
    {
      icon: '⏱️',
      title: 'Timeline Scrubber',
      description: 'Travel through time year-by-year. Watch milestones unfold and see exactly when your family reaches financial freedom.'
    },
    {
      icon: '🤖',
      title: 'AI Financial Coach',
      description: 'Get personalized advice powered by AI. Ask questions about investing, real estate, education ROI, and legacy planning.'
    },
    {
      icon: '📊',
      title: 'Wealth Analytics',
      description: 'Deep dive into your data with interactive charts. Track wealth distribution, growth rates, and generational comparisons.'
    },
    {
      icon: '📚',
      title: 'Scenario Library',
      description: '12 pre-built "what-if" scenarios to explore. From coffee shop habits to real estate investments—see every possibility.'
    },
    {
      icon: '🏆',
      title: 'Achievement System',
      description: 'Unlock badges and track your progress. Celebrate milestones and stay motivated on your wealth-building journey.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white overflow-x-hidden">
      {/* Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        .font-display { font-family: 'Playfair Display', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }

        .glass-panel {
          background: linear-gradient(135deg, rgba(15, 25, 20, 0.9) 0%, rgba(10, 15, 13, 0.95) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(52, 211, 153, 0.1);
        }

        .text-gradient {
          background: linear-gradient(135deg, #34d399 0%, #fbbf24 50%, #34d399 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 5s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }

        .glow-green {
          box-shadow: 0 0 60px rgba(52, 211, 153, 0.3), 0 0 100px rgba(52, 211, 153, 0.1);
        }

        .mesh-gradient {
          background:
            radial-gradient(ellipse at 20% 20%, rgba(52, 211, 153, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(20, 184, 166, 0.1) 0%, transparent 70%);
        }

        .noise-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
        }
      `}</style>

      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* ============== HERO SECTION ============== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 mesh-gradient" />
        <FloatingParticles />

        {/* Animated Tree */}
        <div className="absolute inset-0 flex items-end justify-center">
          <GrowingTree progress={treeGrowth} />
        </div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-8">
              🌱 The Future of Financial Planning
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            Plant Today,{' '}
            <span className="text-gradient">Harvest</span>
            <br />
            for Generations
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-body text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto"
          >
            Visualize how your financial decisions today ripple through generations.
            Watch your family tree grow—or wither—based on the seeds you plant now.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/app"
              onClick={() => handleCtaClick('hero_start_growing')}
              className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105"
            >
              <span className="relative z-10">Start Growing Your Legacy</span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
            <a
              href="#demo"
              onClick={() => handleCtaClick('hero_see_demo')}
              className="px-8 py-4 border border-slate-600 hover:border-emerald-500/50 rounded-xl font-semibold text-lg transition-all duration-300 hover:bg-emerald-500/10"
            >
              See It In Action
            </a>
          </motion.div>

          {/* Hero Email Signup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-12"
          >
            <p className="text-slate-400 text-sm mb-4 text-center">
              Or get notified when we launch new features
            </p>
            <EmailSignup variant="hero" source="hero_section" />
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 bg-emerald-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ============== PROBLEM SECTION ============== */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">The Problem</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
                70% of Wealthy Families{' '}
                <span className="text-red-400">Lose Everything</span>{' '}
                by the Third Generation
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                It's called "shirtsleeves to shirtsleeves in three generations." Without
                a clear vision of how wealth compounds—or erodes—families repeat the same
                mistakes generation after generation.
              </p>
              <p className="text-slate-400 text-lg leading-relaxed">
                The problem isn't lack of money. It's lack of <span className="text-white font-semibold">visibility</span>.
                When you can't see the future impact of today's decisions, you can't make
                better choices.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: 70, label: 'Wealth lost by 2nd gen', color: 'red' },
                { value: 90, label: 'Wealth lost by 3rd gen', color: 'red' },
                { value: 78, label: 'Lack financial plan', color: 'amber' },
                { value: 64, label: 'No wealth education', color: 'amber' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50"
                >
                  <div className={`text-4xl font-bold text-${stat.color}-400 mb-2`}>
                    {stat.value}%
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============== SOLUTION SECTION ============== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />

        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">The Solution</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4 mb-6">
              See Your Legacy{' '}
              <span className="text-gradient">Before You Build It</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Seedling transforms abstract financial concepts into a living, breathing
              family tree. Watch branches grow thick with prosperity—or wither from neglect.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <StatCounter value={4} suffix="+" label="Generations Simulated" />
            <StatCounter value={50} suffix="yr" label="Financial Projections" />
            <StatCounter value={12} suffix="+" label="What-If Scenarios" />
            <StatCounter value={100} suffix="%" label="Free to Use" />
          </div>
        </div>
      </section>

      {/* ============== INTERACTIVE DEMO ============== */}
      <section id="demo" className="relative py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Try It Now</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
              The Power of{' '}
              <span className="text-gradient">Compound Growth</span>
            </h2>
          </motion.div>

          <InteractiveDemo />
        </div>
      </section>

      {/* ============== FEATURES SECTION ============== */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
              Everything You Need to{' '}
              <span className="text-gradient">Plan Your Legacy</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30" />

        <div className="relative max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">How It Works</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
              Three Steps to{' '}
              <span className="text-gradient">Your Future</span>
            </h2>
          </motion.div>

          <div className="space-y-12">
            <Step
              number="1"
              title="Enter Your Starting Point"
              description="Tell us about your current financial situation—income, savings, debt, and age. No judgment, just data."
              delay={0}
            />
            <Step
              number="2"
              title="Set Your Monthly Commitment"
              description="Choose how much you can invest each month. Even $50 can become transformative over generations."
              delay={0.2}
            />
            <Step
              number="3"
              title="Watch Your Tree Grow"
              description="See your family tree come alive. Explore different scenarios, learn from the AI coach, and plan your legacy."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* ============== EMAIL SIGNUP SECTION ============== */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <EmailSignup variant="default" source="main_signup" />
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-panel p-12 md:p-16 rounded-3xl glow-green"
          >
            <span className="text-6xl mb-6 block">🌱</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Your Legacy Starts with a{' '}
              <span className="text-gradient">Single Seed</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Small seeds grow mighty trees. Every dollar you invest today is a gift
              to generations you'll never meet. Start planting now.
            </p>

            <a
              href="/app"
              onClick={() => handleCtaClick('bottom_plant_seed')}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold text-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105"
            >
              <span>Plant Your First Seed</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>

            <p className="text-slate-500 text-sm mt-6">
              Free forever. No credit card required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="relative py-16 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          {/* Footer Newsletter */}
          <div className="grid md:grid-cols-2 gap-12 mb-12 pb-12 border-b border-slate-800/50">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🌱</span>
                <span className="font-display text-2xl font-bold">Seedling</span>
              </div>
              <p className="text-slate-400 mb-4 max-w-md">
                The generational wealth time machine. Visualize how your financial decisions
                today ripple through generations.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com/ghwmelite-dotcom/seedling" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
              <p className="text-slate-400 text-sm mb-4">
                Get the latest wealth-building insights and feature updates.
              </p>
              <EmailSignup variant="minimal" source="footer" />
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Seedling. Built with 💚 for first-generation wealth builders.
            </p>

            <div className="flex gap-6">
              <a href="/app" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                Launch App
              </a>
              <a href="#demo" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                Try Demo
              </a>
              <a href="https://github.com/ghwmelite-dotcom/seedling" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
