#!/bin/bash
cd "$(dirname "$0")"
echo "annPlan 서버 시작..."
open "http://localhost:9753"
python3 server.py
