/**
 * DebugPanel.tsx
 * 实时监听 Photoshop 事件并显示 BatchPlay 描述符，用于参数分析。
 */
import React, { useState, useEffect, useRef } from "react";
import { action } from "photoshop";

interface LogEntry {
  id: number;
  event: string;
  descriptor: any;
  timestamp: string;
}

export const DebugPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isListening, setIsListening] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // 捕获控制台日志
  useEffect(() => {
    if (!isListening) return;

    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      setLogs((prev) => [...prev.slice(-49), { id: Date.now(), event: "LOG", descriptor: msg, timestamp: new Date().toLocaleTimeString() }]);
      originalLog(...args);
    };

    console.error = (...args) => {
      const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
      setLogs((prev) => [...prev.slice(-49), { id: Date.now(), event: "ERROR", descriptor: msg, timestamp: new Date().toLocaleTimeString() }]);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, [isListening]);


  useEffect(() => {
    if (!isListening) return;

    const listener = (event: string, descriptor: any) => {
      // 过滤掉无关事件，根据需要调整
      // if (event === "historyStateChanged") return; 

      const newLog: LogEntry = {
        id: Date.now(),
        event,
        descriptor,
        timestamp: new Date().toLocaleTimeString(),
      };

      setLogs((prev) => [...prev.slice(-49), newLog]); // 保留最近 50 条
    };

    // 监听所有事件 (all) 以确保捕获顶部栏 (Options Bar) 的变化
    // 注意: "all" 可能会产生大量日志，但对于调试是必要的
    const events = ["all"];
    action.addNotificationListener(events, listener);

    return () => {
      try {
        action.removeNotificationListener(events, listener);
      } catch (e) {
        // 忽略移除监听器的错误
      }
    };
  }, [isListening]);

  const copyToClipboard = (json: any) => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
  };

  const handleGetOptions = async () => {
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
          // 增加查询 Target Brush
          {
            _obj: "get",
            _target: [
                { _ref: "brush", _enum: "ordinal", _value: "targetEnum" }
            ],
            _options: { dialogOptions: "dontDisplay" }
          }
        ],
        { synchronousExecution: true }
      );
      
      const debugData = {
        currentToolOptions: result[0],
        targetBrush: result[1]
      };
      
      const newLog: LogEntry = {
        id: Date.now(),
        event: "Active Inspect",
        descriptor: debugData,
        timestamp: new Date().toLocaleTimeString(),
      };
      setLogs((prev) => [...prev.slice(-49), newLog]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(30, 30, 30, 0.95)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      color: "#eee",
      fontFamily: "monospace",
      fontSize: "12px",
      padding: "10px",
      boxSizing: "border-box"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
        borderBottom: "1px solid #444",
        paddingBottom: "10px"
      }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "14px" }}>Event Inspector</h3>
          <button 
            onClick={handleGetOptions}
            style={{ 
              ...btnStyle, 
              backgroundColor: "#2f9e44", 
              fontWeight: "bold",
              border: "1px solid #4caf50" 
            }}
          >
            ⏬ 获取当前参数 (Get Active)
          </button>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button 
            onClick={() => setLogs([])}
            style={btnStyle}
          >
            清除
          </button>
          <button 
            onClick={onClose}
            style={{ ...btnStyle, backgroundColor: "#c42b1c" }}
          >
            关闭
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        {logs.length === 0 && <div style={{ color: "#777", textAlign: "center", marginTop: "20px" }}>暂无事件... 操作 Photoshop 以捕获</div>}
        {logs.map((log) => (
          <div key={log.id} style={{
            backgroundColor: "#2a2a2a",
            border: "1px solid #333",
            borderRadius: "4px",
            padding: "8px"
          }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              color: "#aaa", 
              marginBottom: "4px",
              fontSize: "11px"
            }}>
              <span>[{log.timestamp}] <strong>{log.event}</strong></span>
              <button 
                onClick={() => copyToClipboard(log.descriptor)}
                style={{ ...btnStyle, padding: "2px 6px", fontSize: "10px" }}
              >
                Copy JSON
              </button>
            </div>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", color: "#8ab4f8" }}>
              {JSON.stringify(log.descriptor, null, 2)}
            </pre>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  backgroundColor: "#444",
  border: "none",
  color: "white",
  padding: "4px 8px",
  borderRadius: "3px",
  cursor: "pointer",
  fontSize: "12px"
};
