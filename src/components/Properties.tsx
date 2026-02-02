import React, { useState, useEffect, useRef, useCallback } from "react";
import { setBrushSize, setBrushOpacity, setBrushFlow, setBrushHardness, setBrushSpacing, getBrushProperties } from "../api/photoshop";
import { action } from "photoshop";
import { t } from "../i18n";

// Spectrum Slider 组件封装
interface SpSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

const SpSlider: React.FC<SpSliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
}) => {
  const sliderRef = useRef<HTMLElement>(null);
  
  // 监听 sp-slider 的 input 事件
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    
    const handleInput = (e: Event) => {
      const target = e.target as any;
      if (target && typeof target.value === 'number') {
        onChange(target.value);
      }
    };
    
    el.addEventListener('input', handleInput);
    return () => el.removeEventListener('input', handleInput);
  }, [onChange]);
  
  // 同步 value 到 sp-slider
  useEffect(() => {
    const el = sliderRef.current;
    if (el) {
      (el as any).value = value;
    }
  }, [value]);

  return (
    <div className="slider-row">
      <span className="slider-label">{label}</span>
      {/* @ts-ignore - sp-slider 是 UXP 内置 Web Component */}
      <sp-slider
        ref={sliderRef}
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ flex: 1 }}
      />
      <span className="slider-value">{Math.round(value)}{unit}</span>
    </div>
  );
};

export interface PropertiesRef {
  refresh: () => Promise<void>;
}

export const Properties = React.forwardRef<PropertiesRef>((props, ref) => {
  const [size, setSize] = useState(15);
  const [opacity, setOpacity] = useState(100);
  const [flow, setFlow] = useState(100);
  const [hardness, setHardness] = useState(0);
  const [spacing, setSpacing] = useState(25);

  React.useImperativeHandle(ref, () => ({
    refresh: () => sync()
  }));

  useEffect(() => {
    sync();

    const listener = (event: string, descriptor: any) => {
      if (event === "select" || event === "set" || event === "reset") {
        sync();
      }
    };

    action.addNotificationListener(["select", "set", "reset"], listener);

    return () => {
      action.removeNotificationListener(["select", "set", "reset"], listener);
    };
  }, []);

  const sync = async () => {
    const props = await getBrushProperties();
    if (props) {
      if (props.size) setSize(props.size);
      if (props.opacity !== undefined) setOpacity(props.opacity);
      if (props.flow !== undefined) setFlow(props.flow);
      if (props.hardness !== undefined) setHardness(props.hardness);
      if (props.spacing !== undefined) setSpacing(props.spacing);
    }
  };

  const handleSizeChange = useCallback(async (newSize: number) => {
    setSize(newSize);
    await setBrushSize(newSize);
  }, []);

  const handleOpacityChange = useCallback(async (newVal: number) => {
    setOpacity(newVal);
    await setBrushOpacity(newVal);
  }, []);

  const handleFlowChange = useCallback(async (newVal: number) => {
    setFlow(newVal);
    await setBrushFlow(newVal);
  }, []);

  const handleHardnessChange = useCallback(async (newVal: number) => {
    setHardness(newVal);
    await setBrushHardness(newVal);
  }, []);

  const handleSpacingChange = useCallback(async (newVal: number) => {
    setSpacing(newVal);
    await setBrushSpacing(newVal);
  }, []);

  return (
    <div className="property-panel">
      {/* Header removed - Sync moved to footer */}

      {/* Group 1: Primary Properties (Size, Opacity) */}
      <div className="sliders-frame" style={{ marginBottom: "8px" }}>
        <SpSlider label={t("size")} value={size} onChange={handleSizeChange} min={1} max={500} unit="px" />
        <SpSlider label={t("opacity")} value={opacity} onChange={handleOpacityChange} />
      </div>

      {/* Group 2: Secondary Properties (Flow, Hardness, Spacing) */}
      <div className="sliders-frame">
        <SpSlider label={t("flow")} value={flow} onChange={handleFlowChange} />
        <SpSlider label={t("hardness")} value={hardness} onChange={handleHardnessChange} />
        <SpSlider label={t("spacing")} value={spacing} onChange={handleSpacingChange} min={1} max={200} />
      </div>
    </div>
  );
});
