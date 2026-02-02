/**
 * ColorSwatches - 前景/背景色色块组件
 * 仿 PS 原生样式：前景色在左上，背景色在右下
 */
import React from "react";
import { HSV, hsvToHex } from "../../utils/color";
import { openColorPicker } from "../../api/photoshop";

interface ColorSwatchesProps {
    foreground: HSV;
    background: HSV;
    onSwap: () => void;
}

export const ColorSwatches: React.FC<ColorSwatchesProps> = ({
    foreground,
    background,
    onSwap
}) => {
    const fgHex = hsvToHex(foreground.h, foreground.s, foreground.v);
    const bgHex = hsvToHex(background.h, background.s, background.v);

    return (
        <div style={{
            position: 'relative',
            width: 36,
            height: 36,
        }}>
            {/* 背景色色块 - 右下角 */}
            <div 
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 20,
                    height: 20,
                    backgroundColor: bgHex,
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 3,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
                onClick={() => openColorPicker('background')}
                title="背景色 - 点击打开拾色器"
            />
            
            {/* 前景色色块 - 左上角 (在上层) */}
            <div 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 22,
                    height: 22,
                    backgroundColor: fgHex,
                    border: '2px solid #fff',
                    borderRadius: 3,
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                    zIndex: 2,
                }}
                onClick={() => openColorPicker('foreground')}
                title="前景色 - 点击打开拾色器"
            />
            
            {/* 交换按钮 - 右上角小箭头 */}
            <div 
                style={{
                    position: 'absolute',
                    top: -3,
                    right: 1,
                    fontSize: 11,
                    color: '#999',
                    cursor: 'pointer',
                    lineHeight: 1,
                    zIndex: 3,
                    transition: 'color 0.15s',
                }}
                onClick={onSwap}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                title="交换前景/背景色"
            >
                ↔
            </div>
        </div>
    );
};

