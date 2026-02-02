/**
 * useHybridPressure - Hybrid 压感模块 Hook
 * 
 * 使用方法：
 * const { addon, isAvailable, getPressure, setPressure } = useHybridPressure();
 */
import { useState, useEffect, useRef } from 'react';

// Addon 模块类型定义
interface HybridAddon {
    hello: () => string;
    getPressure: () => { pressure: number };
    setPressure: (value: number) => boolean;
}

interface UseHybridPressureResult {
    addon: HybridAddon | null;
    isAvailable: boolean;
    isLoading: boolean;
    error: string | null;
    getPressure: () => number;
    setPressure: (value: number) => void;
}

/**
 * 加载 Hybrid Addon 模块
 */
async function loadAddon(): Promise<HybridAddon | null> {
    try {
        const addonModule = require("bolt-uxp-hybrid.uxpaddon");
        // require 返回 Promise
        const addon = addonModule instanceof Promise ? await addonModule : addonModule;
        
        if (addon && typeof addon.hello === 'function') {
            console.log("[HybridPressure] ✅ Addon loaded -", addon.hello());
            return addon as HybridAddon;
        }
        return null;
    } catch (e) {
        console.warn("[HybridPressure] ❌ Failed to load addon:", e);
        return null;
    }
}

/**
 * React Hook - 使用 Hybrid 压感模块
 */
export function useHybridPressure(): UseHybridPressureResult {
    const [addon, setAddon] = useState<HybridAddon | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // 缓存的压感值（用于 fallback）
    const pressureRef = useRef(0.5);

    useEffect(() => {
        loadAddon()
            .then(loadedAddon => {
                setAddon(loadedAddon);
                setIsLoading(false);
                if (!loadedAddon) {
                    setError("Addon not available");
                }
            })
            .catch(e => {
                setError(String(e));
                setIsLoading(false);
            });
    }, []);

    // 获取压感
    const getPressure = (): number => {
        if (addon) {
            try {
                const result = addon.getPressure();
                pressureRef.current = result.pressure;
                return result.pressure;
            } catch {
                return pressureRef.current;
            }
        }
        return pressureRef.current;
    };

    // 设置压感（从 JS PointerEvent 同步到 C++）
    const setPressure = (value: number): void => {
        pressureRef.current = value;
        if (addon) {
            try {
                addon.setPressure(value);
            } catch {
                // 忽略错误
            }
        }
    };

    return {
        addon,
        isAvailable: addon !== null,
        isLoading,
        error,
        getPressure,
        setPressure,
    };
}

export default useHybridPressure;
