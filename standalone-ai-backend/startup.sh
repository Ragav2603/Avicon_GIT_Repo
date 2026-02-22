#!/bin/bash
echo "--- STARTUP SEARCH ---"
ls -laR /home/site/wwwroot
echo "--- STARTING APP ---"
/home/site/wwwroot/antenv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
