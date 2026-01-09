"""
Seedling - Generational Wealth Time Machine
Core Simulation Engine

This module models financial decisions across multiple generations,
accounting for compound interest, debt dynamics, wealth transfer,
and behavioral inheritance.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import Enum
import random
import math
from uuid import uuid4


class EducationLevel(Enum):
    HIGH_SCHOOL = "high_school"
    SOME_COLLEGE = "some_college"
    BACHELORS = "bachelors"
    MASTERS = "masters"
    DOCTORATE = "doctorate"


class FinancialHealth(Enum):
    THRIVING = "thriving"      # Net worth > 2x annual income
    STABLE = "stable"          # Net worth > 0.5x annual income
    STRUGGLING = "struggling"  # Net worth > 0, but < 0.5x income
    DISTRESSED = "distressed"  # Negative net worth


# Income multipliers by education level (median data-inspired)
EDUCATION_INCOME_MULTIPLIER = {
    EducationLevel.HIGH_SCHOOL: 1.0,
    EducationLevel.SOME_COLLEGE: 1.2,
    EducationLevel.BACHELORS: 1.65,
    EducationLevel.MASTERS: 2.0,
    EducationLevel.DOCTORATE: 2.4,
}

# Average student debt by education level
EDUCATION_DEBT = {
    EducationLevel.HIGH_SCHOOL: 0,
    EducationLevel.SOME_COLLEGE: 12000,
    EducationLevel.BACHELORS: 35000,
    EducationLevel.MASTERS: 65000,
    EducationLevel.DOCTORATE: 100000,
}


@dataclass
class FinancialSnapshot:
    """Point-in-time financial state"""
    year: int
    age: int
    income: float
    savings: float
    investments: float
    debt: float
    home_equity: float
    net_worth: float
    health: FinancialHealth
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "year": self.year,
            "age": self.age,
            "income": round(self.income, 2),
            "savings": round(self.savings, 2),
            "investments": round(self.investments, 2),
            "debt": round(self.debt, 2),
            "homeEquity": round(self.home_equity, 2),
            "netWorth": round(self.net_worth, 2),
            "health": self.health.value
        }


@dataclass
class LifeEvent:
    """Significant life event that affects finances"""
    year: int
    age: int
    event_type: str
    description: str
    financial_impact: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "year": self.year,
            "age": self.age,
            "eventType": self.event_type,
            "description": self.description,
            "financialImpact": round(self.financial_impact, 2)
        }


@dataclass
class FamilyMember:
    """Represents one person in the family tree"""
    id: str
    name: str
    generation: int
    birth_year: int
    
    # Financial parameters
    base_income: float
    education: EducationLevel
    financial_literacy: float  # 0-1, affects savings rate & decisions
    
    # State tracking
    current_age: int = 0
    savings: float = 0
    investments: float = 0
    debt: float = 0
    home_equity: float = 0
    owns_home: bool = False
    
    # Inheritance received
    inheritance_received: float = 0
    
    # Family connections
    children: List['FamilyMember'] = field(default_factory=list)
    parent_id: Optional[str] = None
    
    # History
    financial_history: List[FinancialSnapshot] = field(default_factory=list)
    life_events: List[LifeEvent] = field(default_factory=list)
    
    @property
    def net_worth(self) -> float:
        return self.savings + self.investments + self.home_equity - self.debt
    
    @property
    def annual_income(self) -> float:
        multiplier = EDUCATION_INCOME_MULTIPLIER[self.education]
        # Income grows with age, peaks around 50
        age_factor = 1 + 0.03 * min(self.current_age - 22, 28) if self.current_age > 22 else 0.5
        return self.base_income * multiplier * age_factor
    
    @property
    def savings_rate(self) -> float:
        """Savings rate influenced by financial literacy"""
        base_rate = 0.05  # 5% baseline
        literacy_bonus = self.financial_literacy * 0.15  # Up to 15% more
        return base_rate + literacy_bonus
    
    @property
    def financial_health(self) -> FinancialHealth:
        if self.net_worth < 0:
            return FinancialHealth.DISTRESSED
        elif self.net_worth < 0.5 * self.annual_income:
            return FinancialHealth.STRUGGLING
        elif self.net_worth < 2 * self.annual_income:
            return FinancialHealth.STABLE
        else:
            return FinancialHealth.THRIVING
    
    @property
    def branch_thickness(self) -> float:
        """Visual indicator for tree rendering (0-1 scale)"""
        # Log scale to handle wide range of net worth
        if self.net_worth <= 0:
            return 0.1
        log_worth = math.log10(max(self.net_worth, 1))
        # Normalize: $1k = 0.2, $100k = 0.5, $1M = 0.7, $10M = 0.9
        return min(0.1 + log_worth * 0.15, 1.0)
    
    @property
    def branch_color(self) -> str:
        """Color based on financial health"""
        colors = {
            FinancialHealth.THRIVING: "#22c55e",    # Green
            FinancialHealth.STABLE: "#84cc16",      # Lime
            FinancialHealth.STRUGGLING: "#f59e0b",  # Amber
            FinancialHealth.DISTRESSED: "#ef4444",  # Red
        }
        return colors[self.financial_health]
    
    def to_dict(self) -> Dict[str, Any]:
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
            "financialHistory": [h.to_dict() for h in self.financial_history],
            "lifeEvents": [e.to_dict() for e in self.life_events],
        }


@dataclass
class SimulationParams:
    """Parameters controlling the simulation"""
    # Economic assumptions
    inflation_rate: float = 0.03
    investment_return: float = 0.07
    savings_interest: float = 0.02
    debt_interest_rate: float = 0.07
    home_appreciation: float = 0.04
    
    # Life assumptions
    avg_children: float = 2.1
    avg_child_birth_age: int = 28
    retirement_age: int = 65
    life_expectancy: int = 82
    
    # Scenario modifiers
    monthly_habit_change: float = 0  # Extra monthly savings/spending
    starting_debt_modifier: float = 1.0  # Multiplier on starting debt
    financial_literacy_boost: float = 0  # Added to base literacy
    
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


class GenerationalSimulator:
    """
    Core simulation engine that models financial decisions
    across multiple generations.
    """
    
    def __init__(self, params: SimulationParams):
        self.params = params
        self.current_year = 2024
        self.generation_names = [
            ["Alex", "Jordan", "Taylor", "Morgan", "Casey"],
            ["Riley", "Quinn", "Avery", "Sage", "River"],
            ["Phoenix", "Skyler", "Dakota", "Reese", "Finley"],
            ["Rowan", "Ellis", "Blair", "Emery", "Kendall"],
            ["Eden", "Marlowe", "Lennox", "Sutton", "Campbell"],
        ]
    
    def create_founder(
        self,
        name: str = "You",
        age: int = 30,
        income: float = 55000,
        savings: float = 5000,
        debt: float = 25000,
        education: EducationLevel = EducationLevel.SOME_COLLEGE,
        financial_literacy: float = 0.4
    ) -> FamilyMember:
        """Create the founding member (generation 0)"""
        
        # Apply scenario modifiers
        adjusted_debt = debt * self.params.starting_debt_modifier
        adjusted_literacy = min(1.0, financial_literacy + self.params.financial_literacy_boost)
        
        founder = FamilyMember(
            id=str(uuid4())[:8],
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
        
        # Record initial state
        self._record_snapshot(founder)
        
        return founder
    
    def simulate_year(self, member: FamilyMember) -> None:
        """Simulate one year of financial life"""
        
        if member.current_age > self.params.life_expectancy:
            return
        
        member.current_age += 1
        
        # Skip if too young to have finances
        if member.current_age < 18:
            return
        
        income = member.annual_income
        savings_rate = member.savings_rate
        
        # Monthly habit change impact (annualized)
        habit_annual = self.params.monthly_habit_change * 12
        
        # --- INCOME PHASE ---
        # After-tax income (simplified ~25% effective rate)
        net_income = income * 0.75
        
        # --- EXPENSE PHASE ---
        # Basic living expenses (scales with income but has floor)
        living_expenses = max(25000, income * 0.45)
        
        # Debt payments - more aggressive paydown
        debt_payment = 0
        if member.debt > 0:
            # Interest accrues first
            interest = member.debt * self.params.debt_interest_rate
            # Pay at least 15% of principal plus interest, or pay it all off
            min_payment = member.debt * 0.15 + interest
            debt_payment = min(min_payment, member.debt + interest)
            member.debt = max(0, member.debt + interest - debt_payment)
        
        # Housing costs
        if member.owns_home:
            housing_cost = member.home_equity * 0.025  # Property tax, maintenance, insurance
            member.home_equity *= (1 + self.params.home_appreciation)
        else:
            housing_cost = max(10000, income * 0.22)  # Rent
        
        # --- SAVINGS PHASE ---
        available = net_income - living_expenses - debt_payment - housing_cost + habit_annual
        
        if available > 0:
            # Split between savings and investments based on literacy
            save_amount = available * savings_rate
            investment_portion = member.financial_literacy * 0.6
            
            member.savings += save_amount * (1 - investment_portion)
            member.investments += save_amount * investment_portion
        else:
            # Negative available - dip into savings or accumulate some debt
            shortfall = abs(available)
            if member.savings >= shortfall:
                member.savings -= shortfall
            else:
                remaining = shortfall - member.savings
                member.savings = 0
                # Only 30% of shortfall becomes debt (rest is lifestyle reduction)
                member.debt += remaining * 0.3
        
        # --- GROWTH PHASE ---
        member.savings *= (1 + self.params.savings_interest)
        member.investments *= (1 + self.params.investment_return)
        
        # --- LIFE EVENTS ---
        self._check_life_events(member)
        
        # Record state
        self._record_snapshot(member)
    
    def _check_life_events(self, member: FamilyMember) -> None:
        """Check and trigger life events"""
        
        # First home purchase - require low debt
        if not member.owns_home and member.current_age >= 30 and member.debt < 10000:
            down_payment_needed = 40000
            total_liquid = member.savings + member.investments
            if total_liquid >= down_payment_needed * 1.3:
                # Can afford a home
                if member.investments >= down_payment_needed:
                    member.investments -= down_payment_needed
                else:
                    remaining = down_payment_needed - member.investments
                    member.investments = 0
                    member.savings -= remaining
                
                member.owns_home = True
                member.home_equity = down_payment_needed * 5  # 20% down on home value
                
                member.life_events.append(LifeEvent(
                    year=self.current_year + member.current_age - member.birth_year,
                    age=member.current_age,
                    event_type="home_purchase",
                    description=f"Purchased first home",
                    financial_impact=-down_payment_needed
                ))
        
        # Children (handled in spawn_generation)
        
        # Retirement
        if member.current_age == self.params.retirement_age:
            member.life_events.append(LifeEvent(
                year=self.current_year + member.current_age - member.birth_year,
                age=member.current_age,
                event_type="retirement",
                description=f"Retired with ${member.net_worth:,.0f} net worth",
                financial_impact=0
            ))
        
        # Wealth milestones
        milestones = [100000, 500000, 1000000, 5000000]
        for milestone in milestones:
            already_achieved = any(
                e.event_type == f"milestone_{milestone}" 
                for e in member.life_events
            )
            if member.net_worth >= milestone and not already_achieved:
                member.life_events.append(LifeEvent(
                    year=self.current_year + member.current_age - member.birth_year,
                    age=member.current_age,
                    event_type=f"milestone_{milestone}",
                    description=f"Reached ${milestone:,} net worth!",
                    financial_impact=0
                ))
    
    def _record_snapshot(self, member: FamilyMember) -> None:
        """Record current financial state"""
        snapshot = FinancialSnapshot(
            year=member.birth_year + member.current_age,
            age=member.current_age,
            income=member.annual_income,
            savings=member.savings,
            investments=member.investments,
            debt=member.debt,
            home_equity=member.home_equity,
            net_worth=member.net_worth,
            health=member.financial_health
        )
        member.financial_history.append(snapshot)
    
    def spawn_children(self, parent: FamilyMember, num_children: int = None) -> List[FamilyMember]:
        """Create next generation members"""
        
        if num_children is None:
            # Random but influenced by financial stability
            base = self.params.avg_children
            if parent.financial_health == FinancialHealth.DISTRESSED:
                base *= 0.8
            num_children = max(0, round(random.gauss(base, 0.8)))
        
        children = []
        gen = parent.generation + 1
        
        for i in range(num_children):
            # Child inherits some financial literacy (nature + nurture)
            base_literacy = parent.financial_literacy * 0.6 + random.uniform(0.1, 0.4)
            
            # Wealthier parents often provide better financial education
            if parent.financial_health in [FinancialHealth.THRIVING, FinancialHealth.STABLE]:
                base_literacy += 0.1
            
            # Education influenced by parent wealth and literacy
            education = self._determine_education(parent)
            
            # Name selection
            name_pool = self.generation_names[min(gen, len(self.generation_names) - 1)]
            name = random.choice(name_pool)
            
            child = FamilyMember(
                id=str(uuid4())[:8],
                name=name,
                generation=gen,
                birth_year=parent.birth_year + self.params.avg_child_birth_age + (i * 2),
                base_income=45000,  # Starting income (will be modified by education)
                education=education,
                financial_literacy=min(1.0, base_literacy + self.params.financial_literacy_boost),
                parent_id=parent.id,
                debt=EDUCATION_DEBT[education] * self.params.starting_debt_modifier,
            )
            
            children.append(child)
            parent.children.append(child)
        
        return children
    
    def _determine_education(self, parent: FamilyMember) -> EducationLevel:
        """Determine child's education level based on parent factors"""
        
        # Base probabilities
        probs = {
            EducationLevel.HIGH_SCHOOL: 0.1,
            EducationLevel.SOME_COLLEGE: 0.25,
            EducationLevel.BACHELORS: 0.45,
            EducationLevel.MASTERS: 0.15,
            EducationLevel.DOCTORATE: 0.05,
        }
        
        # Adjust based on parent wealth
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
        
        # Random selection based on probabilities
        r = random.random()
        cumulative = 0
        for edu, prob in probs.items():
            cumulative += prob
            if r <= cumulative:
                return edu
        
        return EducationLevel.BACHELORS
    
    def transfer_wealth(self, parent: FamilyMember) -> None:
        """Transfer wealth from parent to children upon death"""
        
        if not parent.children:
            return
        
        # Estate (simplified - no taxes for small estates)
        estate = max(0, parent.net_worth)
        
        if estate > 0:
            per_child = estate / len(parent.children)
            
            for child in parent.children:
                child.inheritance_received += per_child
                child.investments += per_child  # Inheritance goes to investments
                
                child.life_events.append(LifeEvent(
                    year=parent.birth_year + self.params.life_expectancy,
                    age=child.current_age,
                    event_type="inheritance",
                    description=f"Inherited ${per_child:,.0f} from {parent.name}",
                    financial_impact=per_child
                ))
    
    def simulate_lifetime(self, member: FamilyMember) -> None:
        """Simulate entire lifetime for a member"""
        
        target_age = self.params.life_expectancy
        
        while member.current_age < target_age:
            self.simulate_year(member)
    
    def simulate_generations(
        self,
        founder: FamilyMember,
        num_generations: int = 4
    ) -> FamilyMember:
        """
        Simulate multiple generations starting from founder.
        Returns the founder with all descendants attached.
        """
        
        def simulate_branch(member: FamilyMember, gen_remaining: int):
            # Simulate this member's life
            self.simulate_lifetime(member)
            
            if gen_remaining <= 0:
                return
            
            # Spawn children when member reaches child-bearing age
            children = self.spawn_children(member)
            
            # Transfer wealth when parent dies
            self.transfer_wealth(member)
            
            # Recursively simulate children
            for child in children:
                simulate_branch(child, gen_remaining - 1)
        
        simulate_branch(founder, num_generations)
        return founder


