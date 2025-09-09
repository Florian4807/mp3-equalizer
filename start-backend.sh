#!/bin/bash

# Start the FastAPI backend
echo "Starting MP3 Equalizer Backend..."
echo "Make sure ffmpeg is installed: sudo apt install ffmpeg"
echo ""

cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload