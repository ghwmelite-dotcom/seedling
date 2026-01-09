#!/usr/bin/env python3
"""
Seedling - Generational Wealth Time Machine
Standalone Terminal Version

Run with: python standalone.py
"""

import sys
import json
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import Enum
import random
import math


# ANSI color codes
class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    
    # Colors
    GREEN = '\033[92m'
    LIME = '\033[93m'
    AMBER = '\033[33m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    GRAY = '\033[90m'
    
    # Backgrounds
    BG_GREEN = '\033[42m'
    BG_RED = '\033[41m'


def colored(text: str, color: str) -> str:
    """Apply color to text"""
    return f"{color}{text}{Colors.RESET}"


def format_currency(value: float) -> str:
    """Format number as currency"""
    if value >= 1_000_000:
        return f"${value/1_000_000:.1f}M"
    elif value >= 1000:
        return f"${value/1000:.0f}K"
    elif value < 0:
        return f"-${abs(value):.0f}"
    return f"${value:.0f}"


class EducationLevel(Enum):
    HIGH_SCHOOL = "high_school"
    SOME_COLLEGE = "some_college"
    BACHELORS = "bachelors"
    MASTERS = "masters"
    DOCTORATE = "doctorate"


EDUCATION_INCOME_MULT = {
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
class FamilyMember:
    name: str
    generation: int
    birth_year: int
    base_income: float
    education: EducationLevel
    financial_literacy: float
    current_age: int = 0
    savings: float = 0
    investments: float = 0
    debt: float = 0
    home_equity: float = 0
    owns_home: bool = False
    children: List['FamilyMember'] = field(default_factory=list)
    
    @property
    def net_worth(self) -> float:
        return self.savings + self.investments + self.home_equity - self.debt
    
    @property
    def annual_income(self) -> float:
        mult = EDUCATION_INCOME_MULT[self.education]
        age_factor = 1 + 0.03 * min(self.current_age - 22, 28) if self.current_age > 22 else 0.5
        return self.base_income * mult * age_factor
    
    @property
    def savings_rate(self) -> float:
        return 0.05 + self.financial_literacy * 0.15
    
    @property
    def health_color(self) -> str:
        nw = self.net_worth
        income = self.annual_income
        if nw < 0:
            return Colors.RED
        elif nw < 0.5 * income:
            return Colors.AMBER
        elif nw < 2 * income:
            return Colors.LIME
        else:
            return Colors.GREEN
    
    @property
    def health_status(self) -> str:
        nw = self.net_worth
        income = self.annual_income
        if nw < 0:
            return "Distressed"
        elif nw < 0.5 * income:
            return "Struggling"
        elif nw < 2 * income:
            return "Stable"
        else:
            return "Thriving"


@dataclass
class SimParams:
    investment_return: float = 0.07
    savings_interest: float = 0.02
    debt_interest_rate: float = 0.07
    home_appreciation: float = 0.04
    retirement_age: int = 65
    life_expectancy: int = 82
    monthly_habit_change: float = 0


class Simulator:
    def __init__(self, params: SimParams):
        self.params = params
        self.names = [
            ["Jordan", "Taylor", "Alex", "Morgan"],
            ["Riley", "Quinn", "Avery", "Sage"],
            ["Phoenix", "Rowan", "Eden", "Blair"],
            ["Skyler", "Dakota", "Reese", "Ellis"],
            ["Lennox", "Marlowe", "Finley", "Campbell"],
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
        return FamilyMember(
            name=name,
            generation=0,
            birth_year=2024 - age,
            base_income=income,
            education=education,
            financial_literacy=financial_literacy,
            current_age=age,
            savings=savings,
            debt=debt,
        )
    
    def simulate_year(self, member: FamilyMember) -> None:
        if member.current_age > self.params.life_expectancy:
            return
        
        member.current_age += 1
        if member.current_age < 18:
            return
        
        income = member.annual_income
        net_income = income * 0.75
        
        # Lifestyle inflation - wealthy people spend more (realistic)
        lifestyle_factor = 1.0
        if member.net_worth > 500000:
            lifestyle_factor = 1.3
        elif member.net_worth > 100000:
            lifestyle_factor = 1.15
        living_expenses = max(25000, income * 0.45) * lifestyle_factor
        
        # Monthly habit change (annualized)
        habit_annual = self.params.monthly_habit_change * 12
        
        # Debt payments - pay down debt aggressively
        debt_payment = 0
        if member.debt > 0:
            interest = member.debt * self.params.debt_interest_rate
            min_payment = member.debt * 0.15 + interest
            debt_payment = min(min_payment, member.debt + interest)
            member.debt = max(0, member.debt + interest - debt_payment)
        
        # Housing
        if member.owns_home:
            housing_cost = member.home_equity * 0.025
            member.home_equity *= (1 + self.params.home_appreciation)
        else:
            housing_cost = max(10000, income * 0.22)
        
        # Calculate what's left after essentials
        available = net_income - living_expenses - debt_payment - housing_cost + habit_annual
        
        if available > 0:
            save_amount = available * member.savings_rate
            inv_portion = member.financial_literacy * 0.6
            
            member.savings += save_amount * (1 - inv_portion)
            member.investments += save_amount * inv_portion
        else:
            shortfall = abs(available)
            if member.savings >= shortfall:
                member.savings -= shortfall
            else:
                remaining = shortfall - member.savings
                member.savings = 0
                member.debt += remaining * 0.3
        
        # Growth on savings and investments
        member.savings *= (1 + self.params.savings_interest)
        
        # Investment returns with diminishing returns at scale
        inv_return = self.params.investment_return
        if member.investments > 2000000:
            inv_return *= 0.7  # Large portfolios harder to maintain high returns
        elif member.investments > 500000:
            inv_return *= 0.85
        member.investments *= (1 + inv_return)
        
        # Home purchase opportunity
        if not member.owns_home and member.current_age >= 30 and member.debt < 10000:
            down_payment = 40000
            total_liquid = member.savings + member.investments
            if total_liquid >= down_payment * 1.3:
                if member.investments >= down_payment:
                    member.investments -= down_payment
                else:
                    remaining = down_payment - member.investments
                    member.investments = 0
                    member.savings -= remaining
                member.owns_home = True
                member.home_equity = down_payment * 5
    
    def simulate_lifetime(self, member: FamilyMember) -> None:
        while member.current_age < self.params.life_expectancy:
            self.simulate_year(member)
    
    def spawn_children(self, parent: FamilyMember, count: int = 2) -> List[FamilyMember]:
        children = []
        gen = parent.generation + 1
        
        for i in range(count):
            literacy = parent.financial_literacy * 0.6 + random.uniform(0.1, 0.4)
            if parent.net_worth > 100000:
                literacy += 0.1
            
            # Education based on parent wealth
            if parent.net_worth > 500000:
                edu = random.choice([EducationLevel.BACHELORS, EducationLevel.MASTERS])
            elif parent.net_worth > 100000:
                edu = random.choice([EducationLevel.SOME_COLLEGE, EducationLevel.BACHELORS])
            else:
                edu = random.choice([EducationLevel.HIGH_SCHOOL, EducationLevel.SOME_COLLEGE])
            
            names = self.names[min(gen, len(self.names) - 1)]
            name = random.choice(names)
            
            child = FamilyMember(
                name=name,
                generation=gen,
                birth_year=parent.birth_year + 28 + i * 2,
                base_income=45000,
                education=edu,
                financial_literacy=min(1.0, literacy),
                debt=EDUCATION_DEBT[edu],
            )
            children.append(child)
            parent.children.append(child)
        
        return children
    
    def transfer_wealth(self, parent: FamilyMember) -> None:
        if not parent.children or parent.net_worth <= 0:
            return
        
        # Estate taxes (simplified - exempt first $1M, then 40% rate)
        estate = parent.net_worth
        if estate > 1000000:
            taxable = estate - 1000000
            taxes = taxable * 0.40
            estate = estate - taxes
        
        per_child = estate / len(parent.children)
        for child in parent.children:
            child.investments += per_child
    
    def simulate_generations(self, founder: FamilyMember, num_gens: int = 4) -> FamilyMember:
        def simulate_branch(member: FamilyMember, gens_left: int):
            self.simulate_lifetime(member)
            if gens_left <= 0:
                return
            children = self.spawn_children(member)
            self.transfer_wealth(member)
            for child in children:
                simulate_branch(child, gens_left - 1)
        
        simulate_branch(founder, num_gens)
        return founder


def collect_members(root: FamilyMember) -> List[FamilyMember]:
    """Flatten family tree"""
    members = [root]
    for child in root.children:
        members.extend(collect_members(child))
    return members


def print_tree(root: FamilyMember, indent: int = 0):
    """Print family tree visualization"""
    prefix = "  " * indent
    connector = "├── " if indent > 0 else ""
    
    # Format member line
    color = root.health_color
    status = colored(root.health_status[:3], color)
    name = colored(f"{root.name}", Colors.WHITE + Colors.BOLD)
    worth = colored(format_currency(root.net_worth), color)
    home = "🏠" if root.owns_home else "  "
    
    print(f"{prefix}{connector}{name} (Gen {root.generation + 1}) {home} {worth} [{status}]")
    
    for i, child in enumerate(root.children):
        print_tree(child, indent + 1)


def print_comparison(baseline: FamilyMember, scenario: FamilyMember, habit_change: float):
    """Print side-by-side comparison"""
    print("\n" + "=" * 70)
    print(colored("🌱 SEEDLING - Generational Wealth Time Machine", Colors.GREEN + Colors.BOLD))
    print("=" * 70)
    
    print(f"\n{colored('Scenario:', Colors.CYAN)} +${habit_change:.0f}/month savings habit")
    
    # Collect all members
    base_members = collect_members(baseline)
    scen_members = collect_members(scenario)
    
    base_total = sum(m.net_worth for m in base_members)
    scen_total = sum(m.net_worth for m in scen_members)
    diff = scen_total - base_total
    
    print("\n" + "-" * 70)
    print(colored("📊 CURRENT PATH", Colors.BLUE + Colors.BOLD))
    print("-" * 70)
    print_tree(baseline)
    print(f"\n{Colors.DIM}Total Family Wealth: {colored(format_currency(base_total), Colors.BLUE)}{Colors.RESET}")
    
    print("\n" + "-" * 70)
    print(colored("🌱 WITH HABIT CHANGE", Colors.GREEN + Colors.BOLD))
    print("-" * 70)
    print_tree(scenario)
    print(f"\n{Colors.DIM}Total Family Wealth: {colored(format_currency(scen_total), Colors.GREEN)}{Colors.RESET}")
    
    # Summary
    print("\n" + "=" * 70)
    print(colored("💰 IMPACT SUMMARY", Colors.CYAN + Colors.BOLD))
    print("=" * 70)
    
    diff_color = Colors.GREEN if diff > 0 else Colors.RED
    pct = (diff / base_total * 100) if base_total != 0 else 0
    
    print(f"\n  Family Wealth Difference: {colored(f'+{format_currency(diff)}' if diff > 0 else format_currency(diff), diff_color + Colors.BOLD)}")
    print(f"  Percentage Change: {colored(f'{pct:+.1f}%', diff_color)}")
    
    # By generation
    print(f"\n  {Colors.DIM}By Generation:{Colors.RESET}")
    max_gen = max(m.generation for m in base_members + scen_members) + 1
    
    for gen in range(max_gen):
        base_gen = [m for m in base_members if m.generation == gen]
        scen_gen = [m for m in scen_members if m.generation == gen]
        
        base_avg = sum(m.net_worth for m in base_gen) / len(base_gen) if base_gen else 0
        scen_avg = sum(m.net_worth for m in scen_gen) / len(scen_gen) if scen_gen else 0
        gen_diff = scen_avg - base_avg
        
        diff_str = colored(f"+{format_currency(gen_diff)}" if gen_diff > 0 else format_currency(gen_diff), 
                          Colors.GREEN if gen_diff > 0 else Colors.RED)
        
        print(f"    Gen {gen + 1}: {format_currency(base_avg)} → {format_currency(scen_avg)} ({diff_str})")
    
    # Insight
    print("\n" + "-" * 70)
    print(f"{Colors.GREEN}🌳 Your ${habit_change:.0f}/month today creates {format_currency(diff)} more wealth")
    print(f"   for your entire family tree across generations!{Colors.RESET}")
    print("-" * 70 + "\n")


def get_user_input() -> Dict[str, Any]:
    """Interactive input collection"""
    print("\n" + colored("🌱 SEEDLING - Generational Wealth Time Machine", Colors.GREEN + Colors.BOLD))
    print("=" * 50)
    print("\nEnter your current financial situation:")
    print(colored("(Press Enter for defaults)", Colors.DIM))
    
    def get_float(prompt: str, default: float) -> float:
        val = input(f"  {prompt} [{default}]: ").strip()
        return float(val) if val else default
    
    def get_int(prompt: str, default: int) -> int:
        val = input(f"  {prompt} [{default}]: ").strip()
        return int(val) if val else default
    
    name = input(f"  Your name [You]: ").strip() or "You"
    age = get_int("Your age", 30)
    income = get_float("Annual income ($)", 55000)
    savings = get_float("Current savings ($)", 5000)
    debt = get_float("Current debt ($)", 25000)
    
    print(f"\n  Education level:")
    print(f"    1. High School")
    print(f"    2. Some College")
    print(f"    3. Bachelor's")
    print(f"    4. Master's")
    print(f"    5. Doctorate")
    edu_choice = input(f"  Select [2]: ").strip() or "2"
    edu_map = {
        "1": EducationLevel.HIGH_SCHOOL,
        "2": EducationLevel.SOME_COLLEGE,
        "3": EducationLevel.BACHELORS,
        "4": EducationLevel.MASTERS,
        "5": EducationLevel.DOCTORATE,
    }
    education = edu_map.get(edu_choice, EducationLevel.SOME_COLLEGE)
    
    literacy = get_float("Financial literacy (0-1)", 0.4)
    
    print(f"\n{colored('What-If Scenario:', Colors.CYAN)}")
    habit_change = get_float("Extra monthly savings ($)", 100)
    generations = get_int("Generations to simulate", 4)
    
    return {
        "name": name,
        "age": age,
        "income": income,
        "savings": savings,
        "debt": debt,
        "education": education,
        "financial_literacy": min(1.0, max(0, literacy)),
        "habit_change": habit_change,
        "generations": generations,
    }


def run_demo():
    """Run with default values"""
    print("\n" + colored("Running demo with default values...", Colors.DIM))
    
    random.seed(42)
    
    # Baseline - 3 generations for realistic numbers
    base_sim = Simulator(SimParams())
    baseline = base_sim.create_founder()
    base_sim.simulate_generations(baseline, 3)
    
    # Scenario
    random.seed(42)
    scen_sim = Simulator(SimParams(monthly_habit_change=100))
    scenario = scen_sim.create_founder()
    scen_sim.simulate_generations(scenario, 3)
    
    print_comparison(baseline, scenario, 100)


def main():
    """Main entry point"""
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        run_demo()
        return
    
    try:
        params = get_user_input()
    except (KeyboardInterrupt, EOFError):
        print("\n\nRunning demo instead...")
        run_demo()
        return
    
    random.seed(42)
    
    # Baseline simulation
    base_sim = Simulator(SimParams())
    baseline = base_sim.create_founder(
        name=params["name"],
        age=params["age"],
        income=params["income"],
        savings=params["savings"],
        debt=params["debt"],
        education=params["education"],
        financial_literacy=params["financial_literacy"],
    )
    base_sim.simulate_generations(baseline, params["generations"])
    
    # Scenario simulation
    random.seed(42)
    scen_sim = Simulator(SimParams(monthly_habit_change=params["habit_change"]))
    scenario = scen_sim.create_founder(
        name=params["name"],
        age=params["age"],
        income=params["income"],
        savings=params["savings"],
        debt=params["debt"],
        education=params["education"],
        financial_literacy=params["financial_literacy"],
    )
    scen_sim.simulate_generations(scenario, params["generations"])
    
    print_comparison(baseline, scenario, params["habit_change"])


if __name__ == "__main__":
    main()
