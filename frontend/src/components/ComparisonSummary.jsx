import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/format';

const ComparisonSummary = ({ summary }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (summary) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [summary]);

  if (!summary) return null;

  const diff = summary.difference;
  const isPositive = diff.totalNetWorth > 0;

  return (
    <div className={`glass-card p-6 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"
          style={{
            animation: isVisible ? 'nodePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
          }}
        >
          <span className="text-xl">📊</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Impact Analysis</h3>
          <p className="text-slate-400 text-sm">Compare wealth across scenarios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Difference */}
        <div
          className={`rounded-xl p-5 border transition-all duration-500 ${
            isPositive
              ? 'bg-seedling-500/10 border-seedling-500/30'
              : 'bg-red-500/10 border-red-500/30'
          } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="text-slate-400 text-sm">Family Wealth Difference</div>
          <div
            className={`text-3xl font-bold mt-1 ${
              isPositive ? 'text-seedling-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {formatCurrency(diff.totalNetWorth)}
          </div>
          <div
            className={`text-sm mt-1 ${isPositive ? 'text-seedling-400/70' : 'text-red-400/70'}`}
          >
            {isPositive ? '+' : ''}
            {diff.percentChange.toFixed(1)}% across all generations
          </div>
        </div>

        {/* Baseline Total */}
        <div
          className={`rounded-xl p-5 bg-blue-500/10 border border-blue-500/30 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="text-slate-400 text-sm">Baseline Family Wealth</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {formatCurrency(summary.baseline.totalNetWorth)}
          </div>
          <div className="text-slate-400 text-sm mt-1">
            {summary.baseline.totalMembers} family members
          </div>
        </div>

        {/* Scenario Total */}
        <div
          className={`rounded-xl p-5 bg-seedling-500/10 border border-seedling-500/30 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="text-slate-400 text-sm">Scenario Family Wealth</div>
          <div className="text-2xl font-bold text-seedling-400 mt-1">
            {formatCurrency(summary.scenario.totalNetWorth)}
          </div>
          <div className="text-slate-400 text-sm mt-1">
            {summary.scenario.totalMembers} family members
          </div>
        </div>
      </div>

      {/* Generation Breakdown */}
      <div
        className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionDelay: '400ms' }}
      >
        <h4 className="text-white font-semibold mb-3">Breakdown by Generation</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-3 px-2">Generation</th>
                <th className="text-right py-3 px-2">Baseline Avg</th>
                <th className="text-right py-3 px-2">Scenario Avg</th>
                <th className="text-right py-3 px-2">Difference</th>
              </tr>
            </thead>
            <tbody>
              {summary.baseline.byGeneration.map((baseGen, idx) => {
                const scenGen = summary.scenario.byGeneration[idx] || { avgNetWorth: 0 };
                const genDiff = scenGen.avgNetWorth - baseGen.avgNetWorth;
                const isGenPositive = genDiff >= 0;

                return (
                  <tr
                    key={idx}
                    className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-all duration-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                    style={{ transitionDelay: `${500 + idx * 100}ms` }}
                  >
                    <td className="py-3 px-2">
                      <span className="text-white font-medium">Gen {idx + 1}</span>
                      <span className="text-slate-500 text-xs ml-2">
                        ({baseGen.count} {baseGen.count === 1 ? 'member' : 'members'})
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-blue-400 font-medium">
                      {formatCurrency(baseGen.avgNetWorth)}
                    </td>
                    <td className="py-3 px-2 text-right text-seedling-400 font-medium">
                      {formatCurrency(scenGen.avgNetWorth)}
                    </td>
                    <td
                      className={`py-3 px-2 text-right font-medium ${
                        isGenPositive ? 'text-seedling-400' : 'text-red-400'
                      }`}
                    >
                      {isGenPositive ? '+' : ''}
                      {formatCurrency(genDiff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSummary;
