"""
Seedling API - Cloudflare Workers Entry Point
Wraps FastAPI for Cloudflare Workers Python runtime
"""

from js import Response, Headers, JSON
from dataclasses import dataclass
from typing import Optional, Dict, Any
from enum import Enum
import json
import random
import math


# ============== SIMULATION ENGINE (inlined for Workers) ==============

class EducationLevel(Enum):
    HIGH_SCHOOL = "high_school"
    SOME_COLLEGE = "some_college"
    BACHELORS = "bachelors"
    MASTERS = "masters"
    DOCTORATE = "doctorate"


class FinancialHealth(Enum):
    THRIVING = "thriving"
    STABLE = "stable"
    STRUGGLING = "struggling"
    DISTRESSED = "distressed"


EDUCATION_INCOME_MULTIPLIER = {
    EducationLevel.HIGH_SCHOOL: 1.0,
    EducationLevel.SOME_COLLEGE: 1.2,
    EducationLevel.BACHELORS: 1.65,
    EducationLevel.MASTERS: 2.0,
    EducationLevel.DOCTORATE: 2.4,
}

EDUCATION_DEBT = {
    EducationLevel.HIGH_SCHOOL: 0,
    EducationLevel.SOME_COLLEGE: 12000,
    EducationLevel.BACHELORS: 35000,
    EducationLevel.MASTERS: 65000,
    EducationLevel.DOCTORATE: 100000,
}


@dataclass
class SimulationParams:
    inflation_rate: float = 0.03
    investment_return: float = 0.07
    savings_interest: float = 0.02
    debt_interest_rate: float = 0.07
    home_appreciation: float = 0.04
    avg_children: float = 2.1
    avg_child_birth_age: int = 28
    retirement_age: int = 65
    life_expectancy: int = 82
    monthly_habit_change: float = 0
    starting_debt_modifier: float = 1.0
    financial_literacy_boost: float = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "inflationRate": self.inflation_rate,
            "investmentReturn": self.investment_return,
            "savingsInterest": self.savings_interest,
            "debtInterestRate": self.debt_interest_rate,
            "homeAppreciation": self.home_appreciation,
            "avgChildren": self.avg_children,
            "avgChildBirthAge": self.avg_child_birth_age,
            "retirementAge": self.retirement_age,
            "lifeExpectancy": self.life_expectancy,
            "monthlyHabitChange": self.monthly_habit_change,
            "startingDebtModifier": self.starting_debt_modifier,
            "financialLiteracyBoost": self.financial_literacy_boost,
        }


class FamilyMember:
    def __init__(self, id, name, generation, birth_year, base_income, education,
                 financial_literacy, current_age=0, savings=0, investments=0,
                 debt=0, home_equity=0, owns_home=False, parent_id=None):
        self.id = id
        self.name = name
        self.generation = generation
        self.birth_year = birth_year
        self.base_income = base_income
        self.education = education
        self.financial_literacy = financial_literacy
        self.current_age = current_age
        self.savings = savings
        self.investments = investments
        self.debt = debt
        self.home_equity = home_equity
        self.owns_home = owns_home
        self.inheritance_received = 0
        self.children = []
        self.parent_id = parent_id
        self.financial_history = []
        self.life_events = []

    @property
    def net_worth(self):
        return self.savings + self.investments + self.home_equity - self.debt

    @property
    def annual_income(self):
        multiplier = EDUCATION_INCOME_MULTIPLIER[self.education]
        age_factor = 1 + 0.03 * min(self.current_age - 22, 28) if self.current_age > 22 else 0.5
        return self.base_income * multiplier * age_factor

    @property
    def savings_rate(self):
        base_rate = 0.05
        literacy_bonus = self.financial_literacy * 0.15
        return base_rate + literacy_bonus

    @property
    def financial_health(self):
        if self.net_worth < 0:
            return FinancialHealth.DISTRESSED
        elif self.net_worth < 0.5 * self.annual_income:
            return FinancialHealth.STRUGGLING
        elif self.net_worth < 2 * self.annual_income:
            return FinancialHealth.STABLE
        else:
            return FinancialHealth.THRIVING

    @property
    def branch_thickness(self):
        if self.net_worth <= 0:
            return 0.1
        log_worth = math.log10(max(self.net_worth, 1))
        return min(0.1 + log_worth * 0.15, 1.0)

    @property
    def branch_color(self):
        colors = {
            FinancialHealth.THRIVING: "#22c55e",
            FinancialHealth.STABLE: "#84cc16",
            FinancialHealth.STRUGGLING: "#f59e0b",
            FinancialHealth.DISTRESSED: "#ef4444",
        }
        return colors[self.financial_health]

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "generation": self.generation,
            "birthYear": self.birth_year,
            "currentAge": self.current_age,
            "education": self.education.value,
            "financialLiteracy": round(self.financial_literacy, 2),
            "income": round(self.annual_income, 2),
            "savings": round(self.savings, 2),
            "investments": round(self.investments, 2),
            "debt": round(self.debt, 2),
            "homeEquity": round(self.home_equity, 2),
            "netWorth": round(self.net_worth, 2),
            "ownsHome": self.owns_home,
            "inheritanceReceived": round(self.inheritance_received, 2),
            "financialHealth": self.financial_health.value,
            "branchThickness": round(self.branch_thickness, 3),
            "branchColor": self.branch_color,
            "children": [child.to_dict() for child in self.children],
            "parentId": self.parent_id,
            "financialHistory": self.financial_history,
            "lifeEvents": self.life_events,
        }


