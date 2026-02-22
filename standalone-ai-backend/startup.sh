#!/bin/bash
echo "--- STARTUP.SH BOOT ---"
echo "Current directory: $(pwd)"
echo "Listing root files:"
ls -F

# Use the absolute path to the pre-built python interpreter
# Startup file is bash /home/site/wwwroot/startup.sh
# So we are at /home/site/wwwroot/
echo "Executing uvicorn via /home/site/wwwroot/antenv/bin/python ..."
/home/site/wwwroot/antenv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
echo "--- STARTUP.SH EXIT (Code: $?) ---"

