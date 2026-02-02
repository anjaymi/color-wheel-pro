import React, { useRef, useState } from "react";
import "./controls.scss";

interface SimpleSliderProps {
    value: number;       // Current value (0 to 1)
    onChange: (value: number) => void;
    label: string;
    displayValue: string; // Text to show on the right (e.g. "20px")
}

export const SimpleSlider: React.FC<SimpleSliderProps> = ({
    value,
    onChange,
    label,
    displayValue
}) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Force "Mouse Mode": Prevent standard browser gestures (scroll/zoom) for Pen/Touch
        e.preventDefault(); 
        e.stopPropagation();
        
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        updateValue(e.clientX);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        
        // Prevent default behavior during drag too
        e.preventDefault();
        e.stopPropagation();
        
        updateValue(e.clientX);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const updateValue = (clientX: number) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const newValue = Math.max(0, Math.min(1, x / rect.width));
        onChange(newValue);
    };

    return (
        <div className="simple-slider">
            <span className="label">{label}</span>
            <div 
                ref={trackRef}
                className="track-container"
                style={{ touchAction: 'none' }} // Inline enforcement for Pen logic
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp} // Handle interruption
                onPointerLeave={handlePointerUp}
            >
                <div className="track">
                    <div className="fill" style={{ width: `${value * 100}%` }} />
                    <div 
                        className={`thumb ${isDragging ? 'dragging' : ''}`}
                        style={{ left: `calc(${value * 100}% - 6px)` }} 
                    />
                </div>
            </div>
            <span className="value">{displayValue}</span>
        </div>
    );
};
