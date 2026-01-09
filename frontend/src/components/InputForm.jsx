import React, { useState } from 'react';

const InputForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: 'You',
    age: 30,
    income: 55000,
    savings: 5000,
    debt: 25000,
    education: 'some_college',
    financial_literacy: 0.4,
    monthlyHabitChange: 100,
    generations: 4,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Your Current Situation</h3>
          <p className="text-slate-400 text-sm">Enter your financial details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-slate-400 text-sm mb-2">Your Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="18"
            max="65"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">Annual Income</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input
              type="number"
              name="income"
              value={formData.income}
              onChange={handleChange}
              min="0"
              step="1000"
              className="input-field pl-8"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">Current Savings</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input
              type="number"
              name="savings"
              value={formData.savings}
              onChange={handleChange}
              min="0"
              step="500"
              className="input-field pl-8"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">Current Debt</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input
              type="number"
              name="debt"
              value={formData.debt}
              onChange={handleChange}
              min="0"
              step="500"
              className="input-field pl-8"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">Education</label>
          <select
            name="education"
            value={formData.education}
            onChange={handleChange}
            className="input-field"
          >
            <option value="high_school">High School</option>
            <option value="some_college">Some College</option>
            <option value="bachelors">Bachelor's Degree</option>
            <option value="masters">Master's Degree</option>
            <option value="doctorate">Doctorate</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">
            Financial Literacy
            <span className="ml-2 text-seedling-400 font-medium">
              {(formData.financial_literacy * 100).toFixed(0)}%
            </span>
          </label>
          <input
            type="range"
            name="financial_literacy"
            value={formData.financial_literacy}
            onChange={handleChange}
            min="0.1"
            max="1"
            step="0.05"
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-seedling-500"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-sm mb-2">Generations to Simulate</label>
          <select
            name="generations"
            value={formData.generations}
            onChange={handleChange}
            className="input-field"
          >
            <option value="3">3 Generations</option>
            <option value="4">4 Generations</option>
            <option value="5">5 Generations</option>
          </select>
        </div>
      </div>

      {/* Scenario Section */}
      <div className="pt-6 border-t border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-seedling-500 to-emerald-600 flex items-center justify-center">
            <span className="text-xl">🌱</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-seedling-400">What If...</h4>
            <p className="text-slate-400 text-sm">See how a habit change impacts your family</p>
          </div>
        </div>

        <div className="bg-seedling-500/10 border border-seedling-500/30 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <label className="block text-slate-300 text-sm">
                Extra Monthly Savings
              </label>
              <p className="text-slate-500 text-xs mt-1">
                How much more could you save each month?
              </p>
            </div>
            <div className="text-3xl font-bold text-seedling-400">
              ${formData.monthlyHabitChange}
              <span className="text-lg text-slate-400 font-normal">/mo</span>
            </div>
          </div>

          <input
            type="range"
            name="monthlyHabitChange"
            value={formData.monthlyHabitChange}
            onChange={handleChange}
            min="0"
            max="500"
            step="25"
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-seedling-500"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>$0</span>
            <span>$125</span>
            <span>$250</span>
            <span>$375</span>
            <span>$500</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full mt-6 btn-primary flex items-center justify-center gap-3 text-lg
          ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Simulating Generations...
          </>
        ) : (
          <>
            <span className="text-2xl">🌳</span>
            Grow Your Family Tree
          </>
        )}
      </button>
    </form>
  );
};

export default InputForm;