def run_comparison_simulation(
    base_params: Dict[str, Any],
    scenario_params: Dict[str, Any],
    num_generations: int = 4
) -> Dict[str, Any]:
    """
    Run two simulations: baseline and with scenario changes.
    Returns both trees for comparison.
    """
    
    # Seed for reproducibility in comparison
    random.seed(42)
    
    # Baseline simulation
    baseline_sim = GenerationalSimulator(SimulationParams())
    baseline_founder = baseline_sim.create_founder(**base_params)
    baseline_sim.simulate_generations(baseline_founder, num_generations)
    
    # Reset seed for fair comparison
    random.seed(42)
    
    # Scenario simulation
    scenario_sim_params = SimulationParams(**scenario_params.get("simulation", {}))
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


def generate_comparison_summary(baseline: FamilyMember, scenario: FamilyMember) -> Dict[str, Any]:
    """Generate summary statistics comparing two scenarios"""
    
    def collect_all_members(root: FamilyMember) -> List[FamilyMember]:
        members = [root]
        for child in root.children:
            members.extend(collect_all_members(child))
        return members
    
    baseline_members = collect_all_members(baseline)
    scenario_members = collect_all_members(scenario)
    
    def gen_stats(members: List[FamilyMember], gen: int) -> Dict[str, float]:
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
    
    return {
        "baseline": {
            "totalMembers": len(baseline_members),
            "totalNetWorth": sum(m.net_worth for m in baseline_members),
            "byGeneration": [gen_stats(baseline_members, g) for g in range(generations)]
        },
        "scenario": {
            "totalMembers": len(scenario_members),
            "totalNetWorth": sum(m.net_worth for m in scenario_members),
            "byGeneration": [gen_stats(scenario_members, g) for g in range(generations)]
        },
        "difference": {
            "totalNetWorth": (
                sum(m.net_worth for m in scenario_members) - 
                sum(m.net_worth for m in baseline_members)
            ),
            "percentChange": (
                (sum(m.net_worth for m in scenario_members) - sum(m.net_worth for m in baseline_members)) /
                max(sum(m.net_worth for m in baseline_members), 1) * 100
            )
        }
    }


if __name__ == "__main__":
    # Quick test
    import json
    
    result = run_comparison_simulation(
        base_params={
            "name": "You",
            "age": 30,
            "income": 55000,
            "savings": 5000,
            "debt": 25000,
        },
        scenario_params={
            "simulation": {
                "monthly_habit_change": 200  # Save $200 more per month
            }
        },
        num_generations=3
    )
    
    print(json.dumps(result["summary"], indent=2))
