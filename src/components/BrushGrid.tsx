import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom"; // Import ReactDOM
import { getCurrentBrushInfo, selectBrushByName } from "../api/photoshop";
// ... (imports remain)

import { t } from "../i18n";
import { BRUSH_ICONS, ICON_GROUPS } from "./icons";

interface FavoriteBrush {
  id: string;
  name: string;
  type: 'brush' | 'toolPreset';
  iconKey?: string; // New: Icon key
  color?: string;   // New: Color tag
  toolId?: string;  // New: Associated tool ID
}

const TAG_COLORS = [
  "#cccccc", // Default
  "#ff5f5f", // Red
  "#ffaa5f", // Orange
  "#f5d76e", // Yellow
  "#8cd790", // Green
  "#4db6ac", // Cyan
  "#77bdfb", // Blue
  "#ba68c8", // Purple
];

interface BrushGridProps {
  activeTool?: string;
}

export const BrushGrid: React.FC<BrushGridProps> = ({ activeTool = "brush" }) => {
  const [favorites, setFavorites] = useState<FavoriteBrush[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  
  // Modal State
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [pendingBrush, setPendingBrush] = useState<{name: string, type: 'brush' | 'toolPreset'} | null>(null);
  const [selectedTagColor, setSelectedTagColor] = useState<string>("#cccccc");
  
  // View Mode State
  const [viewMode, setViewMode] = useState<'minimal' | 'detail'>('minimal');
  
  // Global Tooltip State (Fix for overflow clipping)
  const [tooltip, setTooltip] = useState<{show: boolean, x: number, y: number, text: string}>({show: false, x: 0, y: 0, text: ""});

  // 加载收藏 & View Mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem("brush_favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      } else {
        setFavorites([]);
      }
      
      const savedMode = localStorage.getItem("brush_view_mode");
      if (savedMode === 'detail') {
        setViewMode('detail');
      }
    } catch (e) {
      console.error("Load data failed:", e);
    }
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'minimal' ? 'detail' : 'minimal';
    setViewMode(newMode);
    localStorage.setItem("brush_view_mode", newMode);
  };

  // 保存收藏
  const saveFavorites = (list: FavoriteBrush[]) => {
    localStorage.setItem("brush_favorites", JSON.stringify(list));
    setFavorites(list);
  };

  // 添加收藏 - 第一步: 确认名称
  const handleAddStart = async () => {
    const info = await getCurrentBrushInfo();
    
    if (!info) {
      alert(t("no_brush_detected", "请先在 Photoshop 画笔面板中点击选中一个笔刷，然后再添加收藏。"));
      return;
    }

    const defaultName = info.name;
    const name = prompt(t("enter_name"), defaultName);
    
    if (name) {
      setPendingBrush({
        name: name,
        type: info.type
      });
      setSelectedTagColor("#cccccc"); // Reset color
      setShowIconPicker(true);
    }
  };

  // 添加收藏 - 第二步: 选择图标并保存
  const handleAddConfirm = (iconKey: string) => {
    if (pendingBrush) {
      const newFav: FavoriteBrush = {
        id: Date.now().toString(),
        name: pendingBrush.name,
        type: pendingBrush.type,
        iconKey: iconKey,
        color: selectedTagColor,
        toolId: activeTool // Save current tool context
      };
      saveFavorites([...favorites, newFav]);
      setShowIconPicker(false);
      setPendingBrush(null);
    }
  };

  // 删除收藏
  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t("confirm_remove"))) {
      const newList = favorites.filter((item) => item.id !== id);
      saveFavorites(newList);
      if (selectedIndex === id) setSelectedIndex(null);
    }
  };

  // 选择收藏
  const handleSelect = async (fav: FavoriteBrush) => {
    setSelectedIndex(fav.id);
    await selectBrushByName(fav.name, fav.type || 'brush');
  };

  // Placeholder for drag/drop handlers (assuming they will be defined elsewhere)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Logic for drag over
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Logic for drop
  };

  const removeFavorite = (id: string) => {
    if (confirm(t("confirm_remove", "确定要删除此收藏吗？"))) {
      const newList = favorites.filter((item) => item.id !== id);
      saveFavorites(newList);
      if (selectedIndex === id) setSelectedIndex(null);
    }
  };

  const handleAddWithIcon = (iconKey: string) => {
    if (pendingBrush) {
      const newFav: FavoriteBrush = {
        id: Date.now().toString(),
        name: pendingBrush.name,
        type: pendingBrush.type,
        iconKey: iconKey,
        color: selectedTagColor,
        toolId: activeTool // Save current tool context
      };
      saveFavorites([...favorites, newFav]);
      setShowIconPicker(false);
      setPendingBrush(null);
    }
  };

  return (
    <div className="brush-frame-container" style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100%", 
      overflow: "hidden",
      padding: "0 12px 8px 12px" /* Outer padding for the frame */
    }}>
      {/* The Visual Frame */}
      <div style={{
        display: "flex", 
        flexDirection: "column", 
        flex: 1,
        border: "1px solid #484848",
        borderRadius: "4px",
        background: "rgba(50, 50, 50, 0.3)",
        overflow: "hidden" // Clip children to radius
      }}>
        
        {/* Header: Favorites Count & Toggle */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.1)" // Slightly darker header
        }}>
          <span style={{ fontSize: "11px", color: "#888" }}>
            {favorites.length} {t("favorites_count", "个收藏")}
          </span>
          
          <button
            onClick={toggleViewMode}
            title={viewMode === 'minimal' ? "切换到列表视图" : "切换到网格视图"}
            style={{
              background: "#333",
              border: "1px solid #555",
              borderRadius: "4px",
              color: "#ddd",
              cursor: "pointer",
              padding: "2px 8px",
              fontSize: "10px",
              height: "22px",
              lineHeight: "18px",
              whiteSpace: "nowrap"
            }}
          >
            {viewMode === 'minimal' ? "切换到列表" : "切换到网格"}
          </button>
        </div>
        
        {/* Scrollable Grid */}
        <div 
          className="brush-grid"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ 
            flex: 1, 
            padding: "8px", 
            borderTop: "none",
            display: viewMode === 'detail' ? 'flex' : 'flex',
            flexWrap: 'wrap',
            gap: "4px",
            alignContent: "flex-start",
            overflowY: "auto"
          }}
        >
          {favorites.filter(f => (f.toolId || "brush") === activeTool).length === 0 ? (
            <div className="brush-grid-empty" style={{ width: "100%", textAlign: "center", padding: "20px" }}>
              <p>{t("no_favorites")}</p>
              <p style={{fontSize: "10px", marginTop: "4px", opacity: 0.6}}>
                (Current Tool: {activeTool})
              </p>
            </div>
          ) : (
            favorites
              .filter(fav => (fav.toolId || "brush") === activeTool)
              .map((fav) => (
              <div
                key={fav.id}
                className={`brush-item ${selectedIndex === fav.id ? "active" : ""} ${viewMode}`}
                onClick={() => handleSelect(fav)}
                onMouseEnter={(e) => {
                  // Minimal mode only: show global tooltip
                  if (viewMode === 'minimal') {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                          show: true,
                          x: rect.left, // Align to left edge for safety
                          y: rect.top - 5, 
                          text: fav.name
                      });
                  }
                }}
                onMouseLeave={() => setTooltip(prev => ({...prev, show: false}))}
              >
                {viewMode === 'detail' ? (
                  <>
                     {/* Name - Full Text, CSS handles truncation */}
                     <span className="brush-name" role="name-label" title={fav.name}>
                       {fav.name}
                     </span>
                     
                     {/* Small Icon */}
                     <div style={{ opacity: selectedIndex === fav.id ? 1 : 0.8, display: "flex", alignItems: "center", marginLeft: "8px" }}>
                      {fav.iconKey && BRUSH_ICONS[fav.iconKey] ? (
                         <svg className="uxp-icon" viewBox="0 0 24 24" width="14" height="14" style={{ 
                           width: "14px", height: "14px",
                           color: selectedIndex === fav.id ? "#fff" : (fav.color || '#888') 
                         }}>
                           <path d={BRUSH_ICONS[fav.iconKey]} fill="currentColor" />
                         </svg>
                      ) : (
                         <span style={{ 
                           fontSize: '11px', 
                           fontWeight: 'bold', 
                           color: selectedIndex === fav.id ? "#fff" : (fav.color || '#888') 
                         }}>
                           {fav.name.charAt(0).toUpperCase()}
                         </span>
                      )}
                     </div>
                  </>
                ) : (
                  <div className="brush-preview">
                     {fav.iconKey && BRUSH_ICONS[fav.iconKey] ? (
                        <svg className="uxp-icon" viewBox="0 0 24 24" style={{ 
                          width: "24px", height: "24px",
                          color: selectedIndex === fav.id ? "#fff" : (fav.color || '#888') 
                        }}>
                          <path d={BRUSH_ICONS[fav.iconKey]} fill="currentColor" />
                        </svg>
                     ) : (
                       <span style={{ 
                         fontSize: '12px', 
                         fontWeight: 'bold', 
                         color: selectedIndex === fav.id ? "#fff" : (fav.color || '#888') 
                       }}>
                         {fav.name.substring(0, 2)}
                       </span>
                     )}
                  </div>
                )}

                {/* Remove Button (Hover only) */}
                <button 
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(fav.id);
                  }}
                  title={t("remove", "删除")}
                >
                  ×
                </button>
              </div>
            ))
          )}
          
          {/* Add Button as last item in grid */}
          <div className="brush-item" style={{ 
             width: viewMode === 'minimal' ? "48px" : "100%", 
             height: viewMode === 'minimal' ? "48px" : "32px",
             border: "1px dashed #555",
             background: "rgba(255,255,255,0.05)",
             justifyContent: "center"
          }} 
          onClick={handleAddStart} // Changed to handleAddStart
          title={t("add_favorite")}
          >
             <span style={{ fontSize: "16px", color: "#888" }}>+</span>
          </div>

        </div>
      </div>
      
      {/* Global Tooltip Portal */}
      {tooltip.show && ReactDOM.createPortal(
        <div style={{
          position: "fixed",
          top: tooltip.y,
          left: tooltip.x,
          transform: "translate(0, -100%)", // Move up above the cursor/item
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
          {/* Arrow */}
          <div style={{
            position: "absolute",
            top: "100%",
            left: "10px", // Align arrow to left side
            marginLeft: "0",
            borderWidth: "4px",
            borderStyle: "solid",
            borderColor: "#333 transparent transparent transparent"
          }}></div>
        </div>,
        document.body
      )}

      {/* 图标选择器弹窗 */}
      {showIconPicker && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#2b2b2b", padding: "16px", borderRadius: "8px",
            border: "1px solid #444", width: "280px", maxHeight: "80%", display: "flex", flexDirection: "column"
          }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#ddd" }}>{t("select_icon")}</h3>
            
            {/* Color Picker */}
            <div style={{ marginBottom: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {TAG_COLORS.map(color => (
                <div
                  key={color}
                  onClick={() => setSelectedTagColor(color)}
                  style={{
                    width: "24px", height: "24px", borderRadius: "50%", background: color,
                    border: selectedTagColor === color ? "2px solid #fff" : "1px solid #555",
                    cursor: "pointer",
                    boxSizing: "border-box"
                  }}
                ></div>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}> {/* Added paddingRight for scrollbar */}
              {/* Default option: Use first letter of name */}
              <div style={{ marginBottom: "12px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#888", borderBottom: "1px solid #444", paddingBottom: "4px" }}>
                  {t("default_icon_options")}
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <div 
                    onClick={() => handleAddConfirm("")}
                    style={{
                      width: "40px", height: "40px", background: "#3a3a3a", borderRadius: "4px",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid #555"
                    }}
                    title="Use Letter"
                  >
                    <span style={{color: selectedTagColor}}>T</span>
                  </div>
                </div>
              </div>

              {Object.entries(ICON_GROUPS).map(([groupName, keys]) => (
                <div key={groupName} style={{ marginBottom: "12px" }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#888", borderBottom: "1px solid #444", paddingBottom: "4px" }}>
                    {groupName}
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {keys.map(key => {
                      const path = BRUSH_ICONS[key];
                      if (!path) return null;
                      return (
                        <div 
                          key={key}
                          onClick={() => handleAddConfirm(key)}
                          style={{
                            width: "40px", height: "40px", background: "#3a3a3a", borderRadius: "4px",
                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid #555"
                          }}
                          title={key}
                        >
                           <svg 
                             className="uxp-icon"
                             viewBox="0 0 24 24" 
                             width="24"
                             height="24"
                             style={{ width: '20px', height: '20px', color: selectedTagColor }}
                           >
                             <path d={path} fill="currentColor" />
                           </svg>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => { setShowIconPicker(false); setPendingBrush(null); }}
              style={{ marginTop: "12px", border: "none", background: "#444", color: "#fff", padding: "6px", borderRadius: "4px", cursor: "pointer" }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
