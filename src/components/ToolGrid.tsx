import React, { useState } from "react";
import ReactDOM from "react-dom";
import { selectTool } from "../api/photoshop";

interface ToolGridProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  // ... (Icons remain same, skipping for brevity in replacement if map assumes existance, but tool requires content. I will assume I only need to replace the component body mostly)
  brush: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34a.996.996 0 0 0-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>
    </svg>
  ),
  eraser: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.14 3c-.51 0-1.02.2-1.41.59L2.59 14.73c-.78.77-.78 2.04 0 2.83L5.17 20c.39.39.9.59 1.41.59h13.33V18h-6.32l8.49-8.49c.78-.78.78-2.05 0-2.83l-2.52-2.52c-.4-.39-.91-.59-1.42-.59zM9 16.17L6.83 14 15.14 5.69 17.31 7.86 9 16.17z"/>
    </svg>
  ),
  mixer: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.8 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
      <path d="M7.83 14c.37 0 .67.26.74.62.41 2.22 2.28 2.98 3.64 2.87.43-.02.79.32.79.75 0 .4-.32.73-.72.75-2.13.13-4.62-1.09-5.19-4.12a.75.75 0 0 1 .74-.87z"/>
    </svg>
  ),
  smudge: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 13c1.1-3.5 6.5-5.91 7.84-2.19.78 2.14-.94 4.19-3.34 4.19H5.06c-1.39 0-1.74-2-.41-2.61.88-.41 2.28-.93 4.35.61zM10.87 5.7c2.29-.62 4.06 1.83 3.64 3.76-.28 1.28-1.55 2.54-3.51 2.54-1.28 0-3-.55-3-1.89 0-1.89 1.57-4 2.87-4.41zm-1.63-3.61c2.45-.66 4.41 1.95 3.96 4.01-.3 1.36-1.68 2.7-3.81 2.7-1.39 0-3.27-.6-3.27-2.06 0-2.07 1.71-4.36 3.12-4.65z"/>
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.995.995 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  ),
  clone: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6h-2c0-2.21-1.79-4-4-4S9 3.79 9 6H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM13 4c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm0 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
      <circle cx="13" cy="13" r="1.5" />
    </svg>
  ),
};

const TOOLS = [
  { id: "brush", name: "画笔 (Brush)" },
  { id: "eraser", name: "橡皮 (Eraser)" },
  { id: "mixer", name: "混合器画笔 (Mixer)" },
  { id: "smudge", name: "涂抹 (Smudge)" },
  { id: "pencil", name: "铅笔 (Pencil)" },
  { id: "clone", name: "仿制图章 (Clone)" },
];

export const ToolGrid: React.FC<ToolGridProps> = ({
  activeTool,
  onSelectTool,
}) => {
  const [tooltip, setTooltip] = useState<{show: boolean, x: number, y: number, text: string}>({show: false, x: 0, y: 0, text: ""});

  const handleSelect = async (toolId: string) => {
    onSelectTool(toolId);
    await selectTool(toolId);
  };

  return (
    <div className="tool-grid">
      {TOOLS.map((tool) => (
        <div
          key={tool.id}
          className={`tool-btn ${activeTool === tool.id ? "active" : ""}`}
          onClick={() => handleSelect(tool.id)}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltip({
              show: true,
              x: rect.left, 
              y: rect.bottom + 5, // Below the item for top toolbar? Or Top? 
              // Usually top toolbar tooltips go BELOW.
              text: tool.name
            });
          }}
          onMouseLeave={() => setTooltip(prev => ({...prev, show: false}))}
        >
          {TOOL_ICONS[tool.id]}
        </div>
      ))}
      
      {/* Global Tooltip Portal */}
      {tooltip.show && ReactDOM.createPortal(
        <div style={{
          position: "fixed",
          top: tooltip.y,
          left: tooltip.x,
          // If Y is bottom, we don't translate Y -100%. check logic.
          // y = rect.bottom + 5. Transform should be (0, 0) if we want it below.
          background: "#333",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          whiteSpace: "nowrap",
          zIndex: 99999,
          pointerEvents: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          border: "1px solid #555"
        }}>
          {tooltip.text}
        </div>,
        document.body
      )}
    </div>
  );
};
