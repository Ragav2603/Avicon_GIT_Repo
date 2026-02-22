#!/bin/bash
echo "Starting boot script at $(pwd)..." > /home/site/wwwroot/startup_debug.log
date >> /home/site/wwwroot/startup_debug.log
# In some Azure base images, global pip commands without --user fail silently
echo "Upgrading pip..." >> /home/site/wwwroot/startup_debug.log
python -m pip install --upgrade pip >> /home/site/wwwroot/startup_debug.log 2>&1
echo "Installing requirements..." >> /home/site/wwwroot/startup_debug.log
python -m pip install --user -r requirements.txt >> /home/site/wwwroot/startup_debug.log 2>&1
export PATH="$HOME/.local/bin:$PATH"
echo "Starting uvicorn..." >> /home/site/wwwroot/startup_debug.log
python -m uvicorn main:app --host 0.0.0.0 --port 8000 >> /home/site/wwwroot/startup_debug.log 2>&1
