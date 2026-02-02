@echo off
REM Build script for Hybrid Module
REM 需要安装 Visual Studio 2019+ 和 CMake

echo === Building Hybrid Pressure Module ===

cd /d "%~dp0"

REM 创建构建目录
if not exist build mkdir build
cd build

REM 配置 CMake (x64)
cmake -G "Visual Studio 17 2022" -A x64 ..

REM 编译 Release
cmake --build . --config Release

echo === Build Complete ===
pause
