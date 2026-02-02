import { action, core } from "photoshop";

// =============================================================================
// 前景色/背景色同步 (Color Sync) - 精简版
// =============================================================================

/**
 * HSB 转 RGB (统一使用此函数)
 * @param h - 色相 (0-360)
 * @param s - 饱和度 (0-100)
 * @param b - 亮度 (0-100)
 */
function hsbToRgb(h: number, s: number, b: number): {r: number, g: number, b: number} {
    const sNorm = s / 100;
    const bNorm = b / 100;
    
    const c = bNorm * sNorm;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = bNorm - c;
    
    let r = 0, g = 0, bl = 0;
    
    if (h >= 0 && h < 60) { r = c; g = x; bl = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; bl = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; bl = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; bl = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; bl = c; }
    else { r = c; g = 0; bl = x; } // 300-360
    
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((bl + m) * 255)
    };
}

/**
 * 从颜色对象提取 RGB (支持多种 PS 格式)
 */
function extractRgbFromColor(colorObj: any): {r: number, g: number, b: number} | null {
    if (!colorObj) return null;
    
    // 格式1: RGBColor 或直接 RGB 属性
    if (colorObj._obj === "RGBColor" || colorObj.red !== undefined) {
        return {
            r: Math.round(colorObj.red ?? 0),
            g: Math.round(colorObj.green ?? 0),
            b: Math.round(colorObj.blue ?? 0)
        };
    }
    
    // 格式2: HSBColorClass (PS 拾色器格式)
    if (colorObj._obj === "HSBColorClass") {
        const h = colorObj.hue?._value ?? colorObj.hue ?? 0;
        const s = colorObj.saturation ?? 0;
        const b = colorObj.brightness ?? 0;
        return hsbToRgb(h, s, b);
    }
    
    // 格式3: 灰度 (grayscale)
    if (colorObj._obj === "grayscale" || colorObj.gray !== undefined) {
        // gray: 0 = 黑色, 100 = 白色
        const grayVal = colorObj.gray ?? 0;
        const v = Math.round(255 * (100 - grayVal) / 100);
        return { r: v, g: v, b: v };
    }
    
    // 格式4: CMYK (rare but possible)
    if (colorObj._obj === "CMYKColor" || colorObj.cyan !== undefined) {
        const c = (colorObj.cyan ?? 0) / 100;
        const m = (colorObj.magenta ?? 0) / 100;
        const y = (colorObj.yellow ?? 0) / 100;
        const k = (colorObj.black ?? 0) / 100;
        return {
            r: Math.round(255 * (1 - c) * (1 - k)),
            g: Math.round(255 * (1 - m) * (1 - k)),
            b: Math.round(255 * (1 - y) * (1 - k))
        };
    }
    
    // 未知格式 - 打印日志以调试
    console.warn("[ColorSync] Unknown color format:", JSON.stringify(colorObj));
    return null;
}

/**
 * 获取 Photoshop 前景色 (使用 DOM API)
 */
export async function getForegroundColor(): Promise<{r: number, g: number, b: number}> {
    try {
        // 使用 Photoshop DOM API - 更可靠
        const app = require("photoshop").app;
        const color = app.foregroundColor;
        
        if (color && color.rgb) {
            return {
                r: Math.round(color.rgb.red),
                g: Math.round(color.rgb.green),
                b: Math.round(color.rgb.blue)
            };
        }
    } catch (e) {
        console.warn("[ColorSync] getForegroundColor via DOM failed:", e);
    }
    
    // 备用方案：batchPlay
    try {
        const result = await action.batchPlay([{
            _obj: "get",
            _target: [
                { _ref: "color", _property: "foregroundColor" },
                { _ref: "application", _enum: "ordinal", _value: "targetEnum" }
            ]
        }], { synchronousExecution: true });
        
        if (result?.[0]?.foregroundColor) {
            const rgb = extractRgbFromColor(result[0].foregroundColor);
            if (rgb) return rgb;
        }
    } catch (e) {
        console.warn("[ColorSync] getForegroundColor via batchPlay failed:", e);
    }
    
    return { r: 0, g: 0, b: 0 };
}

