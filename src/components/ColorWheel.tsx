// @ts-nocheck
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import "../styles/components.scss";
import { HSV, RGB, hsvToRgb, rgbToHsv, hsvToHex, hexToRgb } from "../utils/color";
import { t } from '../utils/i18n';
import { SliderRow } from "./SliderRow";
import { CollapsibleSection } from "./CollapsibleSection";
import { HueRing } from "./HueRing";
import { ColorArea } from "./ColorArea";
import { MixerPanel } from "./controls/MixerPanel";
import { ScratchpadPanel } from "./controls/ScratchpadPanel";
import { HistoryPanel } from "./controls/HistoryPanel";
import { WheelIndicators } from "./WheelIndicators";
import { WheelToolbar } from "./WheelToolbar";
import { ColorSwatches, HexInput } from "./controls";
import { 
    getForegroundColor, setForegroundColor, 
    getBackgroundColor, setBackgroundColor,
    startColorTracking 
} from "../api/photoshop";


export const ColorWheel = () => {

    // --- STATE ---
    // 初始为中性灰，等待 PS 颜色同步
    const [hsv, setHsv] = useState<HSV>({ h: 0, s: 0, v: 50 });
    const [isLoading, setIsLoading] = useState(true); // 加载状态，避免初始闪现
    const hsvRef = useRef(hsv);
    useEffect(() => { hsvRef.current = hsv; }, [hsv]);
    
    // 标记是否来自 PS 的更新（避免循环触发）
    const isFromPS = useRef(false);

    const rgb = useMemo(() => hsvToRgb(hsv.h, hsv.s, hsv.v), [hsv]);
    const [shape, setShape] = useState<'square' | 'triangle'>('triangle');
    const [activeTab, setActiveTab] = useState<'HSB' | 'RGB'>('HSB');
    const [viewMode, setViewMode] = useState<'tab' | 'list'>('tab');
    const [isGrayscale, setIsGrayscale] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    // FG/BG
    const [bgColor, setBgColor] = useState<HSV>({h:0, s:0, v:100}); 
    const bgColorRef = useRef(bgColor);
    useEffect(() => { bgColorRef.current = bgColor; }, [bgColor]);
    const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);

    // Harmonies
    const [lockBrightness, setLockBrightness] = useState(false);
    const [showAnalog, setShowAnalog] = useState(false);
    const [showComp, setShowComp] = useState(false);
    const ROTATION_OFFSET = 90; // 顺时针旋转90度，与 PS 原生一致 

    // =============================================
    // PS Color Sync (前景色 + 背景色)
    // =============================================
    
    // 1. 初始化：读取 PS 当前前景色和背景色（带重试）
    useEffect(() => {
        const initColors = async (retryCount = 0) => {
            try {
                // 前景色
                const psFg = await getForegroundColor();
                const fgHsv = rgbToHsv(psFg.r, psFg.g, psFg.b);
                isFromPS.current = true;
                setHsv(fgHsv);
                
                // 背景色
                const psBg = await getBackgroundColor();
                const bgHsv = rgbToHsv(psBg.r, psBg.g, psBg.b);
                setBgColor(bgHsv);
                
                console.log("[ColorWheel] Initialized - FG:", psFg, "BG:", psBg);
                setIsLoading(false); // 加载完成，显示色环
            } catch (e) {
                console.warn("[ColorWheel] Init attempt", retryCount, "failed:", e);
                // 重试最多 3 次，每次延迟 500ms
                if (retryCount < 3) {
                    setTimeout(() => initColors(retryCount + 1), 500);
                }
            }
        };
        
        // 延迟 300ms 后开始初始化（等待 PS 完全就绪）
        const timer = setTimeout(() => initColors(0), 300);
        return () => clearTimeout(timer);
    }, []);
    
    // 用 ref 存储 isDragging 以便回调函数访问最新值
    const isDraggingRef = useRef(isDragging);
    useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
    
    // 2. 监听 PS 颜色变化 (只在挂载时添加一次监听器)
    useEffect(() => {
        startColorTracking(
            // 前景色变化回调
            (newColor) => {
                if (isDraggingRef.current) return; // 使用 ref 而非闭包值
                const newHsv = rgbToHsv(newColor.r, newColor.g, newColor.b);
                isFromPS.current = true;
                setHsv(newHsv);
            },
            // 背景色变化回调
            (newColor) => {
                const newHsv = rgbToHsv(newColor.r, newColor.g, newColor.b);
                setBgColor(newHsv);
            }
        );
    }, []); // 空依赖数组：只在挂载时运行一次
    
    // 3. 用户选择颜色后同步到 PS
    const syncToPS = useCallback(async () => {
        if (isFromPS.current) {
            isFromPS.current = false;
            return;
        }
        
        const c = hsvToRgb(hsvRef.current.h, hsvRef.current.s, hsvRef.current.v);
        await setForegroundColor(Math.round(c.r), Math.round(c.g), Math.round(c.b));
        console.log("[ColorWheel] Synced foreground to PS:", c);
    }, []);

    // Swap Logic - 同时交换 PS 前景色和背景色
    const handleSwap = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const temp = {...hsv};
        setHsv(bgColor);
        setBgColor(temp);
        
        // 同步到 PS
        const newFg = hsvToRgb(bgColor.h, bgColor.s, bgColor.v);
        const newBg = hsvToRgb(temp.h, temp.s, temp.v);
        await setForegroundColor(Math.round(newFg.r), Math.round(newFg.g), Math.round(newFg.b));
        await setBackgroundColor(Math.round(newBg.r), Math.round(newBg.g), Math.round(newBg.b));
    };

    // Hex Change
    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(val) || (/^[0-9A-Fa-f]{6}$/.test(val))) {
             const rgb = hexToRgb(val);
             if (rgb) {
                 setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
             }
        }
    };

    const [history, setHistory] = useState<string[]>([]);
    const [mixerA, setMixerA] = useState<string>('rgb(0,0,0)');
    const [mixerB, setMixerB] = useState<string>('rgb(255,255,255)');

    // Mixer Logic
    const getMixerSteps = (c1: string, c2: string, steps: number) => {
        const parse = (s:string) => s.match(/\d+/g)?.map(Number) || [0,0,0];
        const [r1,g1,b1] = parse(c1);
        const [r2,g2,b2] = parse(c2);
        
        const res = [];
        for(let i=0; i<steps; i++) {
            const t = i / (steps-1);
            const r = Math.round(r1 + (r2-r1)*t);
            const g = Math.round(g1 + (g2-g1)*t);
            const b = Math.round(b1 + (b2-b1)*t);
            res.push(`rgb(${r},${g},${b})`);
        }
        return res;
    };
    
    const addToHistory = useCallback(() => {
        const c = hsvToRgb(hsvRef.current.h, hsvRef.current.s, hsvRef.current.v);
        const colorStr = `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;
        console.log("[History] Adding color:", colorStr);
        setHistory(prev => {
            if (prev.length > 0 && prev[0] === colorStr) {
                console.log("[History] Skipped (duplicate)");
                return prev;
            }
            const newHistory = [colorStr, ...prev].slice(0, 20);
            console.log("[History] New history:", newHistory);
            return newHistory;
        });
        
        // 同步到 PS
        syncToPS();
    }, [syncToPS]);

    const applyColor = (colorStr: string) => {
        // Handle HEX
        if (colorStr.startsWith('#')) {
            const hex = colorStr.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                setHsv(rgbToHsv(r, g, b));
                setForegroundColor(r, g, b);
            }
            return;
        }

        // Handle RGB string
        const match = colorStr.match(/rgb\((\d+),(\d+),(\d+)\)/);
        if (match) {
            const [_, r, g, b] = match.map(Number);
            setHsv(rgbToHsv(r, g, b));
            // 应用历史颜色时也同步到 PS
            setForegroundColor(r, g, b);
        }
    };

    // Geometry Constants
    const SIZE = 240;
    const CENTER = SIZE / 2;
    const RADIUS = SIZE / 2 - 2;
    const INNER_RADIUS = RADIUS - 24;
    const BOX_SIZE = INNER_RADIUS * 1.35;
    const OFFSET = (SIZE - BOX_SIZE) / 2;

    const triGeom = useMemo(() => {
        const r = INNER_RADIUS - 6; 
        const angle = 0; 
        return {
            x1: CENTER + r * Math.cos(angle),               
            y1: CENTER + r * Math.sin(angle),
            x2: CENTER + r * Math.cos(angle + 2*Math.PI/3), 
            y2: CENTER + r * Math.sin(angle + 2*Math.PI/3),
            x3: CENTER + r * Math.cos(angle + 4*Math.PI/3), 
            y3: CENTER + r * Math.sin(angle + 4*Math.PI/3),
        };
    }, [CENTER, INNER_RADIUS]);

    const [dragTarget, setDragTarget] = useState<'ring' | 'shape' | null>(null);

    // Interaction Logic
    const handleInteraction = (e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLCanvasElement>, isDown: boolean) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dx = x - CENTER;
        const dy = y - CENTER;
        const dist = Math.sqrt(dx*dx + dy*dy);

        let currentTarget = dragTarget;
        if (isDown) {
            if (dist >= INNER_RADIUS && dist <= RADIUS) {
                currentTarget = 'ring';
                setDragTarget('ring');
            } else if (dist < INNER_RADIUS) {
                currentTarget = 'shape';
                setDragTarget('shape');
            } else {
                currentTarget = null;
                setDragTarget(null);
            }
        }

        if (!currentTarget) return;

        if (currentTarget === 'ring') {
            let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            if (angle < 0) angle += 360;
            // 反转方向与色环渲染一致：h = (360 - angle + offset) % 360
            let h = (360 - angle + ROTATION_OFFSET + 360) % 360;
            setHsv(prev => ({ ...prev, h }));
        } else if (currentTarget === 'shape') {
            if (shape === 'square') {
               const s = Math.max(0, Math.min(100, ((x - OFFSET) / BOX_SIZE) * 100));
               let v = Math.max(0, Math.min(100, 100 - ((y - OFFSET) / BOX_SIZE) * 100));
               if (lockBrightness) v = hsv.v; 
               setHsv(prev => ({ ...prev, s, v }));
            } else {
               const { x1, y1, x2, y2, x3, y3 } = triGeom;
               const det = (y2-y3)*(x1-x3) + (x3-x2)*(y1-y3);
               const w1 = ((y2-y3)*(x-x3) + (x3-x2)*(y-y3)) / det;
               const w2 = ((y3-y1)*(x-x3) + (x1-x3)*(y-y3)) / det;
               const w3 = 1 - w1 - w2;
               let V = 1 - w2;
               let S = 0;
               if (V > 0.001) S = 1 - (w3 / V);
               let finalV = Math.max(0, Math.min(100, V * 100));
               if (lockBrightness) finalV = hsv.v; 
               setHsv(prev => ({ ...prev, s: Math.max(0, Math.min(100, S * 100)), v: finalV }));
            }
        }
    };

    const updateHsv = useCallback((key: keyof HSV, val: number) => {
        setHsv(prev => ({ ...prev, [key]: val }));
    }, []);
    
    const handleRgbChange = useCallback((key: string, val: number) => {
        const currentHsv = hsvRef.current;
        const currentRgb = hsvToRgb(currentHsv.h, currentHsv.s, currentHsv.v);
        const newRgb = { ...currentRgb, [key]: val };
        setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
    }, []);

    // Gradients
    const hueGrad = "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)";
    const satGrad = useMemo(() => {
        const c = hsvToRgb(hsv.h, 100, 100); 
        return `linear-gradient(to right, #ffffff, rgb(${c.r},${c.g},${c.b}))`;
    }, [hsv.h]);
    const valGrad = useMemo(() => {
        const c = hsvToRgb(hsv.h, hsv.s, 100);
        return `linear-gradient(to right, #000000, rgb(${c.r},${c.g},${c.b}))`;
    }, [hsv.h, hsv.s]);
    const rGrad = useMemo(() => {
        const start = { ...rgb, r: 0 };
        const end = { ...rgb, r: 255 };
        return `linear-gradient(to right, rgb(${start.r},${start.g},${start.b}), rgb(${end.r},${end.g},${end.b}))`;
    }, [rgb.g, rgb.b]);
    const gGrad = useMemo(() => {
         const start = { ...rgb, g: 0 };
         const end = { ...rgb, g: 255 };
         return `linear-gradient(to right, rgb(${start.r},${start.g},${start.b}), rgb(${end.r},${end.g},${end.b}))`;
    }, [rgb.r, rgb.b]);
    const bGrad = useMemo(() => {
         const start = { ...rgb, b: 0 };
         const end = { ...rgb, b: 255 };
         return `linear-gradient(to right, rgb(${start.r},${start.g},${start.b}), rgb(${end.r},${end.g},${end.b}))`;
    }, [rgb.r, rgb.g]);

    const mixerSteps = useMemo(() => getMixerSteps(mixerA, mixerB, 7), [mixerA, mixerB]);

    // RENDER
    return (
        <div className="color-wheel-wrapper" style={{display:'flex', flexDirection:'column', alignItems:'center', width:'100%'}}>
             
             {/* 1. Top Toolbar (Modularized) */}
             <WheelToolbar 
                lockBrightness={lockBrightness} setLockBrightness={setLockBrightness}
                showAnalog={showAnalog} setShowAnalog={setShowAnalog}
                showComp={showComp} setShowComp={setShowComp}
                isGrayscale={isGrayscale} setIsGrayscale={setIsGrayscale}
                viewMode={viewMode} setViewMode={setViewMode}
                shape={shape} setShape={setShape}
             />

             {/* 2. Wheel */}
             <div 
                className="wheel-container"
                style={{position: 'relative', width: SIZE, height: SIZE, opacity: isLoading ? 0 : 1, transition: 'opacity 0.2s ease'}}
                onMouseDown={(e) => { setIsDragging(true); if (e.buttons === 1) handleInteraction(e, true); }}
                onMouseMove={(e) => { if (e.buttons === 1) handleInteraction(e, false); }}
                onMouseUp={() => { setIsDragging(false); setDragTarget(null); addToHistory(); }}
                onMouseLeave={() => { setIsDragging(false); setDragTarget(null); }}
             >
                <HueRing size={SIZE} innerRadius={INNER_RADIUS} radius={RADIUS} center={CENTER} roataionOffset={ROTATION_OFFSET} isGrayscale={isGrayscale} />
                <ColorArea shape={shape} hsv={hsv} size={SIZE} isGrayscale={isGrayscale} triGeom={triGeom} offset={OFFSET} boxSize={BOX_SIZE} />
                <WheelIndicators 
                    hsv={hsv} shape={shape} size={SIZE} center={CENTER} radius={RADIUS} innerRadius={INNER_RADIUS} 
                    offset={OFFSET} boxSize={BOX_SIZE} triGeom={triGeom} rotationOffset={ROTATION_OFFSET} 
                    showAnalog={showAnalog} showComp={showComp} 
                />
                
                {/* FG/BG & Hex Input */}
                <div style={{position: 'absolute', bottom: -40, left: 10, zIndex: 20}} onMouseDown={e => e.stopPropagation()}>
                    <ColorSwatches 
                        foreground={hsv}
                        background={bgColor}
                        onSwap={handleSwap}
                    />
                </div>

                <div style={{position: 'absolute', bottom: -32, right: 0, zIndex: 20}} onMouseDown={e => e.stopPropagation()}>
                    <HexInput 
                        hex={currentHex}
                        onChange={(hex) => {
                            const rgb = hexToRgb(hex);
                            if (rgb) {
                                const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                                setHsv(newHsv);
                                addToHistory();
                            }
                        }}
                    />
                </div>
            </div>
             
            {/* 3. Controls */}
            <div className="controls-wrapper">
                <CollapsibleSection title={t('adjust_title')} defaultOpen={true}>
                    {viewMode === 'tab' && (
                        <div className="segmented-tabs" style={{marginBottom: 8}}>
                            <div className={`tab-btn ${activeTab === 'HSB' ? 'active' : ''}`} onClick={() => setActiveTab('HSB')}>HSB</div>
                            <div className={`tab-btn ${activeTab === 'RGB' ? 'active' : ''}`} onClick={() => setActiveTab('RGB')}>RGB</div>
                        </div>
                    )}
                    <div className="sliders-container">
                        {(viewMode === 'list' || activeTab === 'HSB') && (
                            <>
                                <SliderRow id="h" label="H" value={Math.round(hsv.h)} max={360} onChange={updateHsv} bg={hueGrad} showInput={true} onCommit={addToHistory} />
                                <SliderRow id="s" label="S" value={Math.round(hsv.s)} max={100} onChange={updateHsv} bg={satGrad} showInput={true} onCommit={addToHistory} />
                                <SliderRow id="v" label="B" value={Math.round(hsv.v)} max={100} onChange={updateHsv} bg={valGrad} showInput={true} onCommit={addToHistory} />
                            </>
                        )}
                        {viewMode === 'list' && <div style={{height: 1, background:'rgba(255,255,255,0.05)', margin:'6px 0'}}></div>}
                        {(viewMode === 'list' || activeTab === 'RGB') && (
                            <>
                                <SliderRow id="r" label="R" value={rgb.r} max={255} onChange={handleRgbChange} bg={rGrad} showInput={true} onCommit={addToHistory} />
                                <SliderRow id="g" label="G" value={rgb.g} max={255} onChange={handleRgbChange} bg={gGrad} showInput={true} onCommit={addToHistory} />
                                <SliderRow id="b" label="B" value={rgb.b} max={255} onChange={handleRgbChange} bg={bGrad} showInput={true} onCommit={addToHistory} />
                            </>
                        )}
                    </div>
                </CollapsibleSection>

                {/* RECENTLY USED - 新设计，自带标题栏 */}
                <HistoryPanel 
                    colors={history}
                    onSelect={applyColor}
                    onClear={() => setHistory([])}
                />

                {/* PRECISION MIXER - 新设计，自带标题栏 */}
                <MixerPanel 
                    colorA={mixerA}
                    colorB={mixerB}
                    onSetA={() => {
                        const c = hsvToRgb(hsv.h, hsv.s, hsv.v);
                        setMixerA(`rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`);
                    }}
                    onSetB={() => {
                        const c = hsvToRgb(hsv.h, hsv.s, hsv.v);
                        setMixerB(`rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`);
                    }}
                    onSelectColor={applyColor}
                />

                {/* 试色板 */}
                <ScratchpadPanel 
                    currentColor={currentHex}
                    onPickColor={(r, g, b) => {
                        setHsv(rgbToHsv(r, g, b));
                        setForegroundColor(r, g, b);
                    }}
                />
                
                <div style={{position: 'absolute', bottom: -15, right: 0, fontSize: '9px', color: '#666', opacity: 0.5}}>v27.0 Pro UI</div>
            </div>
        </div>
    );
};
