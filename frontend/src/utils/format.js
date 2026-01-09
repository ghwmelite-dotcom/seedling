// Format currency values
export const formatCurrency = (value) => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
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
