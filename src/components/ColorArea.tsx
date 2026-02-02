// @ts-nocheck
import React, { useMemo } from "react";
import { hsvToRgb } from "../utils/color";

interface ColorAreaProps {
    shape: 'square' | 'triangle';
    hsv: { h: number; s: number; v: number };
    size: number;
    isGrayscale: boolean;
    triGeom: any;
    offset: number;
    boxSize: number;
}

const toGray = (r:number, g:number, b:number) => {
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    return `rgb(${gray},${gray},${gray})`;
};

export const ColorArea = React.memo(({ shape, hsv, size, isGrayscale, triGeom, offset, boxSize }: ColorAreaProps) => {

    // --- STATIC PNG IMAGE RENDERER (Triangle) ---
    const TriangleAreaImage = useMemo(() => {
        if (shape !== 'triangle') return null;

        const { x1, y1, x2, y2, x3, y3 } = triGeom;
        const c = hsvToRgb(hsv.h, 100, 100);
        const hueColor = isGrayscale 
            ? toGray(c.r, c.g, c.b)
            : `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

        const points = `${Math.round(x1)},${Math.round(y1)} ${Math.round(x2)},${Math.round(y2)} ${Math.round(x3)},${Math.round(y3)}`;

        return (
            <div style={{position:'absolute', top:0, left:0, width:size, height:size, pointerEvents:'none'}}>
                 {/* Layer 1: Base Hue Color (Solid SVG) */}
                 <svg width={size} height={size} style={{position:'absolute', top:0, left:0}}>
                    <polygon points={points} fill={hueColor} />
                 </svg>

                 {/* Layer 2: Gradient Overlay (使用 mask 裁剪) */}
                 <img 
                    src="./triangle_overlay.png" 
                    style={{
                        position:'absolute', top:0, left:0, width:size, height:size,
                        mixBlendMode: isGrayscale ? 'luminosity' : 'normal',
                        WebkitMaskImage: 'url(./triangle_mask.png)',
                        WebkitMaskSize: 'cover',
                        maskImage: 'url(./triangle_mask.png)',
                        maskSize: 'cover'
                    }} 
                 />
            </div>
        );
    }, [shape, hsv.h, triGeom, size, isGrayscale]);

    // --- CSS RENDERER (Square) ---
    const ColorAreaCSS = useMemo(() => {
        if (shape !== 'square') return null;

        const c = hsvToRgb(hsv.h, 100, 100); 
        const hueColor = isGrayscale 
            ? toGray(c.r, c.g, c.b)
            : `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
        
        const styleCommon: React.CSSProperties = {
            position: 'absolute', top: 0, left: 0,
            width: size, height: size,
            pointerEvents: 'none'
        };

        return (
             <div style={styleCommon}>
                 <div style={{
                     position: 'absolute', left: offset, top: offset,
                     width: boxSize, height: boxSize,
                     backgroundColor: hueColor
                 }} />
                 <div style={{
                     position: 'absolute', left: offset, top: offset,
                     width: boxSize, height: boxSize,
                     background: 'linear-gradient(to right, white, transparent)'
                 }} />
                 <div style={{
                     position: 'absolute', left: offset, top: offset,
                     width: boxSize, height: boxSize,
                     background: 'linear-gradient(to top, black, transparent)'
                 }} />
             </div>
        );
    }, [hsv.h, shape, size, offset, boxSize, isGrayscale]);

    return shape === 'square' ? ColorAreaCSS : TriangleAreaImage;
});
