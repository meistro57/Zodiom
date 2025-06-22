#!/bin/bash
set -e

# Update the repository
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Pulling latest changes from git..."
    git pull
fi

# Activate Python virtual environment if present
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    . venv/bin/activate
fi

# Install Python dependencies if applicable
if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Install Node.js dependencies
if [ -f "package.json" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Build and start the Node.js application
if [ -f "package.json" ]; then
    echo "Starting the application..."
    npm start
fi
