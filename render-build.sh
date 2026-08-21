#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "===> Building React Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "===> Installing Python Dependencies..."
pip install -r requirements.txt
