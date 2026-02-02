/**
 * HistoryPanel - 历史颜色面板
 * 参考设计：双排布局 + 历史图标 + 清空按钮
 */
import React from "react";
import "./controls.scss";
import { t } from "../../utils/i18n";

interface HistoryPanelProps {
    colors: string[];
    onSelect: (color: string) => void;
    onClear?: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
    colors,
    onSelect,
    onClear
}) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    return (
        <div className="history-panel-v2">
            {/* 标题栏 */}
            <div 
                className="history-header" 
                style={{ justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <span className="history-title">{t('recent_title')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {colors.length > 0 && onClear && (
                        <button 
                            className="history-clear" 
                            onClick={(e) => { e.stopPropagation(); onClear(); }} 
                            title="清空历史"
                        >
                            ✕
                        </button>
                    )}
                    <span style={{ 
                        fontSize: 10,
                        color: '#888',
                        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        display: 'inline-block'
                    }}>▼</span>
                </div>
            </div>
            
            {/* 颜色网格 */}
            {!isCollapsed && (
                colors.length === 0 ? (
                    <div className="history-empty">{t('no_history')}</div>
                ) : (
                    <div className="history-grid-v2" style={{ display: 'flex', flexWrap: 'wrap', margin: '-2px' }}>
                        {colors.map((color, i) => (
                            <div 
                                key={i}
                                className="history-swatch-v2"
                                style={{ 
                                    backgroundColor: color,
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    margin: '2px'
                                }}
                                onClick={() => onSelect(color)}
                                title={color}
                            />
                        ))}
                    </div>
                )
            )}
        </div>
    );
};
