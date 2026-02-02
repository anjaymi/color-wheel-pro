import React from "react";

interface BrushListProps {
  activeTool: string;
}

export const BrushList: React.FC<BrushListProps> = ({ activeTool }) => {
  return (
    <div className="brush-list" style={{ display: 'none' }}>
      {/* Placeholder removed for Pro UI compactness */}
    </div>
  );
};
