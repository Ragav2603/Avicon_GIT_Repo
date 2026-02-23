#!/bin/bash
echo "--- STARTUP SEARCH ---"
ls -la /home/site/wwwroot
echo "--- STARTING APP ---"
export PYTHONPATH="/home/site/wwwroot/custom_libs:$PYTHONPATH"
python -m uvicorn main:app --host 0.0.0.0 --port 8000
