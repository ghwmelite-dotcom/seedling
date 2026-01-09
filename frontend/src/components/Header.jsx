import React from 'react';

const Header = ({ apiConnected }) => {
  return (
    <header className="max-w-7xl mx-auto mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-seedling-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-seedling-500/30">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c-1.1 0-2-.9-2-2v-3H8c-1.1 0-2-.9-2-2v-1.5c0-.83.67-1.5 1.5-1.5H9v-2c0-2.21 1.79-4 4-4h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-1.1 0-2 .9-2 2v2h1.5c.83 0 1.5.67 1.5 1.5V15c0 1.1-.9 2-2 2h-2v3c0 1.1-.9 2-2 2z"/>
              <path d="M15 6c0-2.21-1.79-4-4-4S7 3.79 7 6c0 1.48.81 2.77 2 3.46V11h2V9.46c1.19-.69 2-1.98 2-3.46z" opacity="0.6"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Seedling
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Generational Wealth Time Machine
            </p>
          </div>
        </div>

        {!apiConnected && (
          <div className="glass-card px-4 py-2 text-amber-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            API offline - using local simulation
          </div>
        )}
      </div>

      <p className="text-slate-500 mt-6 max-w-2xl text-sm md:text-base leading-relaxed">
        Watch how your financial decisions today ripple through 3, 4, or 5 generations.
        See how a small habit change becomes your grandchild's opportunity—or how debt spirals across time.
      </p>
    </header>
  );
};

export default Header;
