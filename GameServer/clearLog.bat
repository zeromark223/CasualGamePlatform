@echo off &setlocal 
for /f "delims=" %%i in ('dir /a-d /s /b *.log') do del "%%~i"
endlocal
echo "Clear Completed!"
pause