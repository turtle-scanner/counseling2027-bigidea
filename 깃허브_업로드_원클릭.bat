@echo off
chcp 65001 > nul
echo ======================================================
echo   2027 전문상담 핵심교재 깃허브(GitHub) 원클릭 업로더
echo ======================================================
echo.
echo 1. GitHub(https://github.com)에서 만든 새 저장소 주소를 복사하세요.
echo    예: https://github.com/내아이디/counseling2027.git
echo.
set /p REPO_URL=깃허브 저장소 주소를 입력하고 엔터를 누르세요: 

if %REPO_URL%==" (
 echo 주소가 입력되지 않았습니다. 종료합니다.
 pause
 exit /b
)

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
echo.
echo 깃허브로 업로드(Push)를 시작합니다...
git push -u origin main

echo.
echo ======================================================
echo 업로드가 완료되었습니다!
echo 저장소의 [Settings] - [Pages]에서 Branch를 [main]으로 설정하시면
echo 스마트폰/태블릿에서 앱으로 바로 사용하실 수 있습니다.
echo ======================================================
pause
