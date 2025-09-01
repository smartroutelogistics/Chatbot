@echo off
echo ========================================
echo   SmartRoute Logistics Chatbot Frontend
echo ========================================
echo.
echo Starting the chatbot frontend...
echo.

cd client

echo Installing dependencies...
call npm install

echo.
echo Starting development server...
echo The chatbot will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

pause