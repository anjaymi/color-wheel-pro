import React, { useMemo } from "react";
import { hsvToRgb } from "../utils/color";

interface HueRingProps {
    size: number;
    innerRadius: number;
    radius: number;
    center: number;
    roataionOffset: number;
    isGrayscale: boolean;
}

export const HueRing = React.memo(({ size, innerRadius, radius, center, roataionOffset, isGrayscale }: HueRingProps) => {

    // --- SVG DATA URI RING (Vector Quality, Single DOM Node) ---
    const SvgImageRing = useMemo(() => {
        let paths = '';
        const f = (n:number) => n.toFixed(1);
        
        for (let i = 0; i < 360; i++) {
             // 反转方向（逆时针）并应用旋转偏移，与 PS 一致
             const adjustedHue = (360 - i + roataionOffset + 360) % 360;
             const startA = (i - 90) * Math.PI / 180;
             const endA = (i + 1.5 - 90) * Math.PI / 180;
             
             const x1 = center + radius * Math.cos(startA);
             const y1 = center + radius * Math.sin(startA);
             const x2 = center + radius * Math.cos(endA);
             const y2 = center + radius * Math.sin(endA);
             const x3 = center + innerRadius * Math.cos(endA);
             const y3 = center + innerRadius * Math.sin(endA);
             const x4 = center + innerRadius * Math.cos(startA);
             const y4 = center + innerRadius * Math.sin(startA);
             
             const d = `M${f(x1)} ${f(y1)}A${radius} ${radius} 0 0 1 ${f(x2)} ${f(y2)}L${f(x3)} ${f(y3)}A${innerRadius} ${innerRadius} 0 0 0 ${f(x4)} ${f(y4)}Z`;
             
             // 使用调整后的色相值生成颜色
             const c = hsvToRgb(adjustedHue, 100, 100);
             const fill = `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;
             paths += `<path d="${d}" fill="${fill}" stroke="none"/>`;
        }
        
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${paths}</svg>`;
        const src = `data:image/svg+xml;base64,${btoa(svg)}`;

        return (
             <img 
                src={src}
                alt="Hue Ring"
                style={{
                    position: 'absolute', top: 0, left: 0,
                    width: size, height: size,
                    pointerEvents: 'none',
                    filter: isGrayscale ? 'grayscale(1)' : 'none',
                    display: 'block'
                }}
             />
        );
    }, [size, innerRadius, radius, center, isGrayscale, roataionOffset]);

    return (
        <div style={{
            position:'absolute', top:0, left:0, 
            width:size, height:size, pointerEvents:'none'
        }}>
            {SvgImageRing}
        </div>
    );
});