class GenerationalSimulator:
    def __init__(self, params: SimulationParams):
        self.params = params
        self.current_year = 2024
        self.id_counter = 0
        self.generation_names = [
            ["Alex", "Jordan", "Taylor", "Morgan", "Casey"],
            ["Riley", "Quinn", "Avery", "Sage", "River"],
            ["Phoenix", "Skyler", "Dakota", "Reese", "Finley"],
            ["Rowan", "Ellis", "Blair", "Emery", "Kendall"],
            ["Eden", "Marlowe", "Lennox", "Sutton", "Campbell"],
        ]

    def _gen_id(self):
        self.id_counter += 1
        return f"m{self.id_counter:04d}"

    def create_founder(self, name="You", age=30, income=55000, savings=5000,
                       debt=25000, education=EducationLevel.SOME_COLLEGE,
                       financial_literacy=0.4):
        adjusted_debt = debt * self.params.starting_debt_modifier
        adjusted_literacy = min(1.0, financial_literacy + self.params.financial_literacy_boost)

        founder = FamilyMember(
            id=self._gen_id(),
            name=name,
            generation=0,
            birth_year=self.current_year - age,
            base_income=income,
            education=education,
            financial_literacy=adjusted_literacy,
            current_age=age,
            savings=savings,
            debt=adjusted_debt,
        )
        self._record_snapshot(founder)
        return founder

    def simulate_year(self, member):
        if member.current_age > self.params.life_expectancy:
            return
        member.current_age += 1
        if member.current_age < 18:
            return

        income = member.annual_income
        savings_rate = member.savings_rate
        habit_annual = self.params.monthly_habit_change * 12
        net_income = income * 0.75
        living_expenses = max(25000, income * 0.45)

        debt_payment = 0
        if member.debt > 0:
            interest = member.debt * self.params.debt_interest_rate
            min_payment = member.debt * 0.15 + interest
            debt_payment = min(min_payment, member.debt + interest)
            member.debt = max(0, member.debt + interest - debt_payment)

        if member.owns_home:
            housing_cost = member.home_equity * 0.025
            member.home_equity *= (1 + self.params.home_appreciation)
        else:
            housing_cost = max(10000, income * 0.22)

        available = net_income - living_expenses - debt_payment - housing_cost + habit_annual

        if available > 0:
            save_amount = available * savings_rate
            investment_portion = member.financial_literacy * 0.6
            member.savings += save_amount * (1 - investment_portion)
            member.investments += save_amount * investment_portion
        else:
            shortfall = abs(available)
            if member.savings >= shortfall:
                member.savings -= shortfall
            else:
                remaining = shortfall - member.savings
                member.savings = 0
                member.debt += remaining * 0.3

        member.savings *= (1 + self.params.savings_interest)
        member.investments *= (1 + self.params.investment_return)
        self._check_life_events(member)
        self._record_snapshot(member)

    def _check_life_events(self, member):
        if not member.owns_home and member.current_age >= 30 and member.debt < 10000:
            down_payment_needed = 40000
            total_liquid = member.savings + member.investments
            if total_liquid >= down_payment_needed * 1.3:
                if member.investments >= down_payment_needed:
                    member.investments -= down_payment_needed
                else:
                    remaining = down_payment_needed - member.investments
                    member.investments = 0
                    member.savings -= remaining
                member.owns_home = True
                member.home_equity = down_payment_needed * 5
                member.life_events.append({
                    "year": self.current_year + member.current_age - member.birth_year,
                    "age": member.current_age,
                    "eventType": "home_purchase",
                    "description": "Purchased first home",
                    "financialImpact": -down_payment_needed
                })

    def _record_snapshot(self, member):
        snapshot = {
            "year": member.birth_year + member.current_age,
            "age": member.current_age,
            "income": round(member.annual_income, 2),
            "savings": round(member.savings, 2),
            "investments": round(member.investments, 2),
            "debt": round(member.debt, 2),
            "homeEquity": round(member.home_equity, 2),
            "netWorth": round(member.net_worth, 2),
            "health": member.financial_health.value
        }
        member.financial_history.append(snapshot)

    def spawn_children(self, parent, num_children=None):
        if num_children is None:
            base = self.params.avg_children
            if parent.financial_health == FinancialHealth.DISTRESSED:
                base *= 0.8
            num_children = max(0, round(random.gauss(base, 0.8)))

        children = []
        gen = parent.generation + 1

        for i in range(num_children):
            base_literacy = parent.financial_literacy * 0.6 + random.uniform(0.1, 0.4)
            if parent.financial_health in [FinancialHealth.THRIVING, FinancialHealth.STABLE]:
                base_literacy += 0.1
            education = self._determine_education(parent)
            name_pool = self.generation_names[min(gen, len(self.generation_names) - 1)]
            name = random.choice(name_pool)

            child = FamilyMember(
                id=self._gen_id(),
                name=name,
                generation=gen,
                birth_year=parent.birth_year + self.params.avg_child_birth_age + (i * 2),
                base_income=45000,
                education=education,
                financial_literacy=min(1.0, base_literacy + self.params.financial_literacy_boost),
                parent_id=parent.id,
                debt=EDUCATION_DEBT[education] * self.params.starting_debt_modifier,
            )
            children.append(child)
            parent.children.append(child)
        return children

    def _determine_education(self, parent):
        probs = {
            EducationLevel.HIGH_SCHOOL: 0.1,
            EducationLevel.SOME_COLLEGE: 0.25,
            EducationLevel.BACHELORS: 0.45,
            EducationLevel.MASTERS: 0.15,
            EducationLevel.DOCTORATE: 0.05,
        }
        if parent.net_worth > 500000:
            probs[EducationLevel.BACHELORS] += 0.1
            probs[EducationLevel.MASTERS] += 0.1
            probs[EducationLevel.HIGH_SCHOOL] -= 0.1
            probs[EducationLevel.SOME_COLLEGE] -= 0.1
        elif parent.net_worth < 50000:
            probs[EducationLevel.HIGH_SCHOOL] += 0.1
            probs[EducationLevel.SOME_COLLEGE] += 0.1
            probs[EducationLevel.MASTERS] -= 0.1
            probs[EducationLevel.DOCTORATE] -= 0.05

        r = random.random()
        cumulative = 0
        for edu, prob in probs.items():
            cumulative += prob
            if r <= cumulative:
                return edu
        return EducationLevel.BACHELORS

    def transfer_wealth(self, parent):
        if not parent.children:
            return
        estate = max(0, parent.net_worth)
        if estate > 0:
            per_child = estate / len(parent.children)
            for child in parent.children:
                child.inheritance_received += per_child
                child.investments += per_child
                child.life_events.append({
                    "year": parent.birth_year + self.params.life_expectancy,
                    "age": child.current_age,
                    "eventType": "inheritance",
                    "description": f"Inherited ${per_child:,.0f} from {parent.name}",
                    "financialImpact": per_child
                })

    def simulate_lifetime(self, member):
        target_age = self.params.life_expectancy
        while member.current_age < target_age:
            self.simulate_year(member)

    def simulate_generations(self, founder, num_generations=4):
        def simulate_branch(member, gen_remaining):
            self.simulate_lifetime(member)
            if gen_remaining <= 0:
                return
            children = self.spawn_children(member)
            self.transfer_wealth(member)
            for child in children:
                simulate_branch(child, gen_remaining - 1)
        simulate_branch(founder, num_generations)
        return founder


