import React, { useMemo } from "react";
import { hsvToRgb } from "../utils/color";

interface WheelIndicatorsProps {
    hsv: { h: number; s: number; v: number };
    shape: 'square' | 'triangle';
    size: number;
    center: number;
    radius: number;
    innerRadius: number;
    offset: number;
    boxSize: number;
    triGeom: any;
    rotationOffset: number;
    showAnalog: boolean;
    showComp: boolean;
}

export const WheelIndicators = React.memo(({ 
    hsv, shape, size, center, radius, innerRadius, offset, boxSize, triGeom, rotationOffset, 
    showAnalog, showComp 
}: WheelIndicatorsProps) => {

    return useMemo(() => {
        // 1. Hue Indicator Calculation
        // 色环已反转为逆时针，指示器也需要反转
        // adjustedHue = (360 - hue + offset) % 360，位置角度 = adjustedHue - 90
        const ringMid = (radius + innerRadius) / 2;
        const indicatorAngle = (360 - hsv.h + rotationOffset) % 360;
        const hueRad = (indicatorAngle - 90) * (Math.PI / 180);
        const hx = center + ringMid * Math.cos(hueRad);
        const hy = center + ringMid * Math.sin(hueRad);

        // 2. Inner Indicator Calculation (SV indicator)
        let ix = 0, iy = 0;
        if (shape === 'square') {
            const s = hsv.s / 100;
            const v = hsv.v / 100;
            ix = offset + s * boxSize;
            iy = offset + (1 - v) * boxSize;
        } else {
            const { x1, y1, x2, y2, x3, y3 } = triGeom;
            // Barycentric mapping for triangle
            const V = hsv.v / 100;
            const S = hsv.s / 100;
            const w2 = 1 - V;       // Black vertex weight
            const w3 = (1 - S) * V; // White vertex weight
            const w1 = 1 - w2 - w3; // Color vertex weight
            ix = w1*x1 + w2*x2 + w3*x3;
            iy = w1*y1 + w2*y2 + w3*y3;
        }

        const c = hsvToRgb(hsv.h, hsv.s, hsv.v);
        const fillColor = `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;

        // 3. Harmony calculations
        const baseAngle = 360 - hsv.h;

        const compRad = (baseAngle + rotationOffset + 180 - 90) * (Math.PI / 180);
        const compX = center + ringMid * Math.cos(compRad);
        const compY = center + ringMid * Math.sin(compRad);
        
        const ana1Rad = (baseAngle + rotationOffset + 30 - 90) * (Math.PI / 180);
        const ana2Rad = (baseAngle + rotationOffset - 30 - 90) * (Math.PI / 180);
        
        const ana1X = center + ringMid * Math.cos(ana1Rad);
        const ana1Y = center + ringMid * Math.sin(ana1Rad);
        const ana2X = center + ringMid * Math.cos(ana2Rad);
        const ana2Y = center + ringMid * Math.sin(ana2Rad);

        // Common Handle Style
        const handleStyle: React.CSSProperties = {
            position: 'absolute',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 10
        };

        return (
            <div style={{position:'absolute', top:0, left:0, width:size, height:size, pointerEvents:'none'}}>
                {/* Hue Handle on Ring */}
                <div style={{
                    ...handleStyle, 
                    left: hx, 
                    top: hy, 
                    width: 12, 
                    height: 12,
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 2px rgba(0,0,0,0.5)',
                    backgroundColor: 'transparent'
                }} />

                {/* SV Handle inside shape */}
                <div style={{
                    ...handleStyle, 
                    left: ix, 
                    top: iy,
                    width: 12,
                    height: 12,
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 2px rgba(0,0,0,0.5)',
                    backgroundColor: fillColor
                }} />
            
                {/* Complementary Color Indicator */}
                {showComp && (
                    <div style={{
                        ...handleStyle, 
                        left: compX, 
                        top: compY,
                        width: 10, 
                        height: 10,
                        border: '1.5px solid #fff',
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
                        backgroundColor: 'rgba(0,0,0,0.4)'
                    }} />
                )}

                {/* Analogous Color Indicators */}
                {showAnalog && (
                    <>
                        <div style={{
                            ...handleStyle, 
                            left: ana1X, 
                            top: ana1Y,
                            width: 6, 
                            height: 6,
                            border: '1px solid #fff',
                            backgroundColor: 'rgba(255,255,255,0.6)'
                        }} />
                        <div style={{
                            ...handleStyle, 
                            left: ana2X, 
                            top: ana2Y,
                            width: 6, 
                            height: 6,
                            border: '1px solid #fff',
                            backgroundColor: 'rgba(255,255,255,0.6)'
                        }} />
                    </>
                )}
            </div>
        );
    }, [hsv, shape, triGeom, showComp, showAnalog, center, radius, innerRadius, rotationOffset, size, offset, boxSize]);
});
