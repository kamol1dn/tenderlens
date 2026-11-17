@echo off
rem TenderLens Telegram bot - reads TENDERLENS_BOT_TOKEN from the environment or tenderlens\.env
python "%~dp0tenderlens_bot.py" %*
if errorlevel 1 pause