/**
 * 设置 Photoshop 前景色
 */
export async function setForegroundColor(r: number, g: number, b: number): Promise<void> {
    try {
        await core.executeAsModal(async () => {
            await action.batchPlay([{
                _obj: "set",
                _target: [{ _ref: "color", _property: "foregroundColor" }],
                to: { _obj: "RGBColor", red: r, green: g, blue: b }
            }], {});
        }, { commandName: "Set Foreground Color" });
    } catch (e) {
        console.error("[ColorSync] setForegroundColor failed:", e);
    }
}

/**
 * 获取 Photoshop 背景色 (使用 DOM API)
 */
export async function getBackgroundColor(): Promise<{r: number, g: number, b: number}> {
    try {
        // 使用 Photoshop DOM API - 更可靠
        const app = require("photoshop").app;
        const color = app.backgroundColor;
        
        if (color && color.rgb) {
            return {
                r: Math.round(color.rgb.red),
                g: Math.round(color.rgb.green),
                b: Math.round(color.rgb.blue)
            };
        }
    } catch (e) {
        console.warn("[ColorSync] getBackgroundColor via DOM failed:", e);
    }
    
    // 备用方案：batchPlay
    try {
        const result = await action.batchPlay([{
            _obj: "get",
            _target: [
                { _ref: "color", _property: "backgroundColor" },
                { _ref: "application", _enum: "ordinal", _value: "targetEnum" }
            ]
        }], { synchronousExecution: true });
        
        if (result?.[0]?.backgroundColor) {
            const rgb = extractRgbFromColor(result[0].backgroundColor);
            if (rgb) return rgb;
        }
    } catch (e) {
        console.warn("[ColorSync] getBackgroundColor via batchPlay failed:", e);
    }
    
    return { r: 255, g: 255, b: 255 };
}

/**
 * 设置 Photoshop 背景色
 */
export async function setBackgroundColor(r: number, g: number, b: number): Promise<void> {
    try {
        await core.executeAsModal(async () => {
            await action.batchPlay([{
                _obj: "set",
                _target: [{ _ref: "color", _property: "backgroundColor" }],
                to: { _obj: "RGBColor", red: r, green: g, blue: b }
            }], {});
        }, { commandName: "Set Background Color" });
    } catch (e) {
        console.error("[ColorSync] setBackgroundColor failed:", e);
    }
}

/**
 * 打开 Photoshop 拾色器对话框
 * @param target - 'foreground' 或 'background'
 * @returns 选择的颜色 RGB 或 null（取消）
 */
export async function openColorPicker(target: 'foreground' | 'background' = 'foreground'): Promise<{r: number, g: number, b: number} | null> {
    try {
        if (target === 'background') {
            // 背景色：先交换，打开拾色器，再交换回来
            await core.executeAsModal(async () => {
                // 交换前景/背景色
                await action.batchPlay([{ _obj: "exchange", _target: [{ _ref: "color" }] }], {});
                // 打开拾色器（现在编辑的是原来的背景色）
                await action.batchPlay([{ _obj: "showColorPicker" }], { dialogOptions: "display" });
                // 交换回来
                await action.batchPlay([{ _obj: "exchange", _target: [{ _ref: "color" }] }], {});
            }, { commandName: "Background Color Picker" });
            
            return await getBackgroundColor();
        } else {
            // 前景色：直接打开拾色器
            await core.executeAsModal(async () => {
                await action.batchPlay([{ _obj: "showColorPicker" }], { dialogOptions: "display" });
            }, { commandName: "Foreground Color Picker" });
            
            return await getForegroundColor();
        }
    } catch (e) {
        // 用户取消会抛出异常
        console.log("[ColorSync] Color picker cancelled or failed:", e);
    }
    return null;
}

/**
 * 监听 PS 颜色变化 (从事件描述符直接提取颜色)
 */