def run_comparison_simulation(base_params, scenario_params, num_generations=4):
    random.seed(42)

    education_map = {
        "high_school": EducationLevel.HIGH_SCHOOL,
        "some_college": EducationLevel.SOME_COLLEGE,
        "bachelors": EducationLevel.BACHELORS,
        "masters": EducationLevel.MASTERS,
        "doctorate": EducationLevel.DOCTORATE,
    }

    if isinstance(base_params.get("education"), str):
        base_params["education"] = education_map.get(base_params["education"], EducationLevel.SOME_COLLEGE)

    baseline_sim = GenerationalSimulator(SimulationParams())
    baseline_founder = baseline_sim.create_founder(**base_params)
    baseline_sim.simulate_generations(baseline_founder, num_generations)

    random.seed(42)

    sim_params = scenario_params.get("simulation", {})
    scenario_sim_params = SimulationParams(
        monthly_habit_change=sim_params.get("monthly_habit_change", 0),
        starting_debt_modifier=sim_params.get("starting_debt_modifier", 1.0),
        financial_literacy_boost=sim_params.get("financial_literacy_boost", 0),
    )
    scenario_sim = GenerationalSimulator(scenario_sim_params)

    founder_params = {**base_params, **scenario_params.get("founder", {})}
    scenario_founder = scenario_sim.create_founder(**founder_params)
    scenario_sim.simulate_generations(scenario_founder, num_generations)

    return {
        "baseline": {
            "tree": baseline_founder.to_dict(),
            "params": SimulationParams().to_dict()
        },
        "scenario": {
            "tree": scenario_founder.to_dict(),
            "params": scenario_sim_params.to_dict()
        },
        "summary": generate_comparison_summary(baseline_founder, scenario_founder)
    }


