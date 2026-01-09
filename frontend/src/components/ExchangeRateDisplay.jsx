import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { currencies, getCurrency, formatCurrencyFull } from '../utils/format';
import { getAllRates, formatExchangeRate } from '../utils/exchangeRates';

const ExchangeRateDisplay = ({ compact = false }) => {
  const {
    currency,
    exchangeRates,
    exchangeRatesLoading,
    exchangeRatesLastUpdated,
    showConvertedValues,
    convertToCurrency,
    setShowConvertedValues,
    setConvertToCurrency,
    loadExchangeRates,
  } = useStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const currentCurrency = getCurrency(currency);
  const rates = getAllRates(currency, exchangeRates);

  // Load exchange rates on mount
  useEffect(() => {
    loadExchangeRates();
  }, [loadExchangeRates]);

  // Format last updated time
  const getLastUpdatedText = () => {
    if (!exchangeRatesLastUpdated) return 'Never';
    const diff = Date.now() - exchangeRatesLastUpdated;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Over a day ago';
  };

  // Compact widget for header/sidebar
  if (compact) {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:border-amber-500/50 transition-all"
        >
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="text-sm font-medium text-white">Rates</span>
          {exchangeRatesLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full"
            />
          )}
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
            >
              <div className="p-3 border-b border-slate-700/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentCurrency.flag}</span>
                    <span className="font-bold text-white">{currency}</span>
                  </div>
                  <span className="text-xs text-slate-400">{getLastUpdatedText()}</span>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {rates.slice(0, 6).map((rate, index) => {
                  const targetCurrency = getCurrency(rate.code);
                  return (
                    <motion.div
                      key={rate.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{targetCurrency.flag}</span>
                        <span className="text-sm font-medium text-white">{rate.code}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-seedling-400 font-mono text-sm">
                          {targetCurrency.symbol}{rate.formatted}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-700/50">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={loadExchangeRates}
                  disabled={exchangeRatesLoading}
                  className="w-full py-2 text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className={`w-4 h-4 ${exchangeRatesLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {exchangeRatesLoading ? 'Refreshing...' : 'Refresh Rates'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full panel for settings
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Exchange Rates
          </h3>
          <p className="text-sm text-slate-400">Live rates from {currentCurrency.name}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {exchangeRatesLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"
            />
          ) : (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Updated {getLastUpdatedText()}
            </span>
          )}
        </div>
      </div>

      {/* Current Base Currency */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentCurrency.flag}</span>
            <div>
              <p className="text-sm text-slate-400">Base Currency</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                {currency}
                <span className="text-amber-400">{currentCurrency.symbol}</span>
              </p>
              <p className="text-sm text-slate-400">{currentCurrency.name}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadExchangeRates}
            disabled={exchangeRatesLoading}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${exchangeRatesLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </motion.button>
        </div>
      </div>

      {/* Exchange Rate Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {rates.map((rate, index) => {
          const targetCurrency = getCurrency(rate.code);
          const isSelected = convertToCurrency === rate.code;

          return (
            <motion.button
              key={rate.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setConvertToCurrency(isSelected ? null : rate.code)}
              className={`relative p-4 rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-seedling-500/20 border-seedling-500 shadow-lg shadow-seedling-500/20'
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{targetCurrency.flag}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 bg-seedling-500 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </div>

              <p className="font-bold text-white">{rate.code}</p>
              <p className="text-xs text-slate-400 truncate">{targetCurrency.name}</p>

              <div className="mt-2 pt-2 border-t border-slate-700/50">
                <p className="text-xs text-slate-500">1 {currency} =</p>
                <p className={`font-mono font-bold ${isSelected ? 'text-seedling-400' : 'text-amber-400'}`}>
                  {targetCurrency.symbol}{rate.formatted}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Show Converted Values Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-white flex items-center gap-2">
              Show Currency Conversions
              {showConvertedValues && convertToCurrency && (
                <span className="px-2 py-0.5 bg-seedling-500/20 text-seedling-400 text-xs rounded-full">
                  {convertToCurrency}
                </span>
              )}
            </h4>
            <p className="text-sm text-slate-400 mt-1">
              {showConvertedValues && convertToCurrency
                ? `Showing values converted to ${getCurrency(convertToCurrency).name}`
                : 'Display values in an additional currency alongside your base currency'}
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowConvertedValues(!showConvertedValues)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              showConvertedValues ? 'bg-seedling-500' : 'bg-slate-700'
            }`}
          >
            <motion.div
              animate={{ x: showConvertedValues ? 24 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
            />
          </motion.button>
        </div>

        {/* Conversion Preview */}
        <AnimatePresence>
          {showConvertedValues && convertToCurrency && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-seedling-500/10 to-teal-500/10 border border-seedling-500/20">
                <p className="text-xs text-slate-400 mb-2">Conversion Preview</p>
                <div className="flex flex-wrap gap-4">
                  {[1000, 10000, 100000].map((amount) => {
                    const targetRate = rates.find(r => r.code === convertToCurrency);
                    const converted = amount * (targetRate?.rate || 1);
                    const targetCurrencyConfig = getCurrency(convertToCurrency);

                    return (
                      <div key={amount} className="text-center">
                        <p className="text-white font-medium">
                          {currentCurrency.symbol}{amount.toLocaleString()}
                        </p>
                        <p className="text-seedling-400 text-sm">
                          = {targetCurrencyConfig.symbol}{converted.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Info Footer */}
      <div className="flex items-start gap-2 text-xs text-slate-500">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          Exchange rates are fetched from the Frankfurter API and cached for 1 hour.
          Some currencies (GHS, NGN, KES) use approximate rates. Select a currency above to see conversions.
        </p>
      </div>
    </div>
  );
};

export default ExchangeRateDisplay;
