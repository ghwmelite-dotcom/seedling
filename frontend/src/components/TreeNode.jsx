import React, { useState, useEffect } from 'react';
import { formatCurrency, healthColors } from '../utils/format';
import Particles, { LeafParticles, CoinParticles, FireworkParticles, ConfettiParticles } from './Particles';

const TreeNode = ({ member, onClick, selected, animationDelay = 0 }) => {
  const [showParticles, setShowParticles] = useState(false);
  const colors = healthColors[member.financialHealth] || healthColors.stable;

  // Trigger particles after the node animation starts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowParticles(true);
    }, animationDelay + 150); // Trigger slightly after node appears

    // Reset particles after they finish
    const resetTimer = setTimeout(() => {
      setShowParticles(false);
    }, animationDelay + 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(resetTimer);
    };
  }, [animationDelay]);

  const getEmoji = () => {
    if (member.generation === 0) return '👤';
    if (member.ownsHome) return '🏠';
    if (member.financialHealth === 'thriving') return '🌟';
    if (member.financialHealth === 'distressed') return '⚠️';
    return '👤';
  };

  // Determine particle type based on financial health
  const getParticleColor = () => {
    if (member.financialHealth === 'thriving') return '#22c55e';
    if (member.financialHealth === 'growing') return '#4ade80';
    if (member.financialHealth === 'distressed') return '#f87171';
    return '#60a5fa';
  };

  // Check if this is a "milestone" member (very wealthy or first gen thriving)
  const isMilestone = member.netWorth > 1000000 || (member.generation === 0 && member.financialHealth === 'thriving');

  return (
    <div
      className={`tree-node relative rounded-xl p-4 border-2 backdrop-blur-sm
        ${colors.bg} ${colors.border}
        ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}
        hover:shadow-lg ${colors.glow}
        min-w-[140px]
        animate-node-pop`}
      onClick={() => onClick(member)}
      style={{
        opacity: 0,
        animationDelay: `${animationDelay}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {/* DRAMATIC Particle effects based on financial health */}
      {member.financialHealth === 'thriving' ? (
        <>
          <Particles active={showParticles} color={getParticleColor()} count={24} duration={1400} />
          <LeafParticles active={showParticles} count={12} />
          {isMilestone && <FireworkParticles active={showParticles} color="#fbbf24" />}
        </>
      ) : member.financialHealth === 'growing' ? (
        <>
          <Particles active={showParticles} color={getParticleColor()} count={18} duration={1200} />
          <LeafParticles active={showParticles} count={6} />
        </>
      ) : member.financialHealth === 'distressed' ? (
        <Particles active={showParticles} color={getParticleColor()} count={10} duration={1000} />
      ) : (
        <Particles active={showParticles} color={getParticleColor()} count={14} duration={1100} />
      )}

      {/* Coin particles for wealthy members - more dramatic */}
      {member.netWorth > 300000 && (
        <CoinParticles active={showParticles} count={member.netWorth > 750000 ? 14 : 8} />
      )}

      {/* Confetti celebration for millionaires */}
      {member.netWorth > 1000000 && (
        <ConfettiParticles active={showParticles} count={40} />
      )}

      <div className="text-center">
        <div
          className="text-3xl mb-2"
          style={{
            animation: `float 3s ease-in-out infinite`,
            animationDelay: `${member.generation * 200 + animationDelay}ms`
          }}
        >
          {getEmoji()}
        </div>
        <div className="text-white font-semibold text-sm truncate max-w-[120px]">
          {member.name}
        </div>
        <div className={`text-xs ${colors.text} font-medium`}>
          Gen {member.generation + 1}
        </div>
        <div className="text-white font-bold text-lg mt-2">
          {formatCurrency(member.netWorth)}
        </div>
        <div className="text-slate-400 text-xs">
          Age {member.currentAge}
        </div>
      </div>

      {/* Health indicator dot with pulse animation */}
      <div
        className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 rounded-full"
        style={{
          width: `${Math.max(8, member.branchThickness * 16)}px`,
          height: `${Math.max(8, member.branchThickness * 16)}px`,
          backgroundColor: member.branchColor,
          boxShadow: `0 0 10px ${member.branchColor}`,
          animation: `pulseGlow 2s ease-in-out infinite`,
          animationDelay: `${animationDelay + 500}ms`,
          color: member.branchColor,
        }}
      />
    </div>
  );
};

export default TreeNode;
