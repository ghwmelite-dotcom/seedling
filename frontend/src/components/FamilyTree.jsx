import React, { useMemo, useState, useEffect } from 'react';
import TreeNode from './TreeNode';
import { formatCurrency } from '../utils/format';

const FamilyTree = ({ root, title, isScenario, onSelectMember, selectedMember }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation on mount or when root changes
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [root]);

  if (!root) return null;

  // Flatten tree by generation for display
  const generations = useMemo(() => {
    const gens = [];
    const traverse = (node, gen) => {
      if (!gens[gen]) gens[gen] = [];
      gens[gen].push(node);
      (node.children || []).forEach((child) => traverse(child, gen + 1));
    };
    traverse(root, 0);
    return gens;
  }, [root]);

  // Calculate total wealth
  const totalWealth = useMemo(() => {
    let total = 0;
    const traverse = (node) => {
      total += node.netWorth;
      (node.children || []).forEach(traverse);
    };
    traverse(root);
    return total;
  }, [root]);

  // Calculate animation delay for each node
  const getAnimationDelay = (genIndex, memberIndex) => {
    // Base delay per generation (stagger generations)
    const genDelay = genIndex * 400;
    // Additional delay per member within generation
    const memberDelay = memberIndex * 100;
    // Scenario trees start slightly later
    const scenarioOffset = isScenario ? 150 : 0;
    return genDelay + memberDelay + scenarioOffset;
  };

  return (
    <div className={`glass-card p-5 h-full transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center justify-between mb-5">
        <h3
          className={`text-lg font-semibold flex items-center gap-2
          ${isScenario ? 'text-seedling-400' : 'text-blue-400'}`}
        >
          <span
            className="text-2xl"
            style={{
              animation: isVisible ? 'nodePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
            }}
          >
            {isScenario ? '🌱' : '📊'}
          </span>
          {title}
        </h3>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-700
          ${isScenario ? 'bg-seedling-500/20 text-seedling-400' : 'bg-blue-500/20 text-blue-400'}
          ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
          style={{ transitionDelay: `${generations.length * 300}ms` }}
        >
          {formatCurrency(totalWealth)}
        </div>
      </div>

      <div className="space-y-6 overflow-x-auto pb-4">
        {generations.map((gen, genIndex) => (
          <div key={genIndex} className="relative">
            {/* Generation label with fade-in */}
            <div
              className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-center transition-opacity duration-500"
              style={{
                opacity: isVisible ? 1 : 0,
                transitionDelay: `${genIndex * 300}ms`
              }}
            >
              <span className="text-slate-500 text-xs font-medium whitespace-nowrap">
                Gen {genIndex + 1}
              </span>
            </div>

            {/* Members row */}
            <div className="flex flex-wrap justify-center gap-3 pl-6">
              {gen.map((member, memberIndex) => (
                <TreeNode
                  key={member.id}
                  member={member}
                  onClick={onSelectMember}
                  selected={selectedMember?.id === member.id}
                  animationDelay={isVisible ? getAnimationDelay(genIndex, memberIndex) : 0}
                />
              ))}
            </div>

            {/* Animated connection line to next generation */}
            {genIndex < generations.length - 1 && (
              <div className="flex justify-center mt-4">
                <div
                  className={`w-0.5 rounded-full transition-all duration-500 ${
                    isScenario
                      ? 'bg-gradient-to-b from-seedling-500/70 via-seedling-500/40 to-transparent'
                      : 'bg-gradient-to-b from-blue-500/70 via-blue-500/40 to-transparent'
                  }`}
                  style={{
                    height: isVisible ? '24px' : '0px',
                    opacity: isVisible ? 1 : 0,
                    transitionDelay: `${(genIndex + 1) * 350}ms`,
                    boxShadow: isScenario
                      ? '0 0 8px rgba(34, 197, 94, 0.4)'
                      : '0 0 8px rgba(59, 130, 246, 0.4)',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Growing vines decoration */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all duration-1000 ${
          isScenario
            ? 'bg-gradient-to-r from-transparent via-seedling-500/30 to-transparent'
            : 'bg-gradient-to-r from-transparent via-blue-500/30 to-transparent'
        }`}
        style={{
          transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
          transitionDelay: `${generations.length * 400}ms`,
        }}
      />
    </div>
  );
};

export default FamilyTree;
