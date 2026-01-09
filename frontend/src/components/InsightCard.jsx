import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/format';
import useStore from '../store/useStore';

const InsightCard = ({ difference, monthlyHabitChange }) => {
  const { currency } = useStore();
  const [isVisible, setIsVisible] = useState(false);
  const [showTree, setShowTree] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setShowTree(true), 400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [difference]);

  return (
    <div
      className={`glass-card p-8 text-center glow-green transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Animated growing tree */}
      <div className="relative inline-block mb-4">
        <div
          className="text-6xl transition-all duration-1000"
          style={{
            transform: showTree ? 'scale(1) rotate(0deg)' : 'scale(0.3) rotate(-10deg)',
            opacity: showTree ? 1 : 0,
            animation: showTree ? 'float 3s ease-in-out infinite' : 'none',
          }}
        >
          🌳
        </div>
        {/* Sparkle effects */}
        {showTree && (
          <>
            <span
              className="absolute -top-2 -right-2 text-xl"
              style={{
                animation: 'nodePop 0.5s ease-out forwards',
                animationDelay: '600ms',
                opacity: 0,
              }}
            >
              ✨
            </span>
            <span
              className="absolute -top-1 -left-3 text-lg"
              style={{
                animation: 'nodePop 0.5s ease-out forwards',
                animationDelay: '800ms',
                opacity: 0,
              }}
            >
              ✨
            </span>
            <span
              className="absolute top-8 -right-4 text-sm"
              style={{
                animation: 'nodePop 0.5s ease-out forwards',
                animationDelay: '1000ms',
                opacity: 0,
              }}
            >
              💫
            </span>
          </>
        )}
      </div>

      <h3
        className={`text-2xl font-bold text-white mb-3 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        Small Seeds, Mighty Trees
      </h3>

      <p
        className={`text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '300ms' }}
      >
        Your{' '}
        <span className="text-seedling-400 font-semibold">
          ${monthlyHabitChange}/month
        </span>{' '}
        habit change today creates{' '}
        <span
          className="text-seedling-400 font-bold text-xl inline-block"
          style={{
            animation: isVisible ? 'nodePop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
            animationDelay: '500ms',
          }}
        >
          {formatCurrency(difference, currency)}
        </span>{' '}
        more wealth for your family tree.
      </p>

      <p
        className={`text-slate-400 mt-4 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ transitionDelay: '400ms' }}
      >
        That's the power of compound choices across generations.
      </p>

      {/* Growing root lines decoration */}
      <div className="flex justify-center mt-6 gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 bg-gradient-to-b from-seedling-500/60 to-transparent rounded-full transition-all duration-700"
            style={{
              height: isVisible ? `${20 + i * 8}px` : '0px',
              transitionDelay: `${600 + i * 100}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default InsightCard;
