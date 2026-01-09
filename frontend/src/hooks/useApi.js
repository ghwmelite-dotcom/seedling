import { useState, useEffect, useCallback } from 'react';

// Use Cloudflare Workers API in production, local API in development
const API_URL = import.meta.env.PROD
  ? 'https://seedling-api.ghwmelite.workers.dev/api'
  : '/api';

// Custom hook for API health check
export const useApiHealth = () => {
  const [connected, setConnected] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        setConnected(response.ok);
      } catch {
        setConnected(false);
      } finally {
        setChecking(false);
      }
    };
    checkHealth();
  }, []);

  return { connected, checking };
};

// Custom hook for simulation
export const useSimulation = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSimulation = useCallback(async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          founder: {
            name: formData.name,
            age: formData.age,
            income: formData.income,
            savings: formData.savings,
            debt: formData.debt,
            education: formData.education,
            financial_literacy: formData.financial_literacy,
          },
          scenario: {
            monthly_habit_change: formData.monthlyHabitChange,
          },
          num_generations: formData.generations,
        }),
      });

      if (!response.ok) {
        throw new Error('Simulation failed');
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      // Generate local mock data as fallback
      const mockData = generateMockSimulation(formData);
      setResult(mockData);
      return mockData;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, runSimulation, clearResult };
};

// Generate mock simulation data for offline mode
const generateMockSimulation = (formData) => {
  const createMember = (name, gen, netWorth, children = []) => ({
    id: Math.random().toString(36).substr(2, 8),
    name,
    generation: gen,
    currentAge: gen === 0 ? formData.age : 82,
    income: formData.income * (1 + gen * 0.2),
    savings: Math.max(0, netWorth * 0.2),
    investments: Math.max(0, netWorth * 0.6),
    debt: Math.max(0, formData.debt - gen * 15000),
    homeEquity: netWorth > 100000 ? netWorth * 0.3 : 0,
    netWorth: Math.max(0, netWorth),
    ownsHome: netWorth > 100000,
    inheritanceReceived: gen > 0 ? netWorth * 0.15 : 0,
    financialHealth:
      netWorth > 500000
        ? 'thriving'
        : netWorth > 100000
        ? 'stable'
        : netWorth > 0
        ? 'struggling'
        : 'distressed',
    branchThickness: Math.min(1, 0.2 + Math.log10(Math.max(netWorth, 1)) * 0.12),
    branchColor:
      netWorth > 500000
        ? '#22c55e'
        : netWorth > 100000
        ? '#84cc16'
        : netWorth > 0
        ? '#f59e0b'
        : '#ef4444',
    children,
    lifeEvents: [],
  });

  const baseGrowth = 1.06;
  const scenarioGrowth = 1.08;
  const startWealth = formData.savings - formData.debt;
  const habitBoost = formData.monthlyHabitChange * 12 * 25;

  const calcWealth = (growth, boost = 0) => {
    const w = [];
    w[0] = Math.max(0, startWealth + boost);
    for (let i = 1; i < formData.generations; i++) {
      w[i] = w[i - 1] * Math.pow(growth, 25) + 150000 * i;
    }
    return w;
  };

  const baseWealth = calcWealth(baseGrowth, 0);
  const scenarioWealth = calcWealth(scenarioGrowth, habitBoost);

  const buildTree = (wealth, name) => {
    const gens = formData.generations;
    const members = [];

    for (let g = gens - 1; g >= 0; g--) {
      const count = Math.pow(2, Math.min(g, 3));
      const children = g < gens - 1 ? members.filter((m) => m.generation === g + 1) : [];

      for (let i = 0; i < count; i++) {
        const memberName =
          g === 0
            ? name
            : ['Jordan', 'Taylor', 'Riley', 'Quinn', 'Phoenix', 'Rowan', 'Eden', 'Blair'][
                (g * 2 + i) % 8
              ];
        const memberChildren = children.slice(i * 2, i * 2 + 2);
        members.push(createMember(memberName, g, wealth[g] / count, memberChildren));
      }
    }

    return members.find((m) => m.generation === 0);
  };

  const baseTree = buildTree(baseWealth, formData.name);
  const scenarioTree = buildTree(scenarioWealth, formData.name);

  const sumWealth = (w) => w.reduce((a, b) => a + b, 0);
  const totalBase = sumWealth(baseWealth);
  const totalScenario = sumWealth(scenarioWealth);

  return {
    baseline: { tree: baseTree },
    scenario: { tree: scenarioTree },
    summary: {
      baseline: {
        totalMembers: Math.pow(2, formData.generations) - 1,
        totalNetWorth: totalBase,
        byGeneration: baseWealth.map((w, i) => ({
          avgNetWorth: w / Math.pow(2, Math.min(i, 3)),
          count: Math.pow(2, Math.min(i, 3)),
        })),
      },
      scenario: {
        totalMembers: Math.pow(2, formData.generations) - 1,
        totalNetWorth: totalScenario,
        byGeneration: scenarioWealth.map((w, i) => ({
          avgNetWorth: w / Math.pow(2, Math.min(i, 3)),
          count: Math.pow(2, Math.min(i, 3)),
        })),
      },
      difference: {
        totalNetWorth: totalScenario - totalBase,
        percentChange: ((totalScenario - totalBase) / Math.max(totalBase, 1)) * 100,
      },
    },
  };
};

// Hook for habit impact calculator
export const useHabitCalculator = (amount, years = 30, annualReturn = 0.07) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const monthlyRate = annualReturn / 12;
    const months = years * 12;

    const futureValue = amount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    const gen2 = futureValue * Math.pow(1 + annualReturn, 30);
    const gen3 = gen2 * Math.pow(1 + annualReturn, 30);

    setResult({
      futureValue,
      gen2,
      gen3,
      totalContributed: amount * months,
      interestEarned: futureValue - amount * months,
    });
  }, [amount, years, annualReturn]);

  return result;
};
