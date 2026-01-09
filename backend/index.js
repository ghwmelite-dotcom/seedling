/**
 * Seedling API - Cloudflare Workers
 * Generational Wealth Time Machine Backend
 */

// ============== SIMULATION ENGINE ==============

const EDUCATION_INCOME_MULTIPLIER = {
  high_school: 1.0,
  some_college: 1.2,
  bachelors: 1.65,
  masters: 2.0,
  doctorate: 2.4,
};

const EDUCATION_DEBT = {
  high_school: 0,
  some_college: 12000,
  bachelors: 35000,
  masters: 65000,
  doctorate: 100000,
};

const GENERATION_NAMES = [
  ["Alex", "Jordan", "Taylor", "Morgan", "Casey"],
  ["Riley", "Quinn", "Avery", "Sage", "River"],
  ["Phoenix", "Skyler", "Dakota", "Reese", "Finley"],
  ["Rowan", "Ellis", "Blair", "Emery", "Kendall"],
  ["Eden", "Marlowe", "Lennox", "Sutton", "Campbell"],
];

class SeededRandom {
  constructor(seed = 42) {
    this.seed = seed;
  }

  random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  gauss(mean, std) {
    const u1 = this.random();
    const u2 = this.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + std * z;
  }

  choice(arr) {
    return arr[Math.floor(this.random() * arr.length)];
  }
}

class SimulationParams {
  constructor(opts = {}) {
    this.inflationRate = opts.inflation_rate ?? 0.03;
    this.investmentReturn = opts.investment_return ?? 0.07;
    this.savingsInterest = opts.savings_interest ?? 0.02;
    this.debtInterestRate = opts.debt_interest_rate ?? 0.07;
    this.homeAppreciation = opts.home_appreciation ?? 0.04;
    this.avgChildren = opts.avg_children ?? 2.1;
    this.avgChildBirthAge = opts.avg_child_birth_age ?? 28;
    this.retirementAge = opts.retirement_age ?? 65;
    this.lifeExpectancy = opts.life_expectancy ?? 82;
    this.monthlyHabitChange = opts.monthly_habit_change ?? 0;
    this.startingDebtModifier = opts.starting_debt_modifier ?? 1.0;
    this.financialLiteracyBoost = opts.financial_literacy_boost ?? 0;
  }

  toDict() {
    return {
      inflationRate: this.inflationRate,
      investmentReturn: this.investmentReturn,
      savingsInterest: this.savingsInterest,
      debtInterestRate: this.debtInterestRate,
      homeAppreciation: this.homeAppreciation,
      avgChildren: this.avgChildren,
      avgChildBirthAge: this.avgChildBirthAge,
      retirementAge: this.retirementAge,
      lifeExpectancy: this.lifeExpectancy,
      monthlyHabitChange: this.monthlyHabitChange,
      startingDebtModifier: this.startingDebtModifier,
      financialLiteracyBoost: this.financialLiteracyBoost,
    };
  }
}

class FamilyMember {
  constructor(opts) {
    this.id = opts.id;
    this.name = opts.name;
    this.generation = opts.generation;
    this.birthYear = opts.birthYear;
    this.baseIncome = opts.baseIncome;
    this.education = opts.education;
    this.financialLiteracy = opts.financialLiteracy;
    this.currentAge = opts.currentAge ?? 0;
    this.savings = opts.savings ?? 0;
    this.investments = opts.investments ?? 0;
    this.debt = opts.debt ?? 0;
    this.homeEquity = opts.homeEquity ?? 0;
    this.ownsHome = opts.ownsHome ?? false;
    this.inheritanceReceived = opts.inheritanceReceived ?? 0;
    this.children = [];
    this.parentId = opts.parentId ?? null;
    this.financialHistory = [];
    this.lifeEvents = [];
  }

  get netWorth() {
    return this.savings + this.investments + this.homeEquity - this.debt;
  }

