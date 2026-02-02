/**
 * PillButton - 胶囊按钮组件
 * 使用 div 替代 button 避免 UXP 默认样式覆盖
 */
import React from "react";

interface PillButtonProps {
    label: string;
    onClick: () => void;
    active?: boolean;
    variant?: 'palette' | 'mode';
    style?: React.CSSProperties;
}

export const PillButton: React.FC<PillButtonProps> = ({ 
    label, 
    onClick, 
    active = false,
    variant = 'palette',
    style
}) => {
    const [hover, setHover] = React.useState(false);
    
    const baseStyle: React.CSSProperties = variant === 'palette' ? {
        // ... (base styles)
        flex: 1,
        height: 32,
        background: hover ? 'rgba(55, 55, 60, 0.95)' : 'rgba(40, 40, 45, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 18,
        color: hover ? '#fff' : 'rgba(255, 255, 255, 0.7)',
        fontSize: 8,
        fontWeight: 500,
        letterSpacing: 0.5,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
        userSelect: 'none',
        ...style
    } : {
        // ... (mode styles)
        flex: 1,
        height: 28,
        background: active 
            ? 'rgba(255, 255, 255, 0.1)' 
            : hover 
                ? 'rgba(50, 50, 55, 0.9)' 
                : 'rgba(30, 30, 35, 0.8)',
        border: `1px solid ${active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'}`,
        borderRadius: 6,
        color: active || hover ? '#eee' : '#888',
        fontSize: 8,
        fontWeight: 500,
        letterSpacing: 0.3,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
        userSelect: 'none',
        ...style
    };

    return (
        <div 
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={baseStyle}
        >
            {label}
        </div>
    );
};
