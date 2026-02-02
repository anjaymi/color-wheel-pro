import React, { useRef, useEffect, useState, useCallback } from "react";

interface GradientSliderProps {
    value: number;
    max: number;
    onChange: (newValue: number) => void;
    gradient: string;
    onCommit?: () => void;
}

export const GradientSlider = React.memo(({ value, max, onChange, gradient, onCommit }: GradientSliderProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const rectRef = useRef<{left: number, width: number} | null>(null);
    const rafRef = useRef<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Optimize: Use Refs to capture latest callbacks without re-triggering effects
    const onChangeRef = useRef(onChange);
    const onCommitRef = useRef(onCommit);

    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { onCommitRef.current = onCommit; }, [onCommit]);

    // Sync React state to DOM (Only when NOT dragging, to avoid jitter)
    useEffect(() => {
        if (!isDragging && thumbRef.current) {
            thumbRef.current.style.left = `${(value / max) * 100}%`;
        }
    }, [value, max, isDragging]);

    const handleMove = useCallback((clientX: number) => {
        let rect = rectRef.current;
        // Lazy-load rect if missing (fallback)
        if (!rect && containerRef.current) {
            rect = containerRef.current.getBoundingClientRect();
            rectRef.current = rect;
        }
        if (!rect) return;

        const x = clientX - rect.left;
        const rawPct = Math.max(0, Math.min(1, x / rect.width));
        const newValue = Math.round(rawPct * max);
        
        // 1. INSTANT VISUAL UPDATE (Bypass React for 0 latency)
        if (thumbRef.current) {
            thumbRef.current.style.left = `${rawPct * 100}%`;
        }
        
        // 2. Throttled State Update via RAF
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            if (onChangeRef.current) {
                onChangeRef.current(newValue);
            }
            rafRef.current = null;
        });
    }, [max]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Cache rect on start to avoid layout thrashing during drag
        if (containerRef.current) {
            rectRef.current = containerRef.current.getBoundingClientRect();
        }
        setIsDragging(true);
        handleMove(e.clientX);
    }, [handleMove]);

    useEffect(() => {
        if (!isDragging) return;

        const onMouseMove = (e: MouseEvent) => {
            e.preventDefault(); // Prevent text selection
            handleMove(e.clientX);
        };
        
        const onMouseUp = () => {
            setIsDragging(false);
            rectRef.current = null; // Clear cache
            if (onCommitRef.current) onCommitRef.current();
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isDragging, handleMove]);

    return (
        <div 
            ref={containerRef}
            className="gradient-slider-container" 
            onMouseDown={handleMouseDown}
            style={{
                position:'relative', flex:1, height:24,
                display:'flex', alignItems:'center', overflow:'visible',
                cursor: 'pointer'
            }}
        >
            <div className="track-bg" style={{ 
                position:'relative', width:'100%', height: 10,
                background: gradient,
                borderRadius: 5,
                border: '1px solid rgba(255,255,255,0.2)',
                boxSizing: 'border-box',
                overflow: 'hidden',
                pointerEvents: 'none' 
            }}></div>
            
            <div 
                ref={thumbRef}
                style={{
                    position: 'absolute',
                    top: '50%',
                    width: 14, height: 14,
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                    background: 'transparent',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 10
                }} 
            />
        </div>
    );
});
