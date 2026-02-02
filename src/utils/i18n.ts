
// Simple Localization Utility

type Lang = 'en' | 'zh' | 'ja';

// Detect Language from UXP/Browser
// UXP's navigator.language usually returns something like "en-US" or "zh-CN"
const getSystemLanguage = (): Lang => {
    try {
        const lang = navigator.language.toLowerCase();
        if (lang.startsWith('zh')) return 'zh';
        if (lang.startsWith('ja')) return 'ja';
        return 'en';
    } catch (e) {
        return 'en';
    }
};

const currentLang: Lang = getSystemLanguage(); // Or hardcode 'zh' for testing if needed

const dictionaries = {
    en: {
        // Sections
        adjust_title: "ADJUST",
        recent_title: "RECENTLY USED",
        mixer_title: "PRECISION MIXER",
        
        // Buttons
        set_a: "SET A",
        set_b: "SET B",
        palette_alpha: "PALETTE ALPHA",
        palette_beta: "PALETTE BETA",
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
        click_to_reset_manual: "Click to switch to manual mode"
    },
    zh: {
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
        click_to_reset_manual: "点击切换回手动模式"
    },
    ja: {
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
        click_to_reset_manual: "クリックして手動モードに戻す"
    }
};

export const t = (key: keyof typeof dictionaries['en']) => {
    return dictionaries[currentLang][key] || dictionaries['en'][key] || key;
};
