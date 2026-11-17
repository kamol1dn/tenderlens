@echo off
rem TenderLens web UI - double-click to start (offline, no install needed)
python "%~dp0serve.py" %*
if errorlevel 1 pause
