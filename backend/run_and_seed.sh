#!/bin/bash
cd "/Users/abhishekdhawan/ai based resume screening and job recommendation system/backend"
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8001 > uvicorn_debug.log 2>&1 &
PID=$!
sleep 5
curl -X POST http://localhost:8001/seed/
kill $PID