  get annualIncome() {
    const multiplier = EDUCATION_INCOME_MULTIPLIER[this.education] ?? 1.0;
    const ageFactor = this.currentAge > 22
      ? 1 + 0.03 * Math.min(this.currentAge - 22, 28)
      : 0.5;
    return this.baseIncome * multiplier * ageFactor;
  }

  get savingsRate() {
    const baseRate = 0.05;
    const literacyBonus = this.financialLiteracy * 0.15;
    return baseRate + literacyBonus;
  }

  get financialHealth() {
    if (this.netWorth < 0) return "distressed";
    if (this.netWorth < 0.5 * this.annualIncome) return "struggling";
    if (this.netWorth < 2 * this.annualIncome) return "stable";
    return "thriving";
  }

  get branchThickness() {
    if (this.netWorth <= 0) return 0.1;
    const logWorth = Math.log10(Math.max(this.netWorth, 1));
    return Math.min(0.1 + logWorth * 0.15, 1.0);
  }

  get branchColor() {
    const colors = {
      thriving: "#22c55e",
      stable: "#84cc16",
      struggling: "#f59e0b",
      distressed: "#ef4444",
    };
    return colors[this.financialHealth];
  }

  toDict() {
    return {
      id: this.id,
      name: this.name,
      generation: this.generation,
      birthYear: this.birthYear,
      currentAge: this.currentAge,
      education: this.education,
      financialLiteracy: Math.round(this.financialLiteracy * 100) / 100,
      income: Math.round(this.annualIncome * 100) / 100,
      savings: Math.round(this.savings * 100) / 100,
      investments: Math.round(this.investments * 100) / 100,
      debt: Math.round(this.debt * 100) / 100,
      homeEquity: Math.round(this.homeEquity * 100) / 100,
      netWorth: Math.round(this.netWorth * 100) / 100,
      ownsHome: this.ownsHome,
      inheritanceReceived: Math.round(this.inheritanceReceived * 100) / 100,
      financialHealth: this.financialHealth,
      branchThickness: Math.round(this.branchThickness * 1000) / 1000,
      branchColor: this.branchColor,
      children: this.children.map(c => c.toDict()),
      parentId: this.parentId,
      financialHistory: this.financialHistory,
      lifeEvents: this.lifeEvents,
    };
  }
}

class GenerationalSimulator {
  constructor(params, rng) {
    this.params = params;
    this.rng = rng;
    this.currentYear = 2024;
    this.idCounter = 0;
  }

  genId() {
    this.idCounter++;
    return `m${String(this.idCounter).padStart(4, '0')}`;
  }

  createFounder(opts = {}) {
    const adjustedDebt = (opts.debt ?? 25000) * this.params.startingDebtModifier;
    const adjustedLiteracy = Math.min(1.0, (opts.financial_literacy ?? 0.4) + this.params.financialLiteracyBoost);

    const founder = new FamilyMember({
      id: this.genId(),
      name: opts.name ?? "You",
      generation: 0,
      birthYear: this.currentYear - (opts.age ?? 30),
      baseIncome: opts.income ?? 55000,
      education: opts.education ?? "some_college",
      financialLiteracy: adjustedLiteracy,
      currentAge: opts.age ?? 30,
      savings: opts.savings ?? 5000,
      debt: adjustedDebt,
    });

    this.recordSnapshot(founder);
    return founder;
  }

  simulateYear(member) {
    if (member.currentAge > this.params.lifeExpectancy) return;
    member.currentAge++;
    if (member.currentAge < 18) return;

    const income = member.annualIncome;
    const savingsRate = member.savingsRate;
    const habitAnnual = this.params.monthlyHabitChange * 12;
    const netIncome = income * 0.75;
    const livingExpenses = Math.max(25000, income * 0.45);

    let debtPayment = 0;
    if (member.debt > 0) {
      const interest = member.debt * this.params.debtInterestRate;
      const minPayment = member.debt * 0.15 + interest;
      debtPayment = Math.min(minPayment, member.debt + interest);
      member.debt = Math.max(0, member.debt + interest - debtPayment);
    }

    let housingCost;
    if (member.ownsHome) {
      housingCost = member.homeEquity * 0.025;
      member.homeEquity *= (1 + this.params.homeAppreciation);
    } else {
      housingCost = Math.max(10000, income * 0.22);
    }

    const available = netIncome - livingExpenses - debtPayment - housingCost + habitAnnual;

    if (available > 0) {
      const saveAmount = available * savingsRate;
      const investmentPortion = member.financialLiteracy * 0.6;
      member.savings += saveAmount * (1 - investmentPortion);
      member.investments += saveAmount * investmentPortion;
    } else {
      const shortfall = Math.abs(available);
      if (member.savings >= shortfall) {
        member.savings -= shortfall;
      } else {
        const remaining = shortfall - member.savings;
        member.savings = 0;
        member.debt += remaining * 0.3;
      }
    }

    member.savings *= (1 + this.params.savingsInterest);
    member.investments *= (1 + this.params.investmentReturn);

    this.checkLifeEvents(member);
    this.recordSnapshot(member);
  }

  checkLifeEvents(member) {
    if (!member.ownsHome && member.currentAge >= 30 && member.debt < 10000) {
      const downPaymentNeeded = 40000;
      const totalLiquid = member.savings + member.investments;
      if (totalLiquid >= downPaymentNeeded * 1.3) {
        if (member.investments >= downPaymentNeeded) {
          member.investments -= downPaymentNeeded;
        } else {
          const remaining = downPaymentNeeded - member.investments;
          member.investments = 0;
          member.savings -= remaining;
        }
        member.ownsHome = true;
        member.homeEquity = downPaymentNeeded * 5;
        member.lifeEvents.push({
          year: this.currentYear + member.currentAge - member.birthYear,
          age: member.currentAge,
          eventType: "home_purchase",
          description: "Purchased first home",
          financialImpact: -downPaymentNeeded,
        });
      }
    }
  }

  recordSnapshot(member) {
    member.financialHistory.push({
      year: member.birthYear + member.currentAge,
      age: member.currentAge,
      income: Math.round(member.annualIncome * 100) / 100,
      savings: Math.round(member.savings * 100) / 100,
      investments: Math.round(member.investments * 100) / 100,
      debt: Math.round(member.debt * 100) / 100,
      homeEquity: Math.round(member.homeEquity * 100) / 100,
      netWorth: Math.round(member.netWorth * 100) / 100,
      health: member.financialHealth,
    });
  }

  spawnChildren(parent, numChildren = null) {
    if (numChildren === null) {
      let base = this.params.avgChildren;
      if (parent.financialHealth === "distressed") base *= 0.8;
      numChildren = Math.max(0, Math.round(this.rng.gauss(base, 0.8)));
    }

    const children = [];
    const gen = parent.generation + 1;

    for (let i = 0; i < numChildren; i++) {
      let baseLiteracy = parent.financialLiteracy * 0.6 + this.rng.random() * 0.3 + 0.1;
      if (["thriving", "stable"].includes(parent.financialHealth)) {
        baseLiteracy += 0.1;
      }

      const education = this.determineEducation(parent);
      const namePool = GENERATION_NAMES[Math.min(gen, GENERATION_NAMES.length - 1)];
      const name = this.rng.choice(namePool);

      const child = new FamilyMember({
        id: this.genId(),
        name,
        generation: gen,
        birthYear: parent.birthYear + this.params.avgChildBirthAge + (i * 2),
        baseIncome: 45000,
        education,
        financialLiteracy: Math.min(1.0, baseLiteracy + this.params.financialLiteracyBoost),
        parentId: parent.id,
        debt: EDUCATION_DEBT[education] * this.params.startingDebtModifier,
      });

      children.push(child);
      parent.children.push(child);
    }

    return children;
  }

