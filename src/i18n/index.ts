/**
 * 轻量级 i18n 国际化模块
 * 自动检测语言并提供翻译函数
 */

import en from "./locales/en.json";
import zh from "./locales/zh.json";

// 支持的语言包
const locales: Record<string, Record<string, string>> = {
  en,
  zh,
};

// 检测当前语言
function detectLanguage(): string {
  try {
    // UXP 环境下尝试获取系统语言
    const lang = navigator.language || "en";
    // 提取语言代码 (e.g., "zh-CN" -> "zh")
    const code = lang.split("-")[0].toLowerCase();
    return locales[code] ? code : "en";
  } catch {
    return "en";
  }
}

// 当前语言
let currentLang = detectLanguage();

/**
 * 获取当前语言
 */
export function getLanguage(): string {
  return currentLang;
}

/**
 * 设置语言
 */
export function setLanguage(lang: string): void {
  if (locales[lang]) {
    currentLang = lang;
  }
}

/**
 * 翻译函数
 * @param key 翻译键
 * @param fallback 回退值 (可选)
 * @returns 翻译后的字符串
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

/**
 * 获取所有可用语言
 */
export function getAvailableLanguages(): string[] {
  return Object.keys(locales);
}
