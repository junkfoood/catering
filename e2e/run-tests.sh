#!/bin/bash

# Run Playwright tests for the catering application
echo "🚀 Starting Playwright tests..."

# Check if the development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Development server not running on localhost:3000"
    echo "Please start the development server first with: pnpm dev"
    exit 1
fi

# Run the tests
echo "📋 Running tests..."
npx playwright test

# Check if tests passed
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed. Check the output above for details."
    exit 1
fi 