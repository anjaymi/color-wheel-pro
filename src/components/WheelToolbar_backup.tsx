import React from "react";
import { t } from '../utils/i18n';

/**
 * WheelToolbar - 使用 PNG 图标的工具栏
 * PNG 图标放置在 dist/ 目录下
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
}

// 图标按钮组件
const IconBtn: React.FC<{
    src: string;
    active?: boolean;
    onClick: () => void;
    title?: string;
}> = ({ src, active, onClick, title }) => (
    <div 
        onClick={onClick}
        title={title}
        style={{
            width: 28,
            height: 28,
            background: active ? '#666' : '#444',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
        }}
    >
        <img src={src} style={{width: 16, height: 16, display: 'block'}} />
    </div>
);

export const WheelToolbar: React.FC<WheelToolbarProps> = ({
    lockBrightness, setLockBrightness,
    showAnalog, setShowAnalog,
    showComp, setShowComp,
    isGrayscale, setIsGrayscale,
    viewMode, setViewMode,
    shape, setShape
}) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '4px 8px',
            background: '#3a3a3a',
            borderRadius: 4,
            marginBottom: 8
        }}>
            {/* Left Group */}
            <div style={{display: 'flex', gap: 4}}>
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

            {/* Right Group */}
            <div style={{display: 'flex', gap: 4}}>
                <IconBtn 
                    src="./icon_grayscale.png"
                    active={isGrayscale}
                    onClick={() => setIsGrayscale(!isGrayscale)}
                    title="Toggle Grayscale"
                />
                <IconBtn 
                    src="./icon_view.png"
                    onClick={() => setViewMode(viewMode === 'tab' ? 'list' : 'tab')}
                    title="Toggle View Mode"
                />
                <IconBtn 
                    src="./icon_shape.png"
                    onClick={() => setShape(shape === 'square' ? 'triangle' : 'square')}
                    title="Toggle Wheel Shape"
                />
            </div>
        </div>
    );
};
