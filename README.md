# 🌱 Seedling - Generational Wealth Time Machine

<div align="center">

**Visualize how your financial decisions today ripple through generations**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 🎯 What is Seedling?

Seedling is an interactive **Generational Wealth Time Machine** that transforms abstract "compound interest" into emotional, visual stakes. Watch your family tree grow where branches thicken or wither based on compound choices across 3, 4, or 5 generations.

> *"Small seeds today become mighty trees tomorrow."*

---

## ✨ Features

### 🌳 **Interactive Family Tree Visualization**
- Animated 2D family tree with dramatic particle effects
- Color-coded financial health indicators (thriving, growing, stable, distressed)
- Sparkles, leaves, coins, and confetti bursts when nodes appear
- Smooth staggered animations generation by generation
- Side-by-side comparison of baseline vs. scenario paths

### ⏱️ **Timeline Scrubber**
- Travel through time year-by-year with animated slider
- Play/pause with adjustable speed (0.5x - 4x)
- Milestone markers for key generational moments
- Glowing progress bar with shimmer effects

### 🤖 **AI Financial Coach**
- Intelligent chat interface for financial advice
- Context-aware responses based on your simulation data
- Pre-suggested questions for quick exploration
- Topics: investing, real estate, education ROI, small habits, legacy planning

### 🏆 **Achievement System**
- **16 unique achievements** across 6 categories
- Progress tracking with points system
- Animated unlock popups with celebrations
- Categories: Getting Started, Wealth Building, Legacy, Financial Health, Tool Mastery, Strategy Expert

### 📊 **Wealth Analytics Dashboard**
- **4 interactive chart types**: Area, Pie, Bar, Radar
- Wealth by generation visualization
- Financial health distribution breakdown
- 50-year wealth projection timeline
- Key stat cards with animations

### 📚 **Scenario Library**
- **12 pre-built "what-if" scenarios**:
  - ☕ Coffee Shop to Empire
  - 🐦 Early Bird Investor
  - 🏠 Homeowner's Edge
  - 🎓 Education Multiplier
  - 💼 Side Hustle Success
  - 🐷 Frugal Family Fortune
  - And 6 more!
- Difficulty ratings and category filters
- One-click scenario execution

### 📄 **PDF Report Generator**
- Multi-page professional wealth reports
- Beautiful cover page with branding
- Executive summary with key metrics
- Family members detail table
- Generational wealth breakdown
- Automatic download

### 🔊 **Sound Design System**
- Procedural audio using Web Audio API
- 7 unique sound effects (pop, click, success, coin, levelUp, whoosh, error)
- Optional ambient music
- Volume control and master toggles

### ☕ **Habit Impact Calculator**
- See how daily habits compound over decades
- Real-time calculations as you type
- Visual representation of long-term impact

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/ghwmelite-dotcom/seedling.git
cd seedling

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Running the App

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 🎮 Usage

### Running a Simulation
1. Enter starting parameters (age, income, savings rate)
2. Set your monthly habit change amount
3. Click **"Grow My Tree"** and watch the magic happen!

### Navigation
Use the sidebar to access different features:
- 🌱 **Simulator** - Run wealth simulations
- 📊 **Analytics** - View interactive charts
- 📚 **Scenarios** - Explore pre-built what-ifs
- 🏆 **Achievements** - Track your progress
- 🤖 **AI Coach** - Get personalized advice
- 📄 **Report** - Generate PDF reports
- ⚙️ **Settings** - Sound and preferences

### Branch Visualization
- **Thickness**: Logarithmic scale of net worth
- **Colors**:
  - 🟢 Green: Thriving (net worth > 2x income)
  - 🟡 Lime: Growing (net worth > 0.5x income)
  - 🟠 Amber: Stable (net worth > 0)
  - 🔴 Red: Distressed (negative net worth)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool & Dev Server |
| TailwindCSS | Utility-First Styling |
| Framer Motion | Animations |
| Recharts | Data Visualization |
| Zustand | State Management |
| jsPDF | PDF Generation |
| Web Audio API | Procedural Sound |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | Python Web Framework |
| Uvicorn | ASGI Server |
| Pydantic | Data Validation |

---

## 📁 Project Structure

```
seedling/
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── FamilyTree.jsx   # Tree visualization
│   │   │   ├── TreeNode.jsx     # Individual nodes
│   │   │   ├── Particles.jsx    # Particle effects
│   │   │   ├── AICoach.jsx      # AI chat interface
│   │   │   ├── AnalyticsDashboard.jsx
│   │   │   ├── AchievementSystem.jsx
│   │   │   ├── ScenarioLibrary.jsx
│   │   │   ├── TimelineScrubber.jsx
│   │   │   ├── PDFReportGenerator.jsx
│   │   │   ├── SoundSystem.jsx
│   │   │   └── Navigation.jsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── store/               # Zustand state store
│   │   ├── utils/               # Utility functions
│   │   └── App.jsx              # Main application
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/
│   ├── main.py                  # FastAPI application
│   ├── simulation.py            # Wealth simulation engine
│   └── requirements.txt
├── standalone/
│   └── standalone.py            # CLI version
└── README.md
```

---

## 🔧 API Endpoints

### Run Simulation
```bash
POST /api/simulate
```

### Preset Scenarios
```bash
GET /api/presets                    # List all presets
GET /api/presets/{preset_name}      # Get preset details
POST /api/simulate/preset           # Run preset simulation
```

### Habit Calculator
```bash
POST /api/calculate/habit-impact?monthly_amount=50&years=30&annual_return=0.07
```

### Health Check
```bash
GET /api/health
```

---

## 🎨 Design System

### Colors
- 🌿 **Seedling Green** `#22c55e` - Growth and prosperity
- 🌊 **Ocean Blue** `#3b82f6` - Stability and trust
- ⚠️ **Warning Red** `#ef4444` - Financial distress
- ✨ **Gold** `#fbbf24` - Achievements and wealth
- 🌙 **Slate Dark** `#0f172a` - Background

### Animations
- Node pop-in with bounce
- Staggered generation reveals
- Particle bursts (sparkles, leaves, confetti)
- Smooth panel transitions
- Pulsing glow effects

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by the power of compound interest and generational thinking
- Built for financial literacy education
- Special thanks to all contributors

---

<div align="center">

### 🌱 Your legacy starts with a single seed.

**Built with 💚 for first-generation wealth builders**

*Small seeds grow mighty trees. Start planting today.*

</div>
