import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.PROD
  ? 'https://seedling-api.ghwmelite.workers.dev'
  : 'http://localhost:8787';

const ADMIN_KEY = 'seedling-admin-2024';
const AUTH_STORAGE_KEY = 'seedling-analytics-auth';

// ============== PASSWORD GATE ==============
const PasswordGate = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Verify password by attempting to fetch analytics
    try {
      const response = await fetch(`${API_URL}/api/analytics/stats?key=${password}`);
      const data = await response.json();

      if (data.error) {
        setError('Invalid password');
        setLoading(false);
        return;
      }

      // Password is correct - store in sessionStorage
      sessionStorage.setItem(AUTH_STORAGE_KEY, password);
      onAuthenticated(password);
    } catch (err) {
      setError('Failed to verify. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-700/50 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center"
            >
              <span className="text-4xl">🔐</span>
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-slate-400">Enter your admin password to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all pr-12"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2"
                >
                  <span>⚠️</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || !password}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>Access Dashboard</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
            >
              ← Back to Seedling
            </a>
          </div>
        </div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-500 text-xs mt-4"
        >
          🔒 Secure access • Session expires when browser closes
        </motion.p>
      </motion.div>
    </div>
  );
};

// ============== ANIMATED NUMBER ==============
const AnimatedNumber = ({ value, duration = 1000, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(startValue + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

// ============== METRIC CARD ==============
const MetricCard = ({ title, value, change, icon, color = 'emerald', prefix = '', suffix = '', delay = 0 }) => {
  const colorClasses = {
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    violet: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400',
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
  };

  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} border p-6`}
    >
      <div className="absolute top-4 right-4 text-3xl opacity-50">{icon}</div>
      <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
      <p className={`text-3xl font-bold ${colorClasses[color].split(' ').pop()}`}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </p>
      {change !== undefined && (
        <p className={`text-sm mt-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}% vs last period
        </p>
      )}
    </motion.div>
  );
};

