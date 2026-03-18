@echo off
cd /d "%~dp0"
echo annPlan 서버 시작...
start http://localhost:9753
python server.py
