@echo off
chcp 65001 > nul
set APP_PATH=%~dp0index.html

if exist C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe (
    start " C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe --app=%APP_PATH%
 exit
)

if exist C:\Program Files\Google\Chrome\Application\chrome.exe (
 start  C:\Program Files\Google\Chrome\Application\chrome.exe --app=%APP_PATH%
 exit
)

start  %APP_PATH%
