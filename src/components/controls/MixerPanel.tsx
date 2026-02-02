/**
 * MixerPanel V2 - 精准混色器
 * 参考设计：PALETTE ALPHA/BETA + DARK/LIGHT 模式
 */
import React, { useMemo, useState } from "react";
import "./controls.scss";
import { PillButton } from "./PillButton";
import { t } from "../../utils/i18n";

interface MixerPanelProps {
    colorA: string;
    colorB: string;
    onSetA: () => void;
    onSetB: () => void;
    onSelectColor: (color: string) => void;
    steps?: number;
}

/**
 * 解析颜色字符串为 RGB
 */
function parseColor(color: string): { r: number; g: number; b: number } {
    if (color.startsWith('#')) {
        const hex = color.slice(1);
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16)
        };
    }
    const match = color.match(/(\d+)/g);
    if (match && match.length >= 3) {
        return { r: +match[0], g: +match[1], b: +match[2] };
    }
    return { r: 128, g: 128, b: 128 };
}

/**
 * RGB 转 Hex
 */
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

export const MixerPanel: React.FC<MixerPanelProps> = ({
    colorA,
    colorB,
    onSetA,
    onSetB,
    onSelectColor,
    steps = 9
}) => {
    // DARK / LIGHT 模式
    const [mode, setMode] = useState<'dark' | 'light'>('dark');
    // 当前激活的调色板通道 ('A' | 'B')
    const [activeChannel, setActiveChannel] = useState<'A' | 'B'>('A');
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // 计算渐变步骤
    const mixerSteps = useMemo(() => {
        // 根据激活通道选择源颜色
        const sourceColor = activeChannel === 'A' ? colorA : colorB;
        const start = parseColor(sourceColor);
        const result: string[] = [];
        
        // 根据模式选择目标色
        const targetColor = mode === 'dark' 
            ? { r: 0, g: 0, b: 0 }  // 暗色模式：混合到黑色
            : { r: 255, g: 255, b: 255 }; // 亮色模式：混合到白色
        
        // 生成从 start 到 target 的渐变
        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            const r = start.r + (targetColor.r - start.r) * t;
            const g = start.g + (targetColor.g - start.g) * t;
            const bl = start.b + (targetColor.b - start.b) * t;
            result.push(rgbToHex(r, g, bl));
        }
        
        return result;

    }, [colorA, colorB, steps, mode, activeChannel]);

    // 计算 A-B 混合渐变
    const abSteps = useMemo(() => {
        const a = parseColor(colorA);
        const b = parseColor(colorB);
        const result: string[] = [];
        
        for (let i = 0; i < steps; i++) {
            const t = i / (steps - 1);
            const r = a.r + (b.r - a.r) * t;
            const g = a.g + (b.g - a.g) * t;
            const bl = a.b + (b.b - a.b) * t;
            result.push(rgbToHex(r, g, bl));
        }
        return result;
    }, [colorA, colorB, steps]);

    return (
        <div className="mixer-panel-v2">
            {/* 标题栏 */}
            <div 
                className="mixer-header" 
                style={{ justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <span className="mixer-title">{t('mixer_title')}</span>
                <span style={{ 
                    fontSize: 10,
                    color: '#888',
                    transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    display: 'inline-block'
                }}>▼</span>
            </div>
            
            {!isCollapsed && (
                <>
                    {/* PALETTE ALPHA / BETA 按钮 */}
                    <div className="palette-buttons">
                        <PillButton 
                            label={t('palette_alpha')}
                            onClick={() => {
                                setActiveChannel('A');
                                onSetA();
                            }}
                            active={activeChannel === 'A'}
                            variant="palette"
                        />
                        <PillButton 
                            label={t('palette_beta')}
                            onClick={() => {
                                setActiveChannel('B');
                                onSetB();
                            }}
                            active={activeChannel === 'B'}
                            variant="palette"
                        />
                    </div>
                    
                    {/* DARK / LIGHT 切换 */}
                    <div className="mode-toggle">
                        <PillButton 
                            label={t('mode_dark')}
                            onClick={() => setMode('dark')}
                            active={mode === 'dark'}
                            variant="mode"
                        />
                        <PillButton 
                            label={t('mode_light')}
                            onClick={() => setMode('light')}
                            active={mode === 'light'}
                            variant="mode"
                        />
                    </div>
                    
                    {/* 1. 当前通道 -> 明/暗 渐变 */}
                    <div className="mixer-gradient-v2" style={{ marginBottom: 8 }}>
                        {mixerSteps.map((color, i) => (
                            <div 
                                key={i}
                                className="gradient-step-v2"
                                style={{ backgroundColor: color }}
                                onClick={() => onSelectColor(color)}
                                title={color}
                            />
                        ))}
                    </div>

                    {/* 2. A -> B 混合渐变 */}
                    <div className="mixer-gradient-v2">
                        {abSteps.map((color, i) => (
                            <div 
                                key={i}
                                className="gradient-step-v2"
                                style={{ backgroundColor: color }}
                                onClick={() => onSelectColor(color)}
                                title={`Mix A-B: ${color}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
