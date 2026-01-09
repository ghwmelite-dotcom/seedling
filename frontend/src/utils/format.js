// Currency configurations
export const currencies = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    locale: 'en-US',
    position: 'before', // symbol before number
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    locale: 'en-GB',
    position: 'before',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    locale: 'de-DE',
    position: 'before',
  },
  GHS: {
    code: 'GHS',
    symbol: '₵',
    name: 'Ghanaian Cedi',
    flag: '🇬🇭',
    locale: 'en-GH',
    position: 'before',
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬',
    locale: 'en-NG',
    position: 'before',
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    flag: '🇿🇦',
    locale: 'en-ZA',
    position: 'before',
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    flag: '🇰🇪',
    locale: 'en-KE',
    position: 'before',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    locale: 'en-IN',
    position: 'before',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    locale: 'en-CA',
    position: 'before',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    locale: 'en-AU',
    position: 'before',
  },
};

// Default currency
export const DEFAULT_CURRENCY = 'USD';

// Country to currency mapping
export const countryToCurrency = {
  // Africa
  GH: 'GHS', // Ghana
  NG: 'NGN', // Nigeria
  ZA: 'ZAR', // South Africa
  KE: 'KES', // Kenya

  // Europe
  GB: 'GBP', // United Kingdom
  DE: 'EUR', // Germany
  FR: 'EUR', // France
  IT: 'EUR', // Italy
  ES: 'EUR', // Spain
  NL: 'EUR', // Netherlands
  BE: 'EUR', // Belgium
  AT: 'EUR', // Austria
  IE: 'EUR', // Ireland
  PT: 'EUR', // Portugal
  FI: 'EUR', // Finland
  GR: 'EUR', // Greece

  // Americas
  US: 'USD', // United States
  CA: 'CAD', // Canada

  // Asia Pacific
  AU: 'AUD', // Australia
  NZ: 'AUD', // New Zealand (close enough)
  IN: 'INR', // India
};

// Get currency config
export const getCurrency = (code) => currencies[code] || currencies[DEFAULT_CURRENCY];

// Detect currency from country code
export const getCurrencyFromCountry = (countryCode) => {
  return countryToCurrency[countryCode?.toUpperCase()] || DEFAULT_CURRENCY;
};

// Detect currency from browser locale
export const detectCurrencyFromLocale = () => {
  try {
    // Try to get country from browser language
    const locale = navigator.language || navigator.userLanguage || 'en-US';
    const parts = locale.split('-');
    if (parts.length >= 2) {
      const countryCode = parts[1].toUpperCase();
      if (countryToCurrency[countryCode]) {
        return countryToCurrency[countryCode];
      }
    }
    return DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
};

// Format currency values with dynamic currency support
export const formatCurrency = (value, currencyCode = 'USD') => {
  const currency = getCurrency(currencyCode);
  const symbol = currency.symbol;

  const formatWithSymbol = (num, suffix = '') => {
    return currency.position === 'before'
      ? `${symbol}${num}${suffix}`
      : `${num}${suffix} ${symbol}`;
  };

  if (value >= 1_000_000_000) {
    return formatWithSymbol((value / 1_000_000_000).toFixed(1), 'B');
  }
  if (value >= 1_000_000) {
    return formatWithSymbol((value / 1_000_000).toFixed(1), 'M');
  }
  if (value >= 1000) {
    return formatWithSymbol((value / 1000).toFixed(0), 'K');
  }
  return formatWithSymbol(value.toFixed(0));
};

// Format full currency (no abbreviation)
export const formatCurrencyFull = (value, currencyCode = 'USD') => {
  const currency = getCurrency(currencyCode);
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // Fallback for unsupported currencies
    const symbol = currency.symbol;
    const formatted = value.toLocaleString();
    return currency.position === 'before' ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
  }
};

// Format percentage
export const formatPercent = (value) => `${(value * 100).toFixed(0)}%`;

// Health status colors mapping
export const healthColors = {
  thriving: {
    bg: 'bg-green-500/20',
    border: 'border-green-500',
    text: 'text-green-400',
    glow: 'shadow-green-500/30'
  },
  stable: {
    bg: 'bg-lime-500/20',
    border: 'border-lime-500',
    text: 'text-lime-400',
    glow: 'shadow-lime-500/30'
  },
  struggling: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/30'
  },
  distressed: {
    bg: 'bg-red-500/20',
    border: 'border-red-500',
    text: 'text-red-400',
    glow: 'shadow-red-500/30'
  },
};

// Education level display names
export const educationLabels = {
  high_school: 'High School',
  some_college: 'Some College',
  bachelors: "Bachelor's",
  masters: "Master's",
  doctorate: 'Doctorate',
};
