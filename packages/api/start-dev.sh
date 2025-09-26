#!/bin/bash

# cd packages/api
source .venv/bin/activate
uvicorn care_cartography_api.__main__:app --reload --port 8000