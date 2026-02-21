#!/bin/bash
# Azure App Service Custom Startup Script
python -m uvicorn main:app --host 0.0.0.0 --port 8000
