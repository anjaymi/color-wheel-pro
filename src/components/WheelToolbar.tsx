// @ts-nocheck
import React from "react";
import { t } from '../i18n';

/**
 * WheelToolbar - 现代化 PNG 图标工具栏
 * 特点: 玻璃态背景、悬停动效、圆润边角
 */

interface WheelToolbarProps {
    lockBrightness: boolean;
    setLockBrightness: (v: boolean) => void;
    showAnalog: boolean;
    setShowAnalog: (v: boolean) => void;
    showComp: boolean;
    setShowComp: (v: boolean) => void;
    isGrayscale: boolean;
    setIsGrayscale: (v: boolean) => void;
    viewMode: 'tab' | 'list';
    setViewMode: (v: 'tab' | 'list') => void;
    shape: 'square' | 'triangle';
    setShape: (v: 'square' | 'triangle') => void;
    onSettingsClick: () => void;
}

// 现代化图标按钮组件
const IconBtn: React.FC<{
    src: string;
    active?: boolean;
    onClick: () => void;
    title?: string;
}> = ({ src, active, onClick, title }) => {
    const [hover, setHover] = React.useState(false);
    
    return (
        <div 
            className="icon-btn"
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: 28,
                height: 28,
                margin: '0 2px',
                background: active 
                    ? '#3b9eff'
                    : 'transparent',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: hover && !active ? 'scale(1.08)' : 'scale(1)',
                boxShadow: active 
                    ? '0 0 0 3px rgba(59, 158, 255, 0.3), 0 2px 12px rgba(59, 158, 255, 0.5)' 
                    : 'none',
                border: 'none',
                position: 'relative'
            }}
        >
            <img 
                src={src} 
                style={{
                    width: 16, 
                    height: 16, 
                    display: 'block',
                    opacity: active ? 1 : hover ? 0.9 : 0.55,
                    filter: active ? 'brightness(1.3)' : 'none'
                }} 
            />
            {title && <span className="cwp3-tooltip">{title}</span>}
        </div>
    );
};

export const WheelToolbar: React.FC<WheelToolbarProps> = ({
    lockBrightness, setLockBrightness,
    showAnalog, setShowAnalog,
    showComp, setShowComp,
    isGrayscale, setIsGrayscale,
    viewMode, setViewMode,
    shape, setShape,
    onSettingsClick
}) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            background: '#242424',
            borderRadius: 14,
            marginBottom: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
            {/* Left Group */}
            <div style={{display: 'flex', gap: 8}}>
                <IconBtn 
                    src={lockBrightness ? "./icon_lock.png" : "./icon_brightness.png"}
                    active={lockBrightness}
                    onClick={() => setLockBrightness(!lockBrightness)}
                    title={t('lock_brightness')}
                />
                <IconBtn 
                    src="./icon_analog.png"
                    active={showAnalog}
                    onClick={() => setShowAnalog(!showAnalog)}
                    title={t('harmony_analog')}
                />
                <IconBtn 
                    src="./icon_comp.png"
                    active={showComp}
                    onClick={() => setShowComp(!showComp)}
                    title={t('harmony_comp')}
                />
            </div>

            {/* Divider */}
            <div style={{
                width: 1,
                height: 20,
                background: 'rgba(255,255,255,0.15)',
                margin: '0 8px'
            }} />

            {/* Right Group */}
            <div style={{display: 'flex', gap: 8}}>
                <IconBtn 
                    src="./icon_grayscale.png"
                    active={isGrayscale}
                    onClick={() => setIsGrayscale(!isGrayscale)}
                    title={t('toggle_grayscale')}
                />
                <IconBtn 
                    src="./icon_view.png"
                    onClick={() => setViewMode(viewMode === 'tab' ? 'list' : 'tab')}
                    title={t('toggle_view')}
                />
                <IconBtn 
                    src={shape === 'triangle' ? "./icon_square.png" : "./icon_shape.png"}
                    onClick={() => setShape(shape === 'square' ? 'triangle' : 'square')}
                    title="切换形状"
                />
                
                {/* SETTINGS BUTTON */}
                <IconBtn 
                    src="./Setting.png" 
                    onClick={onSettingsClick}
                    title={t('settings')}
                />
            </div>
        </div>
    );
};
