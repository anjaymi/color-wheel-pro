/**
 * UXP Addon API 头文件
 * 定义了与 UXP 通信的接口
 */

#ifndef UXPADDON_H
#define UXPADDON_H

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Addon 上下文（由 UXP 提供）
 */
typedef struct {
    void* hostContext;
    int version;
} UXPAddonContext;

/**
 * Addon 调用结果
 */
typedef struct {
    char* data;   // JSON 字符串结果
    char* error;  // 错误信息（如果有）
} UXPAddonResult;

/**
 * 必须导出的初始化函数
 */
typedef int (*UXPADDON_INIT_FUNC)(UXPAddonContext* ctx);

/**
 * 必须导出的销毁函数
 */
typedef void (*UXPADDON_DESTROY_FUNC)(UXPAddonContext* ctx);

#ifdef __cplusplus
}
#endif

#endif // UXPADDON_H
