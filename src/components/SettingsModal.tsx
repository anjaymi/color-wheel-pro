// @ts-nocheck
import React from "react";
import { t, getLanguageSetting, setLanguage, LANG_OPTIONS } from "../i18n";

interface SettingsModalProps {
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)"
        }} onClick={onClose}>
            <div style={{
                background: "#2a2a2a",
                border: "1px solid #444",
                borderRadius: "12px",
                padding: "20px",
                width: "280px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                color: "#eee",
                fontFamily: "system-ui, sans-serif"
            }} onClick={e => e.stopPropagation()}>
                
                <h3 style={{marginTop: 0, marginBottom: 16, fontSize: "16px", borderBottom:"1px solid #444", paddingBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    {t("settings", "Settings")}
                    <div style={{fontSize:12, color:'#666', fontWeight:'normal'}}>v27.0</div>
                </h3>
                
                <div style={{marginBottom: 16}}>
                    <div style={{fontSize: "13px", color: "#aaa", marginBottom: 6}}>
                        {t("language", "Language")}
                    </div>
                    
                    <select 
                        defaultValue={getLanguageSetting()}
                        onChange={(e) => {
                            setLanguage(e.target.value);
                            alert(t("restart_hint"));
                            onClose();
                        }}
                        style={{
                            width: "100%",
                            padding: "8px",
                            background: "#333",
                            color: "#fff",
                            border: "1px solid #555",
                            borderRadius: "6px",
                            outline: "none",
                            fontSize: "13px"
                        }}
                    >
                        {LANG_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    
                    <div style={{marginTop: 8, fontSize: "11px", color: "#666"}}>
                         {t("language_desc")}
                    </div>
                </div>

                <div style={{display: "flex", justifyContent: "flex-end"}}>
                    <button onClick={onClose} style={{
                        background: "#444", 
                        border: "none", 
                        color: "white", 
                        padding: "6px 14px", 
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "13px"
                    }}>
                        {t("close", "Close")}
                    </button>
                </div>
            </div>
        </div>
    );
};
