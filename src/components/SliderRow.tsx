import React, { useCallback } from "react"; // Explicit React import
import { GradientSlider } from "./GradientSlider";

interface SliderRowProps {
    id?: string;
    label: string;
    value: number;
    max: number;
    onChange: (id: string, value: number) => void; // Parent expects (id, value)
    bg: string;
    showInput?: boolean;
    onCommit?: () => void;
}

export const SliderRow = React.memo(({ id, label, value, max, onChange, bg, showInput, onCommit }: SliderRowProps) => {
    
    // CURRYING: Adapt the GradientSlider's (val) => void to Parent's (id, val) => void
    const handleChange = useCallback((newValue: number) => {
        if (id) {
            onChange(id, newValue);
        }
    }, [id, onChange]);

    return (
      <div className="slider-row">
          <div className="slider-label">{label}</div>
          <GradientSlider 
              value={value} 
              max={max} 
              onChange={handleChange} 
              onCommit={onCommit} 
              gradient={bg} 
          />
          {showInput && (
              <input 
                type="number" 
                className="num-input" 
                value={value} 
                readOnly 
                tabIndex={-1}
                style={{
                    background: '#2a2d32',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: 'none',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    color: '#ccc',
                    fontSize: '11px',
                    fontWeight: 500,
                    textAlign: 'center',
                    width: '40px',
                    padding: '4px 6px'
                }}
              />
          )}
      </div>
    );
});
