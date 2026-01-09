import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { formatCurrency } from '../utils/format';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {typeof entry.value === 'number' && entry.value > 100
              ? formatCurrency(entry.value)
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Stat card component
const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
  <motion.div
    className="glass-card p-4"
    whileHover={{ scale: 1.02 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm">{title}</p>
        <p className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
    {trend !== undefined && (
      <div className={`mt-2 text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
      </div>
    )}
  </motion.div>
);

const AnalyticsDashboard = ({ simulation, comparisonSummary }) => {
  const [activeChart, setActiveChart] = useState('wealth');

  // Process simulation data
  const data = useMemo(() => {
    if (!simulation?.baseline?.members) return null;

    const baselineMembers = simulation.baseline.members;
    const scenarioMembers = simulation.scenario?.members || [];

    // Wealth by generation
    const wealthByGen = {};
    baselineMembers.forEach(m => {
      if (!wealthByGen[m.generation]) {
        wealthByGen[m.generation] = { baseline: 0, scenario: 0, count: 0 };
      }
      wealthByGen[m.generation].baseline += m.netWorth;
      wealthByGen[m.generation].count++;
    });
    scenarioMembers.forEach(m => {
      if (wealthByGen[m.generation]) {
        wealthByGen[m.generation].scenario += m.netWorth;
      }
    });

    const wealthData = Object.entries(wealthByGen).map(([gen, data]) => ({
      generation: `Gen ${parseInt(gen) + 1}`,
      baseline: data.baseline,
      scenario: data.scenario,
      avgBaseline: data.baseline / data.count,
      avgScenario: data.scenario / data.count,
    }));

    // Financial health distribution
    const healthCount = { thriving: 0, growing: 0, stable: 0, distressed: 0 };
    baselineMembers.forEach(m => {
      if (healthCount[m.financialHealth] !== undefined) {
        healthCount[m.financialHealth]++;
      }
    });

    const healthData = Object.entries(healthCount).map(([health, count]) => ({
      name: health.charAt(0).toUpperCase() + health.slice(1),
      value: count,
      color: health === 'thriving' ? '#22c55e' :
             health === 'growing' ? '#4ade80' :
             health === 'stable' ? '#3b82f6' : '#ef4444',
    }));

    // Wealth timeline (simulated year-by-year growth)
    const timelineData = [];
    let cumulativeWealth = baselineMembers[0]?.netWorth || 50000;
    for (let year = 0; year <= 50; year += 5) {
      timelineData.push({
        year: `Year ${year}`,
        wealth: Math.round(cumulativeWealth),
        projected: Math.round(cumulativeWealth * 1.1),
      });
      cumulativeWealth *= 1.07 + (Math.random() * 0.03);
    }

    // Member comparison data
    const memberData = baselineMembers.slice(0, 10).map(m => ({
      name: m.name.split(' ')[0],
      netWorth: m.netWorth,
      age: m.currentAge,
      generation: m.generation + 1,
    }));

    // Radar chart data for financial health metrics
    const radarData = [
      { metric: 'Savings Rate', value: 75, fullMark: 100 },
      { metric: 'Investment Growth', value: 85, fullMark: 100 },
      { metric: 'Debt Management', value: 60, fullMark: 100 },
      { metric: 'Home Equity', value: 70, fullMark: 100 },
      { metric: 'Emergency Fund', value: 55, fullMark: 100 },
      { metric: 'Retirement Ready', value: 80, fullMark: 100 },
    ];

    return {
      wealthData,
      healthData,
      timelineData,
      memberData,
      radarData,
      totalWealth: baselineMembers.reduce((sum, m) => sum + m.netWorth, 0),
      avgWealth: baselineMembers.reduce((sum, m) => sum + m.netWorth, 0) / baselineMembers.length,
      totalMembers: baselineMembers.length,
      homeowners: baselineMembers.filter(m => m.ownsHome).length,
      thrivingCount: healthCount.thriving,
    };
  }, [simulation]);

  if (!data) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h3>
        <p className="text-slate-400">Run a simulation to see detailed analytics</p>
      </div>
    );
  }

  const chartTabs = [
    { id: 'wealth', label: 'Wealth Growth', icon: '📈' },
    { id: 'distribution', label: 'Health Distribution', icon: '🥧' },
    { id: 'comparison', label: 'Member Comparison', icon: '👥' },
    { id: 'radar', label: 'Financial Health', icon: '🎯' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-2xl">📊</span>
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-white">Wealth Analytics</h2>
          <p className="text-slate-400">Deep dive into your financial simulation</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="💰"
          title="Total Family Wealth"
          value={formatCurrency(data.totalWealth)}
          color="text-green-400"
        />
        <StatCard
          icon="👨‍👩‍👧‍👦"
          title="Family Members"
          value={data.totalMembers}
          subtitle={`${data.homeowners} homeowners`}
        />
        <StatCard
          icon="📊"
          title="Average Net Worth"
          value={formatCurrency(data.avgWealth)}
          color="text-blue-400"
        />
        <StatCard
          icon="🌟"
          title="Thriving Members"
          value={data.thrivingCount}
          subtitle={`${((data.thrivingCount / data.totalMembers) * 100).toFixed(0)}% of family`}
          color="text-yellow-400"
        />
      </div>

      {/* Chart tabs */}
      <div className="flex flex-wrap gap-2">
        {chartTabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              activeChart === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Charts */}
      <motion.div
        className="glass-card p-6"
        key={activeChart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeChart === 'wealth' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Wealth by Generation</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.wealthData}>
                <defs>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="generation" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorBaseline)"
                  name="Baseline"
                />
                <Area
                  type="monotone"
                  dataKey="scenario"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorScenario)"
                  name="Scenario"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'distribution' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Financial Health Distribution</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {data.healthData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white">{item.name}</span>
                    <span className="text-slate-400">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeChart === 'comparison' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Member Net Worth Comparison</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.memberData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="netWorth" name="Net Worth" radius={[0, 4, 4, 0]}>
                  {data.memberData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.generation - 1] || COLORS[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'radar' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Financial Health Score</h3>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={data.radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.5}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Wealth Timeline */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">50-Year Wealth Projection</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="wealth"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ fill: '#22c55e', strokeWidth: 2 }}
              name="Projected Wealth"
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Optimistic Scenario"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;