export function startColorTracking(
    onForeground: (rgb: {r: number, g: number, b: number}) => void,
    onBackground?: (rgb: {r: number, g: number, b: number}) => void
): void {
    action.addNotificationListener(["set"], (event: string, descriptor: any) => {
        if (event !== "set") return;
        
        const target = descriptor._target;
        const to = descriptor.to;
        
        if (!Array.isArray(target) || !to) return;
        
        for (const ref of target) {
            if (ref._property === "foregroundColor") {
                const rgb = extractRgbFromColor(to);
                if (rgb) {
                    console.log("[ColorSync] FG changed:", rgb);
                    onForeground(rgb);
                }
            }
            
            if (ref._property === "backgroundColor" && onBackground) {
                const rgb = extractRgbFromColor(to);
                if (rgb) {
                    console.log("[ColorSync] BG changed:", rgb);
                    onBackground(rgb);
                }
            }
        }
    });
    
    console.log("[ColorSync] Tracking started");
}

// =============================================================================
// 工具系统 (Tool System)
// =============================================================================

// 映射工具 ID 到 PS 内部 Class Name
const TOOL_MAP: Record<string, string> = {
  brush: "paintbrushTool",
  eraser: "eraserTool",
  mixer: "wetBrushTool", // 混合画笔
  smudge: "smudgeTool",
  pencil: "pencilTool",
  clone: "cloneStampTool",
};

/**
 * 切换工具
 * @param toolId - "brush", "eraser", etc.
 */
export async function selectTool(toolId: string): Promise<void> {
  const targetClass = TOOL_MAP[toolId];
  if (!targetClass) return;

  try {
    await core.executeAsModal(
      async () => {
        await action.batchPlay(
          [
            {
              _obj: "select",
              _target: [{ _ref: targetClass }],
            },
          ],
          {}
        );
      },
      { commandName: `Select Tool: ${toolId}` }
    );
  } catch (e) {
    console.error("Select Tool Failed:", e);
  }
}

/**
 * 获取当前工具 Class ID
 */
export async function getCurrentTool(): Promise<string> {
  try {
    const result = await action.batchPlay(
      [
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "tool" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" },
          ],
        },
      ],
      { synchronousExecution: true }
    );

    if (result && result[0] && result[0].tool) {
       return result[0].tool._enum || result[0].tool._obj || "unknown";
    }
  } catch (e) {
    console.error("Get Current Tool Failed:", e);
  }
  return "unknown";
}

/**
 * Internal Helper: Applies the "Golden Combination" (Tool Class + UnitValue)
 */
async function setDynamicToolOption(key: string, value: any) {
  try {
    const toolClass = await getCurrentTool();
    if (!toolClass || toolClass === "unknown") return;

    await core.executeAsModal(
      async () => {
        const descriptor = {
          _obj: "set",
          _target: [
            { _ref: toolClass } 
          ],
          to: {
            _obj: "currentToolOptions",
            [key]: typeof value === "object" ? value : value // Support passing UnitValue or raw
          },
        };
        
        await action.batchPlay([descriptor], {});
      },
      { commandName: `Set ${key}` }
    );
  } catch (e) {
    console.error(`[BrushToolbar] Set ${key} Failed:`, e);
  }
}

export async function setBrushSize(size: number): Promise<void> {
  try {
    await core.executeAsModal(
      async () => {
        await action.batchPlay(
          [
            {
              _obj: "set",
              _target: [
                { _ref: "brush", _enum: "ordinal", _value: "targetEnum" },
              ],
              to: {
                _obj: "currentToolOptions",
                diameter: { _unit: "pixelsUnit", _value: size },
              },
            },
          ],
          {}
        );
      },
      { commandName: "Set Brush Size" }
    );
  } catch (e) {
    console.error(e);
  }
}

export async function setBrushOpacity(opacity: number): Promise<void> {
  const val = Math.round(opacity);
  await setDynamicToolOption("opacity", { _unit: "percentUnit", _value: val });
}

export async function setBrushFlow(flow: number): Promise<void> {
  const val = Math.round(flow);
  await setDynamicToolOption("flow", { _unit: "percentUnit", _value: val });
}

