import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { currencies, getCurrency } from '../utils/format';

const CurrencySelector = ({ compact = false }) => {
  const { currency, setCurrency } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const currentCurrency = getCurrency(currency);

  // Filter currencies based on search
  const filteredCurrencies = Object.values(currencies).filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (code) => {
    setCurrency(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Compact version for header/navbar
  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:border-seedling-500/50 transition-all"
        >
          <span className="text-lg">{currentCurrency.flag}</span>
          <span className="text-sm font-medium text-white">{currentCurrency.code}</span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
            >
              {/* Search Input */}
              <div className="p-2 border-b border-slate-700/50">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search currency..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-seedling-500/50"
                  />
                </div>
              </div>

              {/* Currency List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCurrencies.map((c) => (
                  <motion.button
                    key={c.code}
                    whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                    onClick={() => handleSelect(c.code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      currency === c.code
                        ? 'bg-seedling-500/20 border-l-2 border-seedling-500'
                        : 'border-l-2 border-transparent'
                    }`}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{c.code}</span>
                        <span className="text-seedling-400 text-lg">{c.symbol}</span>
                      </div>
                      <span className="text-xs text-slate-400 truncate block">{c.name}</span>
                    </div>
                    {currency === c.code && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 text-seedling-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    )}
                  </motion.button>
                ))}

                {filteredCurrencies.length === 0 && (
                  <div className="px-4 py-8 text-center text-slate-500">
                    <span className="text-2xl block mb-2">🔍</span>
                    No currencies found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full version for settings panel
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Currency</h3>
          <p className="text-sm text-slate-400">Select your preferred currency for displaying values</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-seedling-500/10 border border-seedling-500/30">
          <span className="text-2xl">{currentCurrency.flag}</span>
          <div>
            <span className="font-bold text-white">{currentCurrency.code}</span>
            <span className="text-seedling-400 ml-2 text-lg">{currentCurrency.symbol}</span>
          </div>
        </div>
      </div>

      {/* Currency Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Object.values(currencies).map((c) => (
          <motion.button
            key={c.code}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrency(c.code)}
            className={`relative p-4 rounded-xl border transition-all ${
              currency === c.code
                ? 'bg-seedling-500/20 border-seedling-500 shadow-lg shadow-seedling-500/20'
                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
            }`}
          >
            {/* Selected indicator */}
            {currency === c.code && (
              <motion.div
                layoutId="selectedCurrency"
                className="absolute inset-0 rounded-xl border-2 border-seedling-500"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            <div className="relative z-10 text-center">
              <span className="text-3xl block mb-2">{c.flag}</span>
              <div className="flex items-center justify-center gap-1">
                <span className="font-bold text-white">{c.code}</span>
                <span className="text-seedling-400">{c.symbol}</span>
              </div>
              <span className="text-xs text-slate-400 block mt-1 truncate">{c.name}</span>
            </div>

            {/* Checkmark */}
            {currency === c.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-seedling-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-xl bg-gradient-to-r from-seedling-500/10 to-teal-500/10 border border-seedling-500/20"
      >
        <p className="text-sm text-slate-400 mb-2">Preview</p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-center">
            <span className="text-xs text-slate-500">Small</span>
            <p className="text-lg font-bold text-white">{currentCurrency.symbol}1,234</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-slate-500">Thousands</span>
            <p className="text-lg font-bold text-seedling-400">{currentCurrency.symbol}45K</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-slate-500">Millions</span>
            <p className="text-lg font-bold text-amber-400">{currentCurrency.symbol}2.5M</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-slate-500">Billions</span>
            <p className="text-lg font-bold text-violet-400">{currentCurrency.symbol}1.8B</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CurrencySelector;
