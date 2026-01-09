#!/bin/bash

# Seedling - Generational Wealth Time Machine
# Easy start script

set -e

echo "🌱 Starting Seedling..."
echo ""

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the seedling directory"
    exit 1
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
pip install -r requirements.txt --quiet

# Start the backend server
echo "🚀 Starting backend server on http://localhost:8000"
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Give the backend a moment to start
sleep 2

# Start a simple frontend server
echo "🌐 Starting frontend on http://localhost:3000"
cd frontend
python -m http.server 3000 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Seedling is running!"
echo ""
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "👋 Goodbye!"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
