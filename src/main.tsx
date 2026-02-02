import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.scss";

// 检测 Hybrid Addon
const checkAddon = async () => {
    console.log("[Addon Check] Starting...");
    try {
        // require() 返回 Promise，需要 await
        const addonModule = require("bolt-uxp-hybrid.uxpaddon");
        console.log("[Addon Check] require returned:", addonModule);
        
        // 如果是 Promise，等待它
        const addon = addonModule instanceof Promise ? await addonModule : addonModule;
        console.log("[Addon Check] ✅ addon resolved:", addon);
        console.log("[Addon Check] keys:", Object.keys(addon || {}));
        
        if (addon && addon.hello) {
            console.log("[Addon Check] hello():", addon.hello());
        }
        if (addon && addon.getPressure) {
            console.log("[Addon Check] getPressure():", addon.getPressure());
        }
    } catch (e) {
        console.warn("[Addon Check] ❌ Failed:", e);
    }
};
setTimeout(checkAddon, 2000);

console.log("[Main] Starting Color Wheel Pro 3...");

const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement as HTMLElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
} else {
    console.error("❌ Root element not found!");
}