/**
 * 设置画笔硬度 (Hardness)
 * @param hardness - 硬度数值 (0-100)
 */
export async function setBrushHardness(hardness: number): Promise<void> {
  const val = Math.max(0, Math.min(100, Math.round(hardness)));
  try {
    await core.executeAsModal(async () => {
      await action.batchPlay([
        {
          _obj: "set",
          _target: [{ _ref: "brush", _enum: "ordinal", _value: "targetEnum" }],
          to: {
            _obj: "brush",
            hardness: { _unit: "percentUnit", _value: val },
          },
        },
      ], {});
    }, { commandName: "Set Brush Hardness" });
  } catch (e) {
    console.error("[BrushToolbar] Set Hardness Failed:", e);
  }
}

/**
 * 设置画笔间距 (Spacing)
 * @param spacing - 间距数值 (1-1000, 百分比)
 */
export async function setBrushSpacing(spacing: number): Promise<void> {
  const val = Math.max(1, Math.min(1000, Math.round(spacing)));
  try {
    await core.executeAsModal(async () => {
      await action.batchPlay([
        {
          _obj: "set",
          _target: [{ _ref: "brush", _enum: "ordinal", _value: "targetEnum" }],
          to: {
            _obj: "brush",
            spacing: { _unit: "percentUnit", _value: val },
          },
        },
      ], {});
    }, { commandName: "Set Brush Spacing" });
  } catch (e) {
    console.error("[BrushToolbar] Set Spacing Failed:", e);
  }
}

/**
 * 设置平滑 (Smoothing) - Target 'smooth' Property
 * smoothingValue 可能是只读的，smooth 才是可写的
 */
/**
 * 设置画笔平滑度 (Smoothing) - 最终修正版
 * 
 * 来源: User provided "The Correct Way in UXP"
 * Target: Application -> currentToolOptions (not tool class)
 * Payload: { smoothing: val }
 * 
 * @param smoothing - 平滑度数值 (0-100)
 */
/**
 * 设置画笔平滑度 (Smoothing)
 * 
 * 与 Opacity/Flow 完全一致的模式:
 * - 使用 setDynamicToolOption
 * - Key 使用 'smooth' (不是 'smoothing', Inspector 显示这是实际的数值键)
 * - Value 使用原始整数 (不是 percentUnit, 因为 Inspector 显示 smooth: 60 是 raw int)
 * 
 * @param smoothing - 平滑度数值 (0-100)
 */
/**
 * 设置画笔平滑度 (Smoothing)
 *
 * 使用 `property → currentToolOptions` 目标写入 `smooth`（整数 0‑100），
 * 并在执行前强制切换到画笔工具，防止 "Set not available" 错误。
 */
/**
 * 设置画笔平滑度 (Smoothing)
 *
 * 使用 `property → currentToolOptions` 目标写入 `smooth`（整数）以及 `smoothingValue`（percentUnit），
 * 以确保 Photoshop UI 的平滑滑块能够同步显示数值。
 */
export async function setBrushSmoothing(smoothing: number): Promise<void> {
  const val = Math.max(0, Math.min(100, Math.round(smoothing)));
  console.log(`[BrushToolbar] setBrushSmoothing called with: ${val}`);
  
  try {
    await core.executeAsModal(async () => {
      const toolClass = await getCurrentTool();
      console.log(`[BrushToolbar] Current tool: ${toolClass}`);
      
      // 尝试多种属性名和格式
      const descriptors = [
        // 方案1: smoothing 整数
        {
          _obj: "set",
          _target: [{ _ref: toolClass }],
          to: { _obj: "currentToolOptions", smoothing: val },
        },
        // 方案2: smooth 整数
        {
          _obj: "set",
          _target: [{ _ref: toolClass }],
          to: { _obj: "currentToolOptions", smooth: val },
        },
      ];
      
      for (let i = 0; i < descriptors.length; i++) {
        const result = await action.batchPlay([descriptors[i]], {});
        console.log(`[BrushToolbar] Attempt ${i + 1} result:`, JSON.stringify(result));
      }
    }, { commandName: "Set Brush Smoothing (multi)" });
  } catch (e) {
    console.error("[BrushToolbar] Set Smoothing Failed:", e);
  }
}



