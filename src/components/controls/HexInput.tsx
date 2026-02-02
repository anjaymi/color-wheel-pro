/**
 * HexInput - Hex 颜色输入组件
 * 使用 div + contentEditable 避免 UXP input 默认样式
 */
import React, { useState, useEffect, useRef } from "react";
import "./controls.scss";

interface HexInputProps {
    hex: string;
    onChange: (hex: string) => void;
}

export const HexInput: React.FC<HexInputProps> = ({ hex, onChange }) => {
    const [value, setValue] = useState(hex.replace('#', '').toUpperCase());
    const inputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setValue(hex.replace('#', '').toUpperCase());
        if (inputRef.current && inputRef.current.textContent !== hex.replace('#', '').toUpperCase()) {
            inputRef.current.textContent = hex.replace('#', '').toUpperCase();
        }
    }, [hex]);

    const handleInput = () => {
        if (!inputRef.current) return;
        const text = inputRef.current.textContent || '';
        const newVal = text.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6).toUpperCase();
        setValue(newVal);
        
        if (newVal.length === 6) {
            onChange('#' + newVal);
        }
    };

    const handleBlur = () => {
        if (!inputRef.current) return;
        if (value.length === 6) {
            onChange('#' + value);
        } else {
            const original = hex.replace('#', '').toUpperCase();
            setValue(original);
            inputRef.current.textContent = original;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            inputRef.current?.blur();
        }
    };

    return (
        <div style={{ 
            background: '#171717', 
            borderRadius: '14px',
            padding: '6px 12px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            clipPath: 'inset(0 round 14px)'
        }}>
            <span style={{ 
                color: '#666', 
                marginRight: '6px', 
                fontSize: 12,
                fontFamily: 'SF Mono, Consolas, monospace',
                userSelect: 'none'
            }}>#</span>
            <div 
                ref={inputRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                style={{ 
                    color: '#fff',
                    fontSize: 12,
                    fontFamily: 'SF Mono, Consolas, monospace',
                    fontWeight: 500,
                    letterSpacing: '1px',
                    outline: 'none',
                    minWidth: '60px',
                    cursor: 'text',
                    userSelect: 'text'
                }}
            >
                {value}
            </div>
        </div>
    );
};
