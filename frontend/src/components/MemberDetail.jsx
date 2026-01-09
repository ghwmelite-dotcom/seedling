import React from 'react';
import { formatCurrency, healthColors, educationLabels } from '../utils/format';

const MemberDetail = ({ member, onClose }) => {
  if (!member) return null;

  const colors = healthColors[member.financialHealth] || healthColors.stable;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-800 border-l border-slate-700 p-6 overflow-y-auto z-50 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{member.ownsHome ? '🏠' : '👤'}</div>
          <h3 className="text-2xl font-bold text-white">{member.name}</h3>
          <p className="text-slate-400 mt-1">
            Generation {member.generation + 1} &bull; Age {member.currentAge}
          </p>
          <div
            className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mt-3 ${colors.bg} ${colors.text} ${colors.border} border`}
          >
            {member.financialHealth.charAt(0).toUpperCase() + member.financialHealth.slice(1)}
          </div>
        </div>

        {/* Net Worth */}
        <div className="bg-slate-900/50 rounded-xl p-5 mb-6 text-center">
          <div className="text-slate-400 text-sm">Net Worth</div>
          <div className="text-4xl font-bold text-white mt-1">
            {formatCurrency(member.netWorth)}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Annual Income</div>
            <div className="text-xl font-semibold text-white mt-1">
              {formatCurrency(member.income)}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Savings</div>
            <div className="text-xl font-semibold text-seedling-400 mt-1">
              {formatCurrency(member.savings)}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Investments</div>
            <div className="text-xl font-semibold text-blue-400 mt-1">
              {formatCurrency(member.investments)}
            </div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="text-slate-400 text-xs">Debt</div>
            <div className="text-xl font-semibold text-red-400 mt-1">
              {formatCurrency(member.debt)}
            </div>
          </div>
        </div>

        {/* Home Equity */}
        {member.homeEquity > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏠</span>
              <div>
                <div className="text-purple-400 text-xs">Home Equity</div>
                <div className="text-xl font-semibold text-purple-400">
                  {formatCurrency(member.homeEquity)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inheritance */}
        {member.inheritanceReceived > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎁</span>
              <div>
                <div className="text-amber-400 text-xs">Inheritance Received</div>
                <div className="text-xl font-semibold text-amber-400">
                  {formatCurrency(member.inheritanceReceived)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Children */}
        {member.children && member.children.length > 0 && (
          <div>
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>👨‍👩‍👧‍👦</span>
              Children ({member.children.length})
            </h4>
            <div className="space-y-2">
              {member.children.map((child) => {
                const childColors = healthColors[child.financialHealth] || healthColors.stable;
                return (
                  <div
                    key={child.id}
                    className="bg-slate-900/50 rounded-xl p-3 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      <span>{child.ownsHome ? '🏠' : '👤'}</span>
                      <span className="text-white">{child.name}</span>
                    </div>
                    <span className={`font-medium ${childColors.text}`}>
                      {formatCurrency(child.netWorth)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MemberDetail;
