import React, { useState } from "react";
import "../styles/components.scss";

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export const CollapsibleSection = ({ title, children, defaultOpen = true }: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="cw-section" style={{ position: 'relative' }}>
             {/* Header: Title + Toggle */}
             <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', marginBottom: isOpen ? 6 : 0,
                    userSelect: 'none'
                }}
             >
                 <div className="cw-section-title">{title}</div>
                 <div style={{
                     fontSize: 10, color: '#888', 
                     transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                     transition: 'transform 0.2s'
                 }}>
                     ▼
                 </div>
             </div>
             
             {/* Content */}
             {isOpen && (
                 <div style={{display:'flex', flexDirection:'column', gap:8}}>
                     {children}
                 </div>
             )}
        </div>
    );
};