export interface BrushProps {
  size: number;
  opacity: number;
  flow: number;
  hardness?: number;
  spacing?: number;
}

export async function getBrushProperties(): Promise<BrushProps | null> {
  try {
    const result = await action.batchPlay(
      [
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "currentToolOptions" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum"  },
          ],
        },
      ],
      { synchronousExecution: true }
    );

    if (result && result[0] && result[0].currentToolOptions) {
      const opts = result[0].currentToolOptions;

      const getVal = (v: any) => {
        if (typeof v === "number") return v;
        if (v && typeof v._value === "number") return v._value;
        return undefined;
      }

      // 1. Resolve Size
      let size = 0;
      if (opts.brush && opts.brush.diameter) {
        size = getVal(opts.brush.diameter) || 0;
      } else if (opts.diameter) {
        size = getVal(opts.diameter) || 0;
      }

      // 2. Resolve Opacity, Flow
      const opacity = getVal(opts.opacity) ?? 100;
      const flow = getVal(opts.flow) ?? 100;

      // 3. Resolve Hardness, Spacing
      let hardness = 0;
      let spacing = 0;
      if (opts.brush) {
        hardness = getVal(opts.brush.hardness) ?? 0;
        spacing = getVal(opts.brush.spacing) ?? 0;
      }
      
      return { size, opacity, flow, hardness, spacing };
    }
  } catch (e) {
    console.error("[BrushToolbar] Get Properties Failed:", e);
  }
  return null;
}

// =============================================================================
// 笔刷预设系统 (Brush Preset System)
// =============================================================================

export interface BrushPreset {
  name: string;
  index: number;
}

/**
 * 获取笔刷预设列表
 * 注意: 这是"工具预设" (Tool Presets)，不是笔刷尖端 (Brush Tips)
 */
export async function getBrushPresets(): Promise<BrushPreset[]> {
  try {
    const result = await action.batchPlay(
      [
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "presetManager" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" },
          ],
        },
      ],
      { synchronousExecution: true }
    );

    const presets: BrushPreset[] = [];

    if (result && result[0] && result[0].presetManager) {
      const manager = result[0].presetManager;
      
      // 查找 Tool Presets (工具预设)
      if (manager.presetManager) {
        for (const category of manager.presetManager) {
          // 筛选工具预设 (Class: toolPreset)
          if (category._obj === "presetManager" && category.name === "toolPreset") {
            const items = category.name;
            // 遍历预设
            if (category.preset) {
              category.preset.forEach((p: any, idx: number) => {
                if (p.title || p.name) {
                  presets.push({
                    name: p.title || p.name || `Preset ${idx + 1}`,
                    index: idx,
                  });
                }
              });
            }
          }
        }
      }
    }

    // 如果没找到，尝试直接获取当前工具预设
    if (presets.length === 0) {
      console.log("[BrushToolbar] No presets found, trying alternative method");
      // 替代方案: 使用预设选择器查询
    }

    return presets;
  } catch (e) {
    console.error("[BrushToolbar] Get Brush Presets Failed:", e);
    return [];
  }
}

/**
 * 选择笔刷预设
 * @param presetIndex - 预设索引 (从0开始)
 */
export async function selectBrushPreset(presetIndex: number): Promise<void> {
  try {
    await core.executeAsModal(
      async () => {
        await action.batchPlay(
          [
            {
              _obj: "select",
              _target: [
                {
                  _ref: "toolPreset",
                  _index: presetIndex + 1, // PS 索引从1开始
                },
              ],
            },
          ],
          {}
        );
      },
      { commandName: "Select Brush Preset" }
    );
  } catch (e) {
    console.error("[BrushToolbar] Select Brush Preset Failed:", e);
  }
}

