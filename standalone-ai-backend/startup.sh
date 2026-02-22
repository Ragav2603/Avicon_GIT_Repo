#!/bin/bash
# Updated for pre-built environment deployment
echo "Starting boot script using pre-built env at $(pwd)..." > /home/site/wwwroot/startup_boot.log
date >> /home/site/wwwroot/startup_boot.log

# Use the absolute path to the pre-built python interpreter
# Startup file is now bash /home/site/wwwroot/startup.sh
# So we are at /home/site/wwwroot/
echo "Starting uvicorn using /home/site/wwwroot/antenv/bin/python..." >> /home/site/wwwroot/startup_boot.log
/home/site/wwwroot/antenv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 >> /home/site/wwwroot/startup_boot.log 2>&1

