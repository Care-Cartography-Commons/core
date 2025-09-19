#!/bin/bash

# cd packages/api
source .venv/bin/activate
uvicorn main:app --reload --port 8000