/**
 * 通过名称选择笔刷/工具预设
 * @param name - 名称
 * @param type - 类型 ('brush' | 'toolPreset')
 */
export async function selectBrushByName(name: string, type: 'brush' | 'toolPreset' = 'brush'): Promise<void> {
  try {
    const refType = type === 'toolPreset' ? 'toolPreset' : 'brush';
    await core.executeAsModal(
      async () => {
        await action.batchPlay(
          [
            {
              _obj: "select",
              _target: [
                {
                  _ref: refType,
                  _name: name,
                },
              ],
            },
          ],
          {}
        );
      },
      { commandName: `Select ${type}: ${name}` }
    );
  } catch (e) {
    console.error(`[BrushToolbar] Select ${type} Failed:`, e);
  }
}

let cachedBrushInfo: { name: string; type: 'brush' | 'toolPreset' } | null = null;

const REVERSE_TOOL_MAP: Record<string, string> = Object.entries(TOOL_MAP).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<string, string>);

export function startBrushTracking(onToolChange?: (toolId: string) => void) {
  action.addNotificationListener(["select"], (event: string, descriptor: any) => {
    if (event === "select") {
      const target = descriptor._target;
      if (Array.isArray(target) && target.length > 0) {
        const ref = target[0];
        
        // 1. 捕获笔刷/预设选择 (现有逻辑)
        if (ref._ref === "brush" && ref._name) {
          cachedBrushInfo = { name: ref._name, type: "brush" };
          console.log("[BrushToolbar] Tracked Brush:", cachedBrushInfo);
        }
        else if (ref._ref === "toolPreset" && ref._name) {
          cachedBrushInfo = { name: ref._name, type: "toolPreset" };
          console.log("[BrushToolbar] Tracked ToolPreset:", cachedBrushInfo);
        }
        
        // 2. 捕获工具切换 (New)
        // 目标通常是 {_ref: "paintbrushTool"} 或类似的
        if (onToolChange && ref._ref) {
          if (REVERSE_TOOL_MAP[ref._ref]) {
            // 已知工具
            const newToolId = REVERSE_TOOL_MAP[ref._ref];
            console.log("[BrushToolbar] Tracked Known Tool:", newToolId);
            onToolChange(newToolId);
          } else if (typeof ref._ref === "string" && ref._ref.toLowerCase().includes("tool")) {
             // 未知工具 (e.g., moveTool, marqueeTool)
             // 只要包含 'tool'，我们就认为切换了工具，通知 UI 更新以隐藏画笔收藏
             console.log("[BrushToolbar] Tracked Unknown Tool:", ref._ref);
             onToolChange(ref._ref); 
          }
        }
      }
    }
  });
}

/**
 * 获取当前笔刷信息 (名称和类型)
 */
export async function getCurrentBrushInfo(): Promise<{ name: string; type: 'brush' | 'toolPreset' } | null> {
  // 1. 优先返回监听到的最后一次选择 (最准确)
  if (cachedBrushInfo) {
    return cachedBrushInfo;
  }

  // 如果没有监听数据，尝试简单的 currentToolOptions 查询 (最安全的 Fallback)
  try {
    const result = await action.batchPlay(
      [
        {
          _obj: "get",
          _target: [
            { _ref: "property", _property: "currentToolOptions" },
            { _ref: "application", _enum: "ordinal", _value: "targetEnum" },
          ],
          _options: { dialogOptions: "dontDisplay" }
        },
      ],
      { synchronousExecution: true }
    );

    if (result && result[0] && result[0].currentToolOptions) {
      const toolOpts = result[0].currentToolOptions;
      // 工具预设
      if (toolOpts.$TpNm) {
        return { name: toolOpts.$TpNm, type: 'toolPreset' };
      }
      // 笔刷名 (有可能是不准确的笔尖名，但总比报错好)
      if (toolOpts.brush && toolOpts.brush.name) {
         return { name: toolOpts.brush.name, type: 'brush' };
      }
    }
  } catch (e) {
    console.warn("[BrushToolbar] Active Get Failed, ignoring:", e);
  }

  return null;
}
