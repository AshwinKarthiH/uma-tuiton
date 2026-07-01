@echo off
echo Cleaning up node_modules and package-lock.json...
rmdir /s /q node_modules
del /q package-lock.json

echo Installing dependencies...
call npm install

echo Starting Vite dev server...
call npm run dev