def generate_comparison_summary(baseline, scenario):
    def collect_all_members(root):
        members = [root]
        for child in root.children:
            members.extend(collect_all_members(child))
        return members

    baseline_members = collect_all_members(baseline)
    scenario_members = collect_all_members(scenario)

    def gen_stats(members, gen):
        gen_members = [m for m in members if m.generation == gen]
        if not gen_members:
            return {"count": 0, "avgNetWorth": 0, "totalNetWorth": 0}
        return {
            "count": len(gen_members),
            "avgNetWorth": sum(m.net_worth for m in gen_members) / len(gen_members),
            "totalNetWorth": sum(m.net_worth for m in gen_members),
            "homeOwnership": sum(1 for m in gen_members if m.owns_home) / len(gen_members),
        }

    generations = max(m.generation for m in baseline_members + scenario_members) + 1
    baseline_total = sum(m.net_worth for m in baseline_members)
    scenario_total = sum(m.net_worth for m in scenario_members)

    return {
        "baseline": {
            "totalMembers": len(baseline_members),
            "totalNetWorth": baseline_total,
            "byGeneration": [gen_stats(baseline_members, g) for g in range(generations)]
        },
        "scenario": {
            "totalMembers": len(scenario_members),
            "totalNetWorth": scenario_total,
            "byGeneration": [gen_stats(scenario_members, g) for g in range(generations)]
        },
        "difference": {
            "totalNetWorth": scenario_total - baseline_total,
            "percentChange": (scenario_total - baseline_total) / max(baseline_total, 1) * 100
        }
    }


# ============== CLOUDFLARE WORKERS HANDLER ==============

def json_response(data, status=200):
    """Create a JSON response with CORS headers"""
    headers = Headers.new({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }.items())
    return Response.new(json.dumps(data), status=status, headers=headers)


def handle_cors():
    """Handle CORS preflight requests"""
    headers = Headers.new({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }.items())
    return Response.new(None, status=204, headers=headers)


