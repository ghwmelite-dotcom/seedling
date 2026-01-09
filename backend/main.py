"""
Seedling - Generational Wealth Time Machine
FastAPI Backend Server

Provides REST API endpoints for running simulations and retrieving results.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import os

from simulation import (
    run_comparison_simulation,
    SimulationParams,
    EducationLevel,
    GenerationalSimulator,
)

app = FastAPI(
    title="Seedling API",
    description="Generational Wealth Time Machine - API",
    version="1.0.0"
)

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FounderInput(BaseModel):
    """Input parameters for the founding family member"""
    name: str = Field(default="You", description="Name of the founder")
    age: int = Field(default=30, ge=18, le=65, description="Current age")
    income: float = Field(default=55000, ge=0, description="Annual income")
    savings: float = Field(default=5000, ge=0, description="Current savings")
    debt: float = Field(default=25000, ge=0, description="Current debt")
    education: str = Field(default="some_college", description="Education level")
    financial_literacy: float = Field(default=0.4, ge=0, le=1, description="Financial literacy score")


class ScenarioModifiers(BaseModel):
    """Modifiers for scenario comparison"""
    monthly_habit_change: float = Field(default=0, description="Monthly savings/spending change")
    starting_debt_modifier: float = Field(default=1.0, ge=0, description="Debt multiplier")
    financial_literacy_boost: float = Field(default=0, ge=0, le=0.5, description="Literacy improvement")
    investment_return: Optional[float] = Field(default=None, description="Override investment return")


class SimulationRequest(BaseModel):
    """Full simulation request"""
    founder: FounderInput = Field(default_factory=FounderInput)
    scenario: Optional[ScenarioModifiers] = Field(default=None)
    num_generations: int = Field(default=4, ge=1, le=6, description="Generations to simulate")


class PresetScenario(BaseModel):
    """Preset scenario for quick simulation"""
    preset_name: str = Field(description="Name of the preset scenario")
    num_generations: int = Field(default=4, ge=1, le=6)


# Preset scenarios for common use cases
PRESET_SCENARIOS = {
    "first_gen_wealth_builder": {
        "description": "First-generation wealth builder starting from scratch",
        "founder": {
            "name": "First Gen",
            "age": 25,
            "income": 45000,
            "savings": 1000,
            "debt": 35000,
            "education": "bachelors",
            "financial_literacy": 0.3
        }
    },
    "breaking_debt_cycle": {
        "description": "Breaking the cycle of generational debt",
        "founder": {
            "name": "Cycle Breaker",
            "age": 28,
            "income": 40000,
            "savings": 500,
            "debt": 45000,
            "education": "some_college",
            "financial_literacy": 0.5
        }
    },
    "high_earner_lifestyle_inflation": {
        "description": "High earner who struggles with lifestyle inflation",
        "founder": {
            "name": "High Earner",
            "age": 32,
            "income": 120000,
            "savings": 8000,
            "debt": 80000,
            "education": "masters",
            "financial_literacy": 0.35
        }
    },
    "steady_saver": {
        "description": "Moderate income with excellent saving habits",
        "founder": {
            "name": "Steady Saver",
            "age": 30,
            "income": 55000,
            "savings": 25000,
            "debt": 10000,
            "education": "bachelors",
            "financial_literacy": 0.7
        }
    },
    "late_starter": {
        "description": "Starting wealth building later in life",
        "founder": {
            "name": "Late Starter",
            "age": 45,
            "income": 70000,
            "savings": 15000,
            "debt": 20000,
            "education": "bachelors",
            "financial_literacy": 0.5
        }
    }
}


@app.get("/")
async def root():
    """Serve the frontend"""
    frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "index.html")
    if os.path.exists(frontend_path):
        return FileResponse(frontend_path)
    return {"message": "Seedling API is running. Frontend not found."}


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "seedling"}


@app.get("/api/presets")
async def get_presets():
    """Get available preset scenarios"""
    return {
        "presets": [
            {"name": name, "description": data["description"]}
            for name, data in PRESET_SCENARIOS.items()
        ]
    }


@app.get("/api/presets/{preset_name}")
async def get_preset_details(preset_name: str):
    """Get details of a specific preset"""
    if preset_name not in PRESET_SCENARIOS:
        raise HTTPException(status_code=404, detail=f"Preset '{preset_name}' not found")
    return PRESET_SCENARIOS[preset_name]


@app.post("/api/simulate")
async def run_simulation(request: SimulationRequest):
    """
    Run a generational wealth simulation.
    
    Returns both baseline and scenario results if scenario modifiers are provided.
    """
    
    # Convert education string to enum
    education_map = {
        "high_school": EducationLevel.HIGH_SCHOOL,
        "some_college": EducationLevel.SOME_COLLEGE,
        "bachelors": EducationLevel.BACHELORS,
        "masters": EducationLevel.MASTERS,
        "doctorate": EducationLevel.DOCTORATE,
    }
    
    education = education_map.get(
        request.founder.education.lower(), 
        EducationLevel.SOME_COLLEGE
    )
    
    base_params = {
        "name": request.founder.name,
        "age": request.founder.age,
        "income": request.founder.income,
        "savings": request.founder.savings,
        "debt": request.founder.debt,
        "education": education,
        "financial_literacy": request.founder.financial_literacy,
    }
    
    # Build scenario params
    scenario_params: Dict[str, Any] = {"simulation": {}, "founder": {}}
    
    if request.scenario:
        if request.scenario.monthly_habit_change != 0:
            scenario_params["simulation"]["monthly_habit_change"] = request.scenario.monthly_habit_change
        if request.scenario.starting_debt_modifier != 1.0:
            scenario_params["simulation"]["starting_debt_modifier"] = request.scenario.starting_debt_modifier
        if request.scenario.financial_literacy_boost > 0:
            scenario_params["simulation"]["financial_literacy_boost"] = request.scenario.financial_literacy_boost
        if request.scenario.investment_return is not None:
            scenario_params["simulation"]["investment_return"] = request.scenario.investment_return
    
    try:
        result = run_comparison_simulation(
            base_params=base_params,
            scenario_params=scenario_params,
            num_generations=request.num_generations
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/simulate/preset")
async def run_preset_simulation(request: PresetScenario):
    """Run simulation using a preset scenario"""
    
    if request.preset_name not in PRESET_SCENARIOS:
        raise HTTPException(status_code=404, detail=f"Preset '{request.preset_name}' not found")
    
    preset = PRESET_SCENARIOS[request.preset_name]
    founder_data = preset["founder"]
    
    # Convert education
    education_map = {
        "high_school": EducationLevel.HIGH_SCHOOL,
        "some_college": EducationLevel.SOME_COLLEGE,
        "bachelors": EducationLevel.BACHELORS,
        "masters": EducationLevel.MASTERS,
        "doctorate": EducationLevel.DOCTORATE,
    }
    
    base_params = {
        "name": founder_data["name"],
        "age": founder_data["age"],
        "income": founder_data["income"],
        "savings": founder_data["savings"],
        "debt": founder_data["debt"],
        "education": education_map.get(founder_data["education"], EducationLevel.SOME_COLLEGE),
        "financial_literacy": founder_data["financial_literacy"],
    }
    
    # Run with $100/month habit change as comparison
    scenario_params = {
        "simulation": {"monthly_habit_change": 100}
    }
    
    try:
        result = run_comparison_simulation(
            base_params=base_params,
            scenario_params=scenario_params,
            num_generations=request.num_generations
        )
        result["preset"] = request.preset_name
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/calculate/habit-impact")
async def calculate_habit_impact(
    monthly_amount: float = 50,
    years: int = 30,
    annual_return: float = 0.07
):
    """
    Calculate the compound impact of a monthly habit change.
    
    Shows what a monthly savings/expense change becomes over time.
    """
    
    # Monthly compound calculation
    monthly_rate = annual_return / 12
    months = years * 12
    
    # Future value of annuity formula
    future_value = monthly_amount * (((1 + monthly_rate) ** months - 1) / monthly_rate)
    
    # Total contributed
    total_contributed = monthly_amount * months
    
    # Interest earned
    interest_earned = future_value - total_contributed
    
    # Generational projection (assume passed to next gen who continues)
    gen_2_value = future_value * ((1 + annual_return) ** 30)  # 30 more years
    gen_3_value = gen_2_value * ((1 + annual_return) ** 30)
    
    return {
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
        "insight": f"${monthly_amount}/month becomes ${future_value:,.0f} in {years} years, "
                   f"and could grow to ${gen_3_value:,.0f} by your grandchildren's generation!"
    }


# Mount static files for frontend (if exists)
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
