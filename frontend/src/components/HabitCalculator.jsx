import React, { useState } from 'react';
import { formatCurrency, getCurrency } from '../utils/format';
import { useHabitCalculator } from '../hooks/useApi';
import useStore from '../store/useStore';

const HabitCalculator = () => {
  const [amount, setAmount] = useState(100);
  const result = useHabitCalculator(amount);
  const { currency } = useStore();
  const currencyConfig = getCurrency(currency);

  if (!result) return null;

  return (
    <div className="glass-card p-6 glow-green animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <span className="text-xl">💰</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Quick Impact Calculator</h3>
          <p className="text-slate-400 text-sm">See how small amounts compound over time</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-slate-300 text-sm">Monthly Amount</label>
          <span className="text-2xl font-bold text-seedling-400">{currencyConfig.symbol}{amount}</span>
        </div>
        <input
          type="range"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          min="25"
          max="500"
          step="25"
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-seedling-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{currencyConfig.symbol}25</span>
          <span>{currencyConfig.symbol}250</span>
          <span>{currencyConfig.symbol}500</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-slate-700/50 hover:border-blue-500/30 transition-colors">
          <div className="text-slate-400 text-xs mb-1">Your Retirement</div>
          <div className="text-xl md:text-2xl font-bold text-blue-400">
            {formatCurrency(result.futureValue, currency)}
          </div>
          <div className="text-slate-500 text-xs mt-1">30 years</div>
        </div>

        <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-slate-700/50 hover:border-seedling-500/30 transition-colors">
          <div className="text-slate-400 text-xs mb-1">Your Children</div>
          <div className="text-xl md:text-2xl font-bold text-seedling-400">
            {formatCurrency(result.gen2, currency)}
          </div>
          <div className="text-slate-500 text-xs mt-1">60 years</div>
        </div>

        <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
          <div className="text-slate-400 text-xs mb-1">Grandchildren</div>
          <div className="text-xl md:text-2xl font-bold text-emerald-400">
            {formatCurrency(result.gen3, currency)}
          </div>
          <div className="text-slate-500 text-xs mt-1">90 years</div>
        </div>
      </div>

      <div className="mt-4 text-center text-slate-400 text-sm">
        Total contributed: <span className="text-white">{formatCurrency(result.totalContributed, currency)}</span>
        {' '}&bull;{' '}
        Interest earned: <span className="text-seedling-400">{formatCurrency(result.interestEarned, currency)}</span>
      </div>
    </div>
  );
};

export default HabitCalculator;
