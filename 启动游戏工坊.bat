@echo off
chcp 65001 >nul
title Godot-Arter 游戏美术工坊 - 本地服务
cd /d "%~dp0"

echo ============================================
echo   🎮 Godot-Arter 游戏美术工坊 - 本地服务
echo   启动后将自动打开浏览器（含图片代理，可绕 CORS）
echo   关闭本窗口即停止服务
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js，请先安装 Node.js ^>= 18
  pause
  exit /b 1
)

echo 正在启动本地服务（端口 3080）...
start "" http://127.0.0.1:3080/game-art-studio
node server.mjs

pause