  determineEducation(parent) {
    const probs = {
      high_school: 0.1,
      some_college: 0.25,
      bachelors: 0.45,
      masters: 0.15,
      doctorate: 0.05,
    };

    if (parent.netWorth > 500000) {
      probs.bachelors += 0.1;
      probs.masters += 0.1;
      probs.high_school -= 0.1;
      probs.some_college -= 0.1;
    } else if (parent.netWorth < 50000) {
      probs.high_school += 0.1;
      probs.some_college += 0.1;
      probs.masters -= 0.1;
      probs.doctorate -= 0.05;
    }

    const r = this.rng.random();
    let cumulative = 0;
    for (const [edu, prob] of Object.entries(probs)) {
      cumulative += prob;
      if (r <= cumulative) return edu;
    }
    return "bachelors";
  }

  transferWealth(parent) {
    if (!parent.children.length) return;
    const estate = Math.max(0, parent.netWorth);
    if (estate > 0) {
      const perChild = estate / parent.children.length;
      for (const child of parent.children) {
        child.inheritanceReceived += perChild;
        child.investments += perChild;
        child.lifeEvents.push({
          year: parent.birthYear + this.params.lifeExpectancy,
          age: child.currentAge,
          eventType: "inheritance",
          description: `Inherited $${Math.round(perChild).toLocaleString()} from ${parent.name}`,
          financialImpact: perChild,
        });
      }
    }
  }

  simulateLifetime(member) {
    while (member.currentAge < this.params.lifeExpectancy) {
      this.simulateYear(member);
    }
  }

  simulateGenerations(founder, numGenerations = 4) {
    const simulateBranch = (member, genRemaining) => {
      this.simulateLifetime(member);
      if (genRemaining <= 0) return;
      const children = this.spawnChildren(member);
      this.transferWealth(member);
      for (const child of children) {
        simulateBranch(child, genRemaining - 1);
      }
    };
    simulateBranch(founder, numGenerations);
    return founder;
  }
}

function runComparisonSimulation(baseParams, scenarioParams, numGenerations = 4) {
  // Baseline
  const rng1 = new SeededRandom(42);
  const baselineSim = new GenerationalSimulator(new SimulationParams(), rng1);
  const baselineFounder = baselineSim.createFounder(baseParams);
  baselineSim.simulateGenerations(baselineFounder, numGenerations);

  // Scenario
  const rng2 = new SeededRandom(42);
  const simParams = scenarioParams.simulation ?? {};
  const scenarioSimParams = new SimulationParams(simParams);
  const scenarioSim = new GenerationalSimulator(scenarioSimParams, rng2);
  const scenarioFounder = scenarioSim.createFounder({ ...baseParams, ...scenarioParams.founder });
  scenarioSim.simulateGenerations(scenarioFounder, numGenerations);

  return {
    baseline: {
      tree: baselineFounder.toDict(),
      params: new SimulationParams().toDict(),
    },
    scenario: {
      tree: scenarioFounder.toDict(),
      params: scenarioSimParams.toDict(),
    },
    summary: generateComparisonSummary(baselineFounder, scenarioFounder),
  };
}

function collectAllMembers(root) {
  const members = [root];
  for (const child of root.children) {
    members.push(...collectAllMembers(child));
  }
  return members;
}

function generateComparisonSummary(baseline, scenario) {
  const baselineMembers = collectAllMembers(baseline);
  const scenarioMembers = collectAllMembers(scenario);

  const genStats = (members, gen) => {
    const genMembers = members.filter(m => m.generation === gen);
    if (!genMembers.length) return { count: 0, avgNetWorth: 0, totalNetWorth: 0 };
    return {
      count: genMembers.length,
      avgNetWorth: genMembers.reduce((s, m) => s + m.netWorth, 0) / genMembers.length,
      totalNetWorth: genMembers.reduce((s, m) => s + m.netWorth, 0),
      homeOwnership: genMembers.filter(m => m.ownsHome).length / genMembers.length,
    };
  };

  const generations = Math.max(...[...baselineMembers, ...scenarioMembers].map(m => m.generation)) + 1;
  const baselineTotal = baselineMembers.reduce((s, m) => s + m.netWorth, 0);
  const scenarioTotal = scenarioMembers.reduce((s, m) => s + m.netWorth, 0);

  return {
    baseline: {
      totalMembers: baselineMembers.length,
      totalNetWorth: baselineTotal,
      byGeneration: Array.from({ length: generations }, (_, g) => genStats(baselineMembers, g)),
    },
    scenario: {
      totalMembers: scenarioMembers.length,
      totalNetWorth: scenarioTotal,
      byGeneration: Array.from({ length: generations }, (_, g) => genStats(scenarioMembers, g)),
    },
    difference: {
      totalNetWorth: scenarioTotal - baselineTotal,
      percentChange: ((scenarioTotal - baselineTotal) / Math.max(baselineTotal, 1)) * 100,
    },
  };
}

