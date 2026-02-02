// BMP Encoder for UXP (Pure JS)
// Bypasses Canvas.toDataURL and other broken APIs

export function generateSquareBMP(hue: number, size: number = 64): string {
    // 1. Prepare Buffer
    // BMP Header (14) + InfoHeader (40) + Data (size*size*3 + padding)
    // Row size must be multiple of 4 bytes.
    // 3 bytes per pixel (BGR).
    const rowSize = Math.floor((3 * size + 3) / 4) * 4;
    const fileSize = 54 + rowSize * size;
    const buffer = new Uint8Array(fileSize);
    const view = new DataView(buffer.buffer);

    // 2. BMP Header
    // 'BM'
    buffer[0] = 0x42; buffer[1] = 0x4D;
    // File Size
    view.setUint32(2, fileSize, true);
    // Offset to Data
    view.setUint32(10, 54, true);

    // 3. Info Header
    view.setUint32(14, 40, true); // Header Size
    view.setInt32(18, size, true); // Width
    view.setInt32(22, size, true); // Height (Bottom-up if positive? No, usually standard is bottom-up)
    // Actually, usually BMP is stored bottom-up (Row size-1 is top of image).
    // Let's use negative height for top-down? Or just write bottom-up.
    // Standard BMP is bottom-up. row 0 is bottom.
    
    view.setUint16(26, 1, true); // Planes
    view.setUint16(28, 24, true); // BPP (RGB)
    
    // 4. Pixel Data
    // We need to generate S-V gradient.
    // Square: x=S, y=V.
    // But V is inverted (Top=100, Bot=0).
    // BMP Row 0 is Bottom. So Row 0 is V=0 (Black).
    // Row Size-1 is Top. V=100.
    
    // We need color util here. 
    // We can inline hsvToRgb or import it.
    // Optimization: Precalc Hue params.
    
    // hsvToRgb logic for generic H:
    const h = hue;
    const s_scale = 100 / (size - 1);
    const v_scale = 100 / (size - 1);

    let offset = 54;
    
    // Iterate Rows (Bottom to Top)
    // y=0 -> Bottom (V=0)
    // y=size-1 -> Top (V=100)
    for (let y = 0; y < size; y++) {
        const v = y * v_scale; // 0 to 100
        
        for (let x = 0; x < size; x++) {
            const s = x * s_scale; // 0 to 100
            
            // HSV to RGB
            const hp = h / 60;
            const c = (v / 100) * (s / 100); // V * S
            const x_val = c * (1 - Math.abs(hp % 2 - 1));
            const m = (v / 100) - c;

            let r = 0, g = 0, b = 0;
            if (hp >= 0 && hp < 1) { r = c; g = x_val; }
            else if (hp >= 1 && hp < 2) { r = x_val; g = c; }
            else if (hp >= 2 && hp < 3) { g = c; b = x_val; }
            else if (hp >= 3 && hp < 4) { g = x_val; b = c; }
            else if (hp >= 4 && hp < 5) { r = x_val; b = c; }
            else { r = c; b = x_val; }
            
            const R = Math.round((r + m) * 255);
            const G = Math.round((g + m) * 255);
            const B = Math.round((b + m) * 255);

            // Write BGR
            const pxOffset = offset + x * 3;
            buffer[pxOffset] = B;
            buffer[pxOffset+1] = G;
            buffer[pxOffset+2] = R;
        }
        // Padding is handled by jumping strict rowSize? or just filling?
        // My offset logic was naive.
        offset += rowSize;
    }

    // 5. Convert to Base64
    // UXP doesn't support btoa on Uint8Array directly? 
    // Use String.fromCharCode...
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return 'data:image/bmp;base64,' + window.btoa(binary);
}
