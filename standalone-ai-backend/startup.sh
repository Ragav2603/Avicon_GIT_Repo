#!/bin/bash
echo "--- STARTUP SEARCH ---"
ls -laR /home/site/wwwroot
echo "--- STARTING APP ---"
export PYTHONPATH="/home/site/wwwroot/antenv/lib/python3.12/site-packages:$PYTHONPATH"
python -m uvicorn main:app --host 0.0.0.0 --port 8000