// ============== SPARKLINE CHART ==============
const SparklineChart = ({ data, height = 60, color = '#34d399' }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} 100,${height}`;

  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        points={areaPoints}
        fill="url(#sparkGradient)"
      />
      <motion.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// ============== BAR CHART ==============
const BarChart = ({ data, height = 200 }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="space-y-3">
      {entries.map(([label, value], i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-24 text-sm text-slate-400 truncate" title={label}>
            {label}
          </div>
          <div className="flex-1 h-8 bg-slate-800/50 rounded-lg overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(value / max) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-end pr-2"
            >
              <span className="text-xs font-medium text-white">{value}</span>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============== DONUT CHART ==============
const DonutChart = ({ data, size = 160 }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const colors = ['#34d399', '#fbbf24', '#a78bfa', '#22d3ee', '#f87171', '#fb923c'];

  let currentAngle = -90;
  const segments = entries.map(([label, value], i) => {
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;
    const radius = size / 2 - 10;
    const innerRadius = radius * 0.6;

    const x1 = size / 2 + radius * Math.cos(startRad);
    const y1 = size / 2 + radius * Math.sin(startRad);
    const x2 = size / 2 + radius * Math.cos(endRad);
    const y2 = size / 2 + radius * Math.sin(endRad);
    const x3 = size / 2 + innerRadius * Math.cos(endRad);
    const y3 = size / 2 + innerRadius * Math.sin(endRad);
    const x4 = size / 2 + innerRadius * Math.cos(startRad);
    const y4 = size / 2 + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`,
      color: colors[i % colors.length],
      label,
      value,
      percentage: ((value / total) * 100).toFixed(1),
    };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="flex-shrink-0">
        {segments.map((segment, i) => (
          <motion.path
            key={segment.label}
            d={segment.path}
            fill={segment.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        ))}
        <circle cx={size / 2} cy={size / 2} r={size / 2 * 0.35} fill="#0f172a" />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-xl font-bold"
        >
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {segments.slice(0, 5).map((segment, i) => (
          <motion.div
            key={segment.label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-2 text-sm"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-slate-400">{segment.label}</span>
            <span className="text-white font-medium">{segment.percentage}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============== HOURLY HEATMAP ==============
const HourlyHeatmap = ({ data }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxValue = Math.max(...Object.values(data || {}), 1);

  const getIntensity = (hour) => {
    const value = data?.[hour] || 0;
    return value / maxValue;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {hours.map((hour) => {
          const intensity = getIntensity(hour);
          return (
            <motion.div
              key={hour}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: hour * 0.02 }}
              className="flex-1 h-8 rounded cursor-pointer relative group"
              style={{
                backgroundColor: intensity > 0
                  ? `rgba(52, 211, 153, ${0.2 + intensity * 0.8})`
                  : 'rgba(51, 65, 85, 0.5)',
              }}
              title={`${hour}:00 - ${data?.[hour] || 0} events`}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {hour}:00 - {data?.[hour] || 0}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
};

// ============== EVENT LIST ==============
const EventList = ({ events }) => {
  if (!events || Object.keys(events).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        No events tracked yet
      </div>
    );
  }

  const entries = Object.entries(events).sort((a, b) => b[1] - a[1]);

  const eventIcons = {
    signup_start: '✏️',
    signup_complete: '✅',
    cta_click: '👆',
    demo_interaction: '🎮',
    scroll_depth: '📜',
    pageview: '👁️',
  };

  return (
    <div className="space-y-2">
      {entries.map(([event, count], i) => (
        <motion.div
          key={event}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{eventIcons[event] || '📊'}</span>
            <span className="text-slate-300 font-medium">{event.replace(/_/g, ' ')}</span>
          </div>
          <span className="text-emerald-400 font-bold">{count}</span>
        </motion.div>
      ))}
    </div>
  );
};

// ============== LINE CHART ==============
const LineChart = ({ data, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }

  const values = data.map(d => d.pageviews);
  const max = Math.max(...values, 1);
  const padding = 40;
  const chartWidth = 100;
  const chartHeight = height - padding * 2;

  const points = values.map((value, i) => {
    const x = padding + (i / (values.length - 1)) * (chartWidth - padding * 2);
    const y = padding + chartHeight - (value / max) * chartHeight;
    return { x: x * 6, y, value, date: data[i].date };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

  return (
    <svg viewBox={`0 0 ${chartWidth * 6} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={ratio}
          x1={padding * 6}
          y1={padding + chartHeight * ratio}
          x2={chartWidth * 6 - padding}
          y2={padding + chartHeight * ratio}
          stroke="#334155"
          strokeWidth="1"
          strokeDasharray="4"
        />
      ))}

      {/* Area fill */}
      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        d={areaPath}
        fill="url(#lineGradient)"
      />

      {/* Line */}
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        d={linePath}
        fill="none"
        stroke="#34d399"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Data points */}
      {points.map((point, i) => (
        <motion.g key={i}>
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            cx={point.x}
            cy={point.y}
            r="6"
            fill="#0f172a"
            stroke="#34d399"
            strokeWidth="2"
            className="cursor-pointer"
          />
          <title>{point.date}: {point.value} pageviews</title>
        </motion.g>
      ))}

      {/* X-axis labels */}
      {points.filter((_, i) => i % Math.ceil(points.length / 7) === 0).map((point, i) => (
        <text
          key={i}
          x={point.x}
          y={height - 10}
          textAnchor="middle"
          className="fill-slate-500 text-xs"
          style={{ fontSize: '10px' }}
        >
          {point.date.slice(5)}
        </text>
      ))}
    </svg>
  );
};

// ============== MAIN DASHBOARD ==============
const AnalyticsDashboard = () => {
  const [authKey, setAuthKey] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Check for saved auth on mount
  useEffect(() => {
    const savedKey = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (savedKey) {
      setAuthKey(savedKey);
    }
    setCheckingAuth(false);
  }, []);

  const fetchData = async (key) => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/stats?key=${key || authKey}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();

      if (result.error) {
        // Auth failed - clear session
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthKey(null);
        throw new Error('Authentication expired');
      }

      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (authKey) {
      fetchData(authKey);
      const interval = setInterval(() => fetchData(authKey), 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [authKey]);

  const handleAuthenticated = (key) => {
    setAuthKey(key);
    setLoading(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthKey(null);
    setData(null);
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
        />
      </div>
    );
  }

  // Show password gate if not authenticated
  if (!authKey) {
    return <PasswordGate onAuthenticated={handleAuthenticated} />;
  }

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Aggregate all events from daily data
  const allEvents = useMemo(() => {
    if (!data?.daily) return {};
    return data.daily.reduce((acc, day) => {
      Object.entries(day.events || {}).forEach(([event, count]) => {
        acc[event] = (acc[event] || 0) + count;
      });
      return acc;
    }, {});
  }, [data]);

  // Aggregate hourly data
  const hourlyData = useMemo(() => {
    if (!data?.daily) return {};
    return data.daily.reduce((acc, day) => {
      Object.entries(day.hours || {}).forEach(([hour, count]) => {
        acc[hour] = (acc[hour] || 0) + count;
      });
      return acc;
    }, {});
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-bold text-white mb-2">Failed to load analytics</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-emerald-500 rounded-lg text-white font-medium hover:bg-emerald-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <a href="/" className="text-3xl">🌱</a>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Seedling Analytics
              </h1>
            </div>
            <p className="text-slate-400">
              {data?.period || 'Last 7 days'} • Real-time visitor insights
            </p>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <motion.span
                animate={refreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                🔄
              </motion.span>
              Refresh
            </motion.button>

            <a
              href="/"
              className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              ← Back to Site
            </a>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <span>🚪</span>
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Pageviews"
            value={data?.summary?.totalPageviews || 0}
            icon="👁️"
            color="emerald"
            delay={0}
          />
          <MetricCard
            title="Unique Visitors"
            value={data?.summary?.totalUniqueVisitors || 0}
            icon="👤"
            color="cyan"
            delay={0.1}
          />
          <MetricCard
            title="Total Conversions"
            value={data?.summary?.totalConversions || 0}
            icon="🎯"
            color="amber"
            delay={0.2}
          />
          <MetricCard
            title="Conversion Rate"
            value={parseFloat(data?.summary?.conversionRate) || 0}
            suffix="%"
            icon="📈"
            color="violet"
            delay={0.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Traffic Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span> Traffic Trend
            </h3>
            <div className="h-64">
              <LineChart data={data?.daily?.slice().reverse()} height={256} />
            </div>
          </motion.div>

          {/* Top Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📄</span> Top Pages
            </h3>
            <BarChart data={data?.summary?.topPages} />
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🌍</span> Visitors by Country
            </h3>
            <DonutChart data={data?.summary?.topCountries} />
          </motion.div>

          {/* Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>⚡</span> Event Breakdown
            </h3>
            <EventList events={allEvents} />
          </motion.div>
        </div>

        {/* Hourly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🕐</span> Activity by Hour
          </h3>
          <HourlyHeatmap data={hourlyData} />
        </motion.div>

        {/* All-Time Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🏆</span> All-Time Statistics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-400">
                <AnimatedNumber value={data?.allTime?.totalPageviews || 0} />
              </p>
              <p className="text-slate-400 mt-1">Total Pageviews</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-amber-400">
                <AnimatedNumber value={data?.allTime?.totalEvents || 0} />
              </p>
              <p className="text-slate-400 mt-1">Total Events</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-violet-400">
                <AnimatedNumber value={data?.allTime?.totalConversions || 0} />
              </p>
              <p className="text-slate-400 mt-1">Total Conversions</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-500 text-sm mt-12 pb-8"
        >
          <p>🌱 Seedling Analytics Dashboard</p>
          <p className="mt-1">Data refreshes automatically every minute</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
