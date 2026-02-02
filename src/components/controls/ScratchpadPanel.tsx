/**
 * ScratchpadPanel - 试色板/混色板
 * 模拟 SAI 风格的混色区域，允许用户自由绘制和混合颜色
 * 
 * 支持 Hybrid Addon 压感：当 pointerEvent.pressure 有效时使用真实压感
 */
import React, { useRef, useEffect, useState } from "react";
import "./controls.scss";
import { t } from "../../utils/i18n";
import { PillButton } from "./PillButton";
import { SimpleSlider } from "./SimpleSlider";
import { useHybridPressure } from "../../hooks/useHybridPressure";

interface ScratchpadPanelProps {
    currentColor: string;
    onPickColor: (r: number, g: number, b: number) => void;
}

// 辅助：计算两点距离
const distance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => 
    Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

export const ScratchpadPanel: React.FC<ScratchpadPanelProps> = ({
    currentColor,
    onPickColor
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Virtual Buffer: 纯内存像素数组 (Software Rendering)
    // 解决 UXP Canvas API (getImageData) 不稳定/缺失的问题
    const virtualBufferRef = useRef<Uint8ClampedArray | null>(null);
    const bufferWidth = 212;
    const bufferHeight = 100;
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Hybrid 压感模块
    const { isAvailable: addonAvailable, setPressure: syncPressureToAddon } = useHybridPressure();
    
    // 用户可调节的笔刷参数（作为 fallback）
    const [brushSize, setBrushSize] = useState(20);
    const [opacity, setOpacity] = useState(0.6);
    
    // 是否检测到真实压感（非 0 或 0.5）
    const [hasPenPressure, setHasPenPressure] = useState(false);
    
    // 用于插值的上一个点
    const lastPointRef = useRef<{x: number, y: number} | null>(null);

    // 取色模式状态
    const [isPickingColor, setIsPickingColor] = useState(false);

    // 自动提取的建议色板
    const [suggestedColors, setSuggestedColors] = useState<string[]>([]);

    // 初始化画布背景
    // 初始化画布背景
    // 初始化 Virtual Buffer & 画布背景
    useEffect(() => {
        const canvas = canvasRef.current;
        
        // 1. 初始化可见画布
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        // 2. 初始化 Virtual Buffer (纯白背景)
        const size = bufferWidth * bufferHeight * 4; // RGBA
        const buffer = new Uint8ClampedArray(size);
        buffer.fill(255); // 全白 (RGBA 255,255,255,255)
        virtualBufferRef.current = buffer;

    }, []);

    // 处理 PointerDown
    const handlePointerDown = async (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Alt+Click 或 取色模式 = 取色
        if (e.altKey || isPickingColor) {

            
            // 提前提取坐标信息，并进行缩放修正
            // 注意：pickColor 内部也会计算 scale，这里传入原始 clientXY 更好，让 pickColor 自己处理？
            // 之前的 pickColor 实现是接受 clientX, clientY 然后自己 getBoundingClientRect 计算的。
            // 保持一致，传入 clientX/Y
            const clientX = e.clientX;
            const clientY = e.clientY;
            
            try {
                await pickColor(clientX, clientY);
            } catch (err) {
                console.error('[Scratchpad] Pick color failed:', err);
            } finally {
                // 只有在完成尝试后才退出模式
                if (isPickingColor) {

                    setIsPickingColor(false);
                }
            }
            return;
        }
        
        // 捕获指针
        canvas.setPointerCapture(e.pointerId);

        // 计算正确的 Canvas 内部坐标
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        lastPointRef.current = { x, y };
        
        // 提取压感（仅当是 pen 且 pressure > 0 时才使用）
        const pressure = (e.pointerType === 'pen' && e.pressure > 0) ? e.pressure : undefined;
        if (pressure !== undefined && !hasPenPressure) {
            setHasPenPressure(true);

        }
        
        // 画初始点
        // 画初始点
        paintStrokePoint(x, y, pressure);
    };

    // ... (keep handlePointerMove logic same)

    // ...

    // 算法：从 Virtual Buffer 提取主要颜色
    const extractColorsFromBuffer = () => {
        const buffer = virtualBufferRef.current;
        if (!buffer) return;

        const colorMap = new Map<string, number>();
        const quantization = 16; // 量化步长，将相近颜色归为一类

        // 降采样遍历 (每 4 个像素采一个，提高性能)
        const step = 4; 
        for (let y = 0; y < bufferHeight; y += step) {
            for (let x = 0; x < bufferWidth; x += step) {
                const idx = (y * bufferWidth + x) * 4;
                const r = buffer[idx];
                const g = buffer[idx + 1];
                const b = buffer[idx + 2];
                const a = buffer[idx + 3];

                // 忽略纯白背景和完全透明像素
                if (a < 10 || (r > 250 && g > 250 && b > 250)) continue;

                // 量化
                const qr = Math.round(r / quantization) * quantization;
                const qg = Math.round(g / quantization) * quantization;
                const qb = Math.round(b / quantization) * quantization;

                const key = `${qr},${qg},${qb}`;
                colorMap.set(key, (colorMap.get(key) || 0) + 1);
            }
        }

        // 排序并取前 7 个
        const sorted = [...colorMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7)
            .map(([key]) => {
                const [r, g, b] = key.split(',').map(Number);
                return `rgb(${r},${g},${b})`;
            });
        
        // 只有当颜色确实变化时才更新 (简单的长度检查，实际可以用更复杂的 diff)
        if (sorted.length > 0) {
           setSuggestedColors(sorted);
        }
    };

    // Shadow Canvas 取色策略 V3：双重缓冲读取
    // 直接从 Offscreen Canvas 读取像素，绕过 UXP 主画布读取限制
    // 辅助：从十六进制颜色转换为 RGB 数组
    const hexToRgb = (hex: string): [number, number, number] => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
            : [0, 0, 0];
    };

    // Virtual Buffer 取色策略 V4：直接读取内存数组
    const pickColor = async (clientX: number, clientY: number) => {
        const visibleCanvas = canvasRef.current;
        if (!visibleCanvas) return;

        const buffer = virtualBufferRef.current;
        if (!buffer) {
            console.error('[Scratchpad] Virtual buffer not initialized');
            return;
        }

        const rect = visibleCanvas.getBoundingClientRect();
        const scaleX = visibleCanvas.width / rect.width;
        const scaleY = visibleCanvas.height / rect.height;
        
        const x = Math.floor((clientX - rect.left) * scaleX);
        const y = Math.floor((clientY - rect.top) * scaleY);

        // 边界检查
        if (x < 0 || x >= bufferWidth || y < 0 || y >= bufferHeight) return;

        // 直接从数组读取 (stride = 4)
        const index = (y * bufferWidth + x) * 4;
        
        const r = buffer[index];
        const g = buffer[index + 1];
        const b = buffer[index + 2];
        

        
        onPickColor(r, g, b);
    };
            


    // 处理 PointerMove (核心插值逻辑)
    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!lastPointRef.current) return;
        if (e.buttons !== 1) return; // 只在拖拽时绘制

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        // 修正坐标转换
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const last = lastPointRef.current;
        const dist = distance(last, {x, y});
        
        // 提取压感
        const pressure = (e.pointerType === 'pen' && e.pressure > 0) ? e.pressure : undefined;
        if (pressure !== undefined && !hasPenPressure) {
            setHasPenPressure(true);
        }
        
        // 插值步长 (每2像素画一个点，保证平滑无折线)
        const step = 2; 
        
        if (dist > step) {
            const steps = Math.floor(dist / step);
            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                
                // 线性插值位置
                const ix = last.x + (x - last.x) * t;
                const iy = last.y + (y - last.y) * t;
                
                paintStrokePoint(ix, iy, pressure);
            }
        } else {
             paintStrokePoint(x, y, pressure);
        }

        lastPointRef.current = { x, y };
    };

    // 处理 PointerUp
    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
         lastPointRef.current = null;
         const canvas = canvasRef.current;
         if (canvas) canvas.releasePointerCapture(e.pointerId);

         // 抬笔时提取调色板
         extractColorsFromBuffer();
    };

    // 绘制单个点（支持压感参数）- 双重缓冲版 (Renamed to force update)
    // 软件渲染：更新 Virtual Buffer
    const updateVirtualBuffer = (cx: number, cy: number, radius: number, r: number, g: number, b: number, alpha: number) => {
        const buffer = virtualBufferRef.current;
        if (!buffer) return;

        // 简单的 Bounding Box 遍历绘制圆形
        const startX = Math.max(0, Math.floor(cx - radius));
        const endX = Math.min(bufferWidth - 1, Math.ceil(cx + radius));
        const startY = Math.max(0, Math.floor(cy - radius));
        const endY = Math.min(bufferHeight - 1, Math.ceil(cy + radius));

        const rSq = radius * radius;

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const distSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
                
                // 简单的抗锯齿软边 (optional，这里用硬边或简单混合)
                if (distSq <= rSq) {
                    const idx = (y * bufferWidth + x) * 4;
                    
                    // Alpha Blending: SrcOver
                    // out = src * alpha + dst * (1 - alpha)
                    const bgR = buffer[idx];
                    const bgG = buffer[idx + 1];
                    const bgB = buffer[idx + 2];
                    
                    buffer[idx]     = r * alpha + bgR * (1 - alpha);
                    buffer[idx + 1] = g * alpha + bgG * (1 - alpha);
                    buffer[idx + 2] = b * alpha + bgB * (1 - alpha);
                    buffer[idx + 3] = 255; // Always opaque buffer
                }
            }
        }
    };

    // 绘制单个点（支持压感参数）- Software Rendering Integrated
    const paintStrokePoint = (x: number, y: number, pressure?: number) => {
        // 如果有压感，使用压感；否则使用滑块值
        const effectivePressure = pressure ?? opacity;
        const effectiveSize = pressure !== undefined 
            ? 5 + pressure * 45  // 压感：5-50px
            : brushSize;          // 滑块值
        
        // 同步压感到 C++ addon（如果可用）(包含 try-catch 保护)
        if (pressure !== undefined && addonAvailable) {
            try {
                syncPressureToAddon(pressure);
            } catch (e) {
                console.warn('[Scratchpad] Failed to sync pressure:', e);
            }
        }

        // 1. 绘制到 Visible Canvas (用于显示)
        const visibleCanvas = canvasRef.current;
        if (visibleCanvas) {
            const ctx = visibleCanvas.getContext('2d');
            if (ctx) {
                try {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = currentColor;
                    ctx.globalAlpha = effectivePressure;
                    ctx.beginPath();
                    ctx.arc(x, y, effectiveSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                } catch (e) {
                    console.error('[Scratchpad] Draw op failed:', e);
                }
            }
        }

        // 2. 更新 Virtual Buffer (Software Rendering)
        const [r, g, b] = hexToRgb(currentColor);
        updateVirtualBuffer(x, y, effectiveSize / 2, r, g, b, effectivePressure);
    };



    const clearCanvas = () => {
        // Clear Visible
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        // Clear Virtual Buffer
        const buffer = virtualBufferRef.current;
        if (buffer) {
            buffer.fill(255); // Reset to White
        }
        setSuggestedColors([]); // 清空建议色板
    };

    return (
        <div className="scratchpad-panel-v2" style={{
            position: 'relative', // Add relative positioning for absolute child
            background: '#242424',
            borderRadius: '16px',
            padding: '14px',
            marginTop: '8px',
            boxShadow: '0 -1px 0 rgba(255, 255, 255, 0.05), 0 8px 24px rgba(0, 0, 0, 0.6)'
        }}>
            {/* 标题栏 */}
            <div 
                className="mixer-header" 
                style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', marginBottom: isCollapsed ? 0 : 12 }}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <span className="mixer-title" style={{ fontSize: 10, fontWeight: 600, color: '#888', letterSpacing: 0.5 }}>
                    {t('scratchpad_title') || 'SCRATCHPAD'}
                </span>
                <span style={{ 
                    fontSize: 10,
                    color: '#888',
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                }}>▼</span>
            </div>

            {!isCollapsed && (
                <>
                    <canvas 
                        ref={canvasRef}
                        width={212} 
                        height={100}
                        style={{ 
                            borderRadius: '8px', 
                            cursor: isPickingColor ? 'copy' : 'crosshair', // 改变光标
                            width: '100%',
                            height: '100px',
                            touchAction: 'none'
                        }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                    />
                    {/* Virtual Buffer used internally, no extra DOM elements needed */ }
                    
                    {/* 笔刷控制滑块 */}
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {/* 自动生成的色板 */}
                        {suggestedColors.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, marginBottom: 4, height: 24, alignItems: 'center' }}>
                                <span style={{ fontSize: 9, color: '#666', width: 40 }}>建议</span>
                                <div style={{ flex: 1, display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                                    {suggestedColors.map((color, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                width: 18, height: 18, borderRadius: '50%',
                                                background: color,
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                            }}
                                            onClick={() => {
                                                // Parse rgb string to numbers
                                                const match = color.match(/\d+/g);
                                                if (match) {
                                                    onPickColor(Number(match[0]), Number(match[1]), Number(match[2]));
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 大小滑块 */}
                        {hasPenPressure ? (
                            <div 
                                onClick={() => setHasPenPressure(false)}
                                style={{ 
                                    padding: '12px 0', 
                                    color: 'var(--color-text-secondary)', 
                                    fontSize: '11px', 
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    opacity: 0.7,
                                    border: '1px dashed var(--color-border)',
                                    borderRadius: '4px',
                                    margin: '4px 0'
                                }}
                                title={t("click_to_reset_manual")}
                            >
                                🖊️ {t("pressure_mode_active")}
                            </div>
                        ) : (
                            <>
                                {/* 大小滑块 */}
                                <SimpleSlider 
                                    label={t("size")}
                                    value={(brushSize - 2) / 48} // Normalize 2-50 to 0-1
                                    onChange={(val) => setBrushSize(Math.round(2 + val * 48))}
                                    displayValue={`${brushSize}px`}
                                />
                                
                                {/* 不透明度滑块 */}
                                <SimpleSlider 
                                    label={t("opacity")}
                                    value={opacity}
                                    onChange={(val) => setOpacity(Math.max(0.1, val))} // Min 10%
                                    displayValue={`${Math.round(opacity * 100)}%`}
                                />
                            </>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                         {/* 吸管按钮替代纯文本提示 */}
                         <PillButton 
                            label={isPickingColor ? "正在取色..." : "吸管"} 
                            active={isPickingColor} // 改为 active
                            onClick={() => setIsPickingColor(!isPickingColor)}
                            variant="mode" 
                            style={{ flex: 1, marginRight: 8, justifyContent: 'center' }}
                         />
                         <PillButton label="清空" onClick={clearCanvas} variant="mode" />
                    </div>
                </>
            )}
        </div>
    );
};