PRESET_SCENARIOS = {
    "first_gen_wealth_builder": {
        "description": "First-generation wealth builder starting from scratch",
        "founder": {
            "name": "First Gen", "age": 25, "income": 45000,
            "savings": 1000, "debt": 35000, "education": "bachelors",
            "financial_literacy": 0.3
        }
    },
    "breaking_debt_cycle": {
        "description": "Breaking the cycle of generational debt",
        "founder": {
            "name": "Cycle Breaker", "age": 28, "income": 40000,
            "savings": 500, "debt": 45000, "education": "some_college",
            "financial_literacy": 0.5
        }
    },
    "steady_saver": {
        "description": "Moderate income with excellent saving habits",
        "founder": {
            "name": "Steady Saver", "age": 30, "income": 55000,
            "savings": 25000, "debt": 10000, "education": "bachelors",
            "financial_literacy": 0.7
        }
    },
}


async def on_fetch(request, env):
    """Main request handler for Cloudflare Workers"""
    url = request.url
    method = request.method
    path = url.split("?")[0].split("/api")[-1] if "/api" in url else "/"

    # Handle CORS preflight
    if method == "OPTIONS":
        return handle_cors()

    # Health check
    if path == "/health" or path == "":
        return json_response({"status": "healthy", "service": "seedling-api"})

    # Get presets
    if path == "/presets" and method == "GET":
        return json_response({
            "presets": [
                {"name": name, "description": data["description"]}
                for name, data in PRESET_SCENARIOS.items()
            ]
        })

    # Get specific preset
    if path.startswith("/presets/") and method == "GET":
        preset_name = path.split("/presets/")[1]
        if preset_name in PRESET_SCENARIOS:
            return json_response(PRESET_SCENARIOS[preset_name])
        return json_response({"error": f"Preset '{preset_name}' not found"}, status=404)

    # Run simulation
    if path == "/simulate" and method == "POST":
        try:
            body = await request.json()

            founder = body.get("founder", {})
            scenario = body.get("scenario", {})
            num_generations = body.get("num_generations", 4)

            base_params = {
                "name": founder.get("name", "You"),
                "age": founder.get("age", 30),
                "income": founder.get("income", 55000),
                "savings": founder.get("savings", 5000),
                "debt": founder.get("debt", 25000),
                "education": founder.get("education", "some_college"),
                "financial_literacy": founder.get("financial_literacy", 0.4),
            }

            scenario_params = {"simulation": {}, "founder": {}}
            if scenario:
                if scenario.get("monthly_habit_change", 0) != 0:
                    scenario_params["simulation"]["monthly_habit_change"] = scenario["monthly_habit_change"]
                if scenario.get("starting_debt_modifier", 1.0) != 1.0:
                    scenario_params["simulation"]["starting_debt_modifier"] = scenario["starting_debt_modifier"]
                if scenario.get("financial_literacy_boost", 0) > 0:
                    scenario_params["simulation"]["financial_literacy_boost"] = scenario["financial_literacy_boost"]

            result = run_comparison_simulation(base_params, scenario_params, num_generations)
            return json_response(result)
        except Exception as e:
            return json_response({"error": str(e)}, status=500)

    # Habit impact calculator
    if path == "/calculate/habit-impact" and method == "POST":
        try:
            # Parse query params from URL
            query_string = url.split("?")[1] if "?" in url else ""
            params = {}
            for param in query_string.split("&"):
                if "=" in param:
                    key, value = param.split("=")
                    params[key] = value

            monthly_amount = float(params.get("monthly_amount", 50))
            years = int(params.get("years", 30))
            annual_return = float(params.get("annual_return", 0.07))

            monthly_rate = annual_return / 12
            months = years * 12
            future_value = monthly_amount * (((1 + monthly_rate) ** months - 1) / monthly_rate)
            total_contributed = monthly_amount * months
            interest_earned = future_value - total_contributed
            gen_2_value = future_value * ((1 + annual_return) ** 30)
            gen_3_value = gen_2_value * ((1 + annual_return) ** 30)

            return json_response({
                "monthlyAmount": monthly_amount,
                "years": years,
                "annualReturn": annual_return,
                "futureValue": round(future_value, 2),
                "totalContributed": round(total_contributed, 2),
                "interestEarned": round(interest_earned, 2),
                "generationalProjection": {
                    "generation1": round(future_value, 2),
                    "generation2": round(gen_2_value, 2),
                    "generation3": round(gen_3_value, 2),
                },
                "insight": f"${monthly_amount}/month becomes ${future_value:,.0f} in {years} years!"
            })
        except Exception as e:
            return json_response({"error": str(e)}, status=500)

    # 404 for unknown routes
    return json_response({"error": "Not found", "path": path}, status=404)
