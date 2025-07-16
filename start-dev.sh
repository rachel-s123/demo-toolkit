#!/bin/bash

# Load environment variables from .env if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi


# Kill any existing processes on our ports
echo "🧹 Cleaning up existing processes..."
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be freed
sleep 1

echo "🚀 Starting API server..."
npm run api &
API_PID=$!

# Wait for API to start
sleep 2

echo "🌐 Starting frontend..."
npm run dev &
DEV_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $API_PID 2>/dev/null || true
    kill $DEV_PID 2>/dev/null || true
    lsof -ti:5173,3001 | xargs kill -9 2>/dev/null || true
    exit 0
}

# Trap signals to cleanup properly
trap cleanup SIGINT SIGTERM

echo "✅ Both services started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔌 API: http://localhost:3001"
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait $API_PID $DEV_PID 
