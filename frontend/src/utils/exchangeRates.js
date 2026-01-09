/**
 * Exchange Rate Utilities for Seedling
 * Uses Frankfurter API (free, no API key required)
 */

const EXCHANGE_API_BASE = 'https://api.frankfurter.app';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

// Fallback rates (approximate, updated periodically)
// These are used if the API fails
export const FALLBACK_RATES = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  GHS: 15.5,
  NGN: 1550,
  ZAR: 18.5,
  KES: 153,
  INR: 83.5,
  CAD: 1.36,
  AUD: 1.53,
};

// Cache for exchange rates
let ratesCache = {
  base: 'USD',
  rates: null,
  timestamp: 0,
};

/**
 * Fetch latest exchange rates from API
 * @param {string} baseCurrency - Base currency code (default: USD)
 * @returns {Promise<Object>} - Exchange rates object
 */
export const fetchExchangeRates = async (baseCurrency = 'USD') => {
  // Check cache first
  const now = Date.now();
  if (
    ratesCache.rates &&
    ratesCache.base === baseCurrency &&
    now - ratesCache.timestamp < CACHE_DURATION
  ) {
    return ratesCache.rates;
  }

  try {
    // Frankfurter API supports: USD, GBP, EUR, CAD, AUD, INR, ZAR
    // For unsupported currencies (GHS, NGN, KES), we'll use fallback rates
    const supportedCurrencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'INR', 'ZAR'];

    const response = await fetch(
      `${EXCHANGE_API_BASE}/latest?from=${baseCurrency}&to=${supportedCurrencies.join(',')}`,
      { timeout: 5000 }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();

    // Merge API rates with fallback rates for unsupported currencies
    const rates = {
      [baseCurrency]: 1,
      ...data.rates,
    };

    // Add fallback rates for unsupported currencies (relative to USD)
    if (baseCurrency === 'USD') {
      rates.GHS = FALLBACK_RATES.GHS;
      rates.NGN = FALLBACK_RATES.NGN;
      rates.KES = FALLBACK_RATES.KES;
    } else {
      // Convert fallback rates through USD
      const usdRate = rates.USD || (1 / FALLBACK_RATES[baseCurrency]);
      rates.GHS = FALLBACK_RATES.GHS * usdRate;
      rates.NGN = FALLBACK_RATES.NGN * usdRate;
      rates.KES = FALLBACK_RATES.KES * usdRate;
    }

    // Update cache
    ratesCache = {
      base: baseCurrency,
      rates,
      timestamp: now,
    };

    return rates;
  } catch (error) {
    console.warn('Exchange rate API failed, using fallback rates:', error.message);

    // Return fallback rates converted from USD to requested base
    if (baseCurrency === 'USD') {
      return FALLBACK_RATES;
    }

    const baseRate = FALLBACK_RATES[baseCurrency] || 1;
    const convertedRates = {};
    for (const [currency, rate] of Object.entries(FALLBACK_RATES)) {
      convertedRates[currency] = rate / baseRate;
    }
    return convertedRates;
  }
};

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} rates - Exchange rates object (from fetchExchangeRates)
 * @returns {number} - Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
  if (fromCurrency === toCurrency) return amount;
  if (!rates) return amount;

  // If rates are based on fromCurrency, direct conversion
  if (rates[toCurrency]) {
    return amount * rates[toCurrency];
  }

  // Otherwise, convert through USD
  const fromRate = rates[fromCurrency] || FALLBACK_RATES[fromCurrency] || 1;
  const toRate = rates[toCurrency] || FALLBACK_RATES[toCurrency] || 1;

  // Convert to USD first, then to target
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
};

/**
 * Get exchange rate between two currencies
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} rates - Exchange rates object
 * @returns {number} - Exchange rate
 */
export const getExchangeRate = (fromCurrency, toCurrency, rates) => {
  if (fromCurrency === toCurrency) return 1;
  if (!rates) {
    // Use fallback rates
    const fromRate = FALLBACK_RATES[fromCurrency] || 1;
    const toRate = FALLBACK_RATES[toCurrency] || 1;
    return toRate / fromRate;
  }

  return rates[toCurrency] || 1;
};

/**
 * Format exchange rate for display
 * @param {number} rate - Exchange rate
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted rate
 */
export const formatExchangeRate = (rate, decimals = 4) => {
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 10) return rate.toFixed(3);
  return rate.toFixed(decimals);
};

/**
 * Get all available currency pairs with rates
 * @param {string} baseCurrency - Base currency code
 * @param {Object} rates - Exchange rates object
 * @returns {Array} - Array of {code, rate, formatted} objects
 */
export const getAllRates = (baseCurrency, rates) => {
  const allCurrencies = ['USD', 'GBP', 'EUR', 'GHS', 'NGN', 'ZAR', 'KES', 'INR', 'CAD', 'AUD'];

  return allCurrencies
    .filter((code) => code !== baseCurrency)
    .map((code) => ({
      code,
      rate: getExchangeRate(baseCurrency, code, rates),
      formatted: formatExchangeRate(getExchangeRate(baseCurrency, code, rates)),
    }));
};

export default {
  fetchExchangeRates,
  convertCurrency,
  getExchangeRate,
  formatExchangeRate,
  getAllRates,
  FALLBACK_RATES,
};
