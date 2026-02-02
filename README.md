# 喵色环 3 (Meow Color Wheel Pro 3)

An advanced Color Wheel and Mixing Panel for Adobe Photoshop 2023+ (v24.2+).  
专为数字绘画设计的现代化色环插件，提供精准的色彩控制、实时和谐色预览以及流畅的绘画体验。

![Banner](public/icon_comp.png)

## ✨ Features / 核心功能

### 🎨 Precision Color Wheel (精准色轮)
- *Lock Brightness (锁定亮度)*: Keep value constant while changing hue/saturation.
- *Harmony Rules (色彩和谐)*: Real-time Analogous and Complementary color guides.
- *Grayscale Mode (黑白模式)*: One-click check for value relationships.
- *Customizable Shapes*: Toggle between Square and Triangle wheel types.

### 🖌️ Interaction (交互体验)
- **HUD Picker**: Syncs perfectly with Photoshop's native HUD.
- **A/B Palette**: Dual slots for quick color swapping.

## 🚀 Installation / 安装指南

### Option A: Auto-Install (Recommended)
1. Download the latest `.ccx` release.
2. Double-click the file to install via Creative Cloud Desktop.
3. Restart Photoshop.

### Option B: Manual Install (Advanced)
1. Rename `.ccx` to `.zip`.
2. Extract to:
   - **Win**: `C:\Program Files\Common Files\Adobe\Plug-ins\CC\ColorWheelPro3`
   - **Mac**: `/Library/Application Support/Adobe/Plug-ins/CC/ColorWheelPro3`
3. Restart Photoshop.

## 📄 Documentation (用户手册)

For a detailed visual guide, please check the [User Manual](UserManual.html) included in the repository.  
详细图文说明请查看项目中的 [用户手册 HTML 版](UserManual.html).

## 🛠️ Build from Source / 源码构建

This project is built with [Bolt UXP](https://github.com/hyperbrew/bolt-uxp).

```bash
# Install dependencies
npm install

# Build Hybrid C++ Module (Optional, for pressure support)
# Requirement: CMake & Visual Studio (Win) / Xcode (Mac)
cd src/hybrid/build
cmake ..
cmake --build . --config Release

# Build Plugin
npm run build     # For development
npm run ccx       # Package for distribution
```

## 📜 License

[Add License Here - e.g. GPL-3.0 if you want copyleft protection]