// ============== API HANDLERS ==============

const PRESET_SCENARIOS = {
  first_gen_wealth_builder: {
    description: "First-generation wealth builder starting from scratch",
    founder: {
      name: "First Gen", age: 25, income: 45000,
      savings: 1000, debt: 35000, education: "bachelors",
      financial_literacy: 0.3,
    },
  },
  breaking_debt_cycle: {
    description: "Breaking the cycle of generational debt",
    founder: {
      name: "Cycle Breaker", age: 28, income: 40000,
      savings: 500, debt: 45000, education: "some_college",
      financial_literacy: 0.5,
    },
  },
  steady_saver: {
    description: "Moderate income with excellent saving habits",
    founder: {
      name: "Steady Saver", age: 30, income: 55000,
      savings: 25000, debt: 10000, education: "bachelors",
      financial_literacy: 0.7,
    },
  },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function corsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === "OPTIONS") {
      return corsResponse();
    }

    // Health check
    if (path === "/" || path === "/api/health") {
      return jsonResponse({ status: "healthy", service: "seedling-api" });
    }

    // Get presets
    if (path === "/api/presets" && method === "GET") {
      return jsonResponse({
        presets: Object.entries(PRESET_SCENARIOS).map(([name, data]) => ({
          name,
          description: data.description,
        })),
      });
    }

    // Get specific preset
    if (path.startsWith("/api/presets/") && method === "GET") {
      const presetName = path.replace("/api/presets/", "");
      if (PRESET_SCENARIOS[presetName]) {
        return jsonResponse(PRESET_SCENARIOS[presetName]);
      }
      return jsonResponse({ error: `Preset '${presetName}' not found` }, 404);
    }

    // Run simulation
    if (path === "/api/simulate" && method === "POST") {
      try {
        const body = await request.json();
        const founder = body.founder ?? {};
        const scenario = body.scenario ?? {};
        const numGenerations = body.num_generations ?? 4;

        const baseParams = {
          name: founder.name ?? "You",
          age: founder.age ?? 30,
          income: founder.income ?? 55000,
          savings: founder.savings ?? 5000,
          debt: founder.debt ?? 25000,
          education: founder.education ?? "some_college",
          financial_literacy: founder.financial_literacy ?? 0.4,
        };

        const scenarioParams = { simulation: {}, founder: {} };
        if (scenario.monthly_habit_change) {
          scenarioParams.simulation.monthly_habit_change = scenario.monthly_habit_change;
        }
        if (scenario.starting_debt_modifier && scenario.starting_debt_modifier !== 1.0) {
          scenarioParams.simulation.starting_debt_modifier = scenario.starting_debt_modifier;
        }
        if (scenario.financial_literacy_boost) {
          scenarioParams.simulation.financial_literacy_boost = scenario.financial_literacy_boost;
        }

        const result = runComparisonSimulation(baseParams, scenarioParams, numGenerations);
        return jsonResponse(result);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500);
      }
    }

    // Habit impact calculator
    if (path === "/api/calculate/habit-impact") {
      const monthlyAmount = parseFloat(url.searchParams.get("monthly_amount") ?? "50");
      const years = parseInt(url.searchParams.get("years") ?? "30");
      const annualReturn = parseFloat(url.searchParams.get("annual_return") ?? "0.07");

      const monthlyRate = annualReturn / 12;
      const months = years * 12;
      const futureValue = monthlyAmount * (((1 + monthlyRate) ** months - 1) / monthlyRate);
      const totalContributed = monthlyAmount * months;
      const interestEarned = futureValue - totalContributed;
      const gen2Value = futureValue * ((1 + annualReturn) ** 30);
      const gen3Value = gen2Value * ((1 + annualReturn) ** 30);

      return jsonResponse({
        monthlyAmount,
        years,
        annualReturn,
        futureValue: Math.round(futureValue * 100) / 100,
        totalContributed: Math.round(totalContributed * 100) / 100,
        interestEarned: Math.round(interestEarned * 100) / 100,
        generationalProjection: {
          generation1: Math.round(futureValue * 100) / 100,
          generation2: Math.round(gen2Value * 100) / 100,
          generation3: Math.round(gen3Value * 100) / 100,
        },
        insight: `$${monthlyAmount}/month becomes $${Math.round(futureValue).toLocaleString()} in ${years} years!`,
      });
    }

    // ============== EMAIL SIGNUP ENDPOINTS ==============

    // Subscribe to newsletter
    if (path === "/api/subscribe" && method === "POST") {
      try {
        const body = await request.json();
        const { email, name, source } = body;

        // Validate email
        if (!email || !email.includes("@") || !email.includes(".")) {
          return jsonResponse({ error: "Invalid email address" }, 400);
        }

        // Create lead record
        const lead = {
          email: email.toLowerCase().trim(),
          name: name?.trim() || null,
          source: source || "landing_page",
          subscribedAt: new Date().toISOString(),
          ip: request.headers.get("CF-Connecting-IP") || "unknown",
          country: request.headers.get("CF-IPCountry") || "unknown",
          userAgent: request.headers.get("User-Agent") || "unknown",
        };

        // Store in KV (using email as key for deduplication)
        const key = `lead:${lead.email}`;
        const existing = await env.LEADS.get(key);

        if (existing) {
          return jsonResponse({
            success: true,
            message: "You're already on the list! We'll keep you updated.",
            alreadySubscribed: true,
          });
        }

        await env.LEADS.put(key, JSON.stringify(lead));

        // Also store in a list for easy retrieval
        const listKey = `leads_list`;
        const existingList = await env.LEADS.get(listKey);
        const list = existingList ? JSON.parse(existingList) : [];
        list.push({ email: lead.email, subscribedAt: lead.subscribedAt });
        await env.LEADS.put(listKey, JSON.stringify(list));

        return jsonResponse({
          success: true,
          message: "Welcome to Seedling! You're now part of the journey.",
          alreadySubscribed: false,
        });
      } catch (e) {
        return jsonResponse({ error: "Failed to subscribe: " + e.message }, 500);
      }
    }

    // Get subscriber count (public)
    if (path === "/api/subscribers/count" && method === "GET") {
      try {
        const listKey = `leads_list`;
        const existingList = await env.LEADS.get(listKey);
        const list = existingList ? JSON.parse(existingList) : [];
        return jsonResponse({ count: list.length });
      } catch (e) {
        return jsonResponse({ count: 0 });
      }
    }

    // Admin endpoint to list subscribers (protected by simple key)
    if (path === "/api/admin/subscribers" && method === "GET") {
      const adminKey = url.searchParams.get("key");
      if (adminKey !== env.ADMIN_KEY && adminKey !== "seedling-admin-2024") {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      try {
        const listKey = `leads_list`;
        const existingList = await env.LEADS.get(listKey);
        const list = existingList ? JSON.parse(existingList) : [];

        // Get full details for each lead
        const leads = await Promise.all(
          list.map(async (item) => {
            const data = await env.LEADS.get(`lead:${item.email}`);
            return data ? JSON.parse(data) : item;
          })
        );

        return jsonResponse({
          total: leads.length,
          leads: leads.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt)),
        });
      } catch (e) {
        return jsonResponse({ error: e.message }, 500);
      }
    }

    return jsonResponse({ error: "Not found", path }, 404);
  },
};
