#!/bin/bash
cd standalone-ai-backend
# In some Azure base images, global pip commands without --user fail silently
python -m pip install --upgrade pip
python -m pip install --user -r requirements.txt
export PATH="$HOME/.local/bin:$PATH"
python -m uvicorn main:app --host 0.0.0.0 --port 8000
