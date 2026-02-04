// @ts-nocheck
/**
 * 轻量级 i18n 国际化模块 (Color Wheel Pro Unified)
 * 包含完整字典，解决构建依赖问题，支持持久化
 */

// 1. 定义字典 (Inlined to avoid JSON build issues)
const en = {
    // Sections
    adjust_title: "ADJUST",
    recent_title: "RECENTLY USED",
    mixer_title: "PRECISION MIXER",
    
    // Buttons
    set_a: "SET A",
    set_b: "SET B",
    palette_alpha: "PALETTE A",
    palette_beta: "PALETTE B",
    mode_dark: "DARK",
    mode_light: "LIGHT",
    
    // Scratchpad
    scratchpad_title: "SCRATCHPAD",
    clear: "CLEAR",

    // Labels
    no_history: "No history yet",
    
    // Tooltips
    toggle_grayscale: "Toggle Grayscale",
    toggle_view: "Toggle View Mode",
    use_color_a: "Use Color A",
    use_color_b: "Use Color B",
    
    // New Features
    hex_code: "HEX",
    copy: "Copy",
    swap: "Swap Colors",
    lock_brightness: "Lock Brightness",
    harmony_analog: "Analogous",
    harmony_comp: "Complementary",
    
    // Scratchpad UI
    size: "Size",
    opacity: "Opacity",
    pressure_mode_active: "Pressure Mode Active",
    click_to_reset_manual: "Click to switch to manual mode",

    // Settings (New)
    settings: "Settings",
    language: "Language",
    language_desc: "Requires restart to apply",
    restart_hint: "Language changed. Please close and reopen the plugin to apply.",
    close: "Close"
};

const zh = {
    // Sections
    adjust_title: "调 整",
    recent_title: "最近使用",
    mixer_title: "精准混色",
    
    // Scratchpad
    scratchpad_title: "混合色板",
    clear: "清空",
    
    // Buttons
    set_a: "设 A",
    set_b: "设 B",
    palette_alpha: "调色板 A",
    palette_beta: "调色板 B",
    mode_dark: "暗 色",
    mode_light: "亮 色",
    
    // Labels
    no_history: "暂无历史记录",
    
    // Tooltips
    toggle_grayscale: "切换黑白模式",
    toggle_view: "切换视图模式",
    use_color_a: "使用颜色 A",
    use_color_b: "使用颜色 B",
    
    // New Features
    hex_code: "色号",
    copy: "复制",
    swap: "交换前背景色",
    lock_brightness: "锁定明度",
    harmony_analog: "相邻色",
    harmony_comp: "补色",

    // Scratchpad UI
    size: "大小",
    opacity: "透明度",
    pressure_mode_active: "压感模式生效中",
    click_to_reset_manual: "点击切换回手动模式",

    // Settings (New)
    settings: "设置",
    language: "语言",
    language_desc: "重启插件后生效",
    restart_hint: "语言已切换。请关闭并重新打开插件以生效。",
    close: "关闭"
};

const ja = {
    // Sections
    adjust_title: "調 整",
    recent_title: "最近使用した色",
    mixer_title: "精密ミキサー",
    
    // Scratchpad
    scratchpad_title: "混合パレット",
    clear: "クリア",
    
    // Buttons
    set_a: "Aを設定",
    set_b: "Bを設定",
    palette_alpha: "パレット A",
    palette_beta: "パレット B",
    mode_dark: "暗",
    mode_light: "明",
    
    // Labels
    no_history: "履歴なし",
    
    // Tooltips
    toggle_grayscale: "グレースケール切替",
    toggle_view: "表示モード切替",
    use_color_a: "色Aを使用",
    use_color_b: "色Bを使用",
    
    // New Features
    hex_code: "HEX",
    copy: "コピー",
    swap: "描画色と背景色を交換",
    lock_brightness: "明度をロック",
    harmony_analog: "類似色",
    harmony_comp: "補色",

    // Scratchpad UI
    size: "サイズ",
    opacity: "不透明度",
    pressure_mode_active: "筆圧モード有効",
    click_to_reset_manual: "クリックして手動モードに戻す",

    // Settings (New)
    settings: "設定",
    language: "言語",
    language_desc: "再起動後に適用されます",
    restart_hint: "言語が変更されました。プラグインを再起動してください。",
    close: "閉じる"
};

// 支持的语言包
const locales: Record<string, Record<string, string>> = {
  en,
  zh,
  ja
};

// 支持的参数选项
export const LANG_OPTIONS = [
  { value: "auto", label: "Auto (System)" },
  { value: "zh", label: "简体中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" }
];

// 检测语言
function detectLanguage(): string {
  try {
    // 1. 优先读取用户设置
    const saved = localStorage.getItem("user_language");
    if (saved && saved !== "auto" && locales[saved]) {
      return saved;
    }

    // 2. UXP 环境下尝试获取系统语言
    const lang = navigator.language || "en";
    const code = lang.split("-")[0].toLowerCase();
    
    if (code === 'zh') return 'zh';
    if (code === 'ja') return 'ja';
    return 'en';
  } catch {
    return "en";
  }
}

// 当前状态
let currentLang = detectLanguage();

/**
 * 获取当前设置
 */
export function getLanguageSetting(): string {
  return localStorage.getItem("user_language") || "auto";
}

/**
 * 设置并保存语言
 */
export function setLanguage(lang: string): void {
  localStorage.setItem("user_language", lang);
  if (lang === "auto") {
    currentLang = detectLanguage(); 
  } else if (locales[lang]) {
    currentLang = lang;
  }
}

/**
 * 翻译函数
 */
export function t(key: string, fallback?: string): string {
  const current = locales[currentLang];
  if (current && current[key]) {
    return current[key];
  }
  // Fallback to English
  if (locales.en && locales.en[key]) {
    return locales.en[key];
  }
  // Fallback to key or custom fallback
  return fallback ?? key;
}
