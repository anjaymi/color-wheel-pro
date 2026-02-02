/************************************************************************
 * Pressure Reader Hybrid Module for Color Wheel Pro
 * 使用官方 UXP Hybrid Plugin SDK
 * 
 * 功能：提供一个简单的函数供 JavaScript 调用，用于未来扩展
 * 目前作为 SDK 集成的基础框架
 ************************************************************************/

#include <exception>
#include <stdexcept>
#include <string>

#include "sdk/utilities/UxpAddon.h"

namespace {

// 全局变量存储最新的压感值（供未来扩展使用）
static float g_lastPressure = 0.5f;

/**
 * getPressure - 获取当前压感值
 * JavaScript: addon.getPressure() => { pressure: 0.5 }
 */
addon_value GetPressure(addon_env env, addon_callback_info info) {
    try {
        // 创建返回对象 { pressure: value }
        addon_value result = nullptr;
        Check(UxpAddonApis.uxp_addon_create_object(env, &result));
        
        // 创建 pressure 属性值
        addon_value pressureValue = nullptr;
        Check(UxpAddonApis.uxp_addon_create_double(env, static_cast<double>(g_lastPressure), &pressureValue));
        
        // 设置属性
        Check(UxpAddonApis.uxp_addon_set_named_property(env, result, "pressure", pressureValue));
        
        return result;
    } catch (...) {
        return CreateErrorFromException(env);
    }
}

/**
 * setPressure - 设置压感值（供 JavaScript 调用）
 * JavaScript: addon.setPressure(0.75)
 */
addon_value SetPressure(addon_env env, addon_callback_info info) {
    try {
        // 获取参数
        addon_value arg1;
        size_t argc = 1;
        Check(UxpAddonApis.uxp_addon_get_cb_info(env, info, &argc, &arg1, nullptr, nullptr));
        
        // 获取 double 值
        double value = 0.5;
        UxpAddonApis.uxp_addon_get_value_double(env, arg1, &value);
        
        // 限制范围 0-1
        if (value < 0.0) value = 0.0;
        if (value > 1.0) value = 1.0;
        
        g_lastPressure = static_cast<float>(value);
        
        // 返回 true
        addon_value result = nullptr;
        Check(UxpAddonApis.uxp_addon_get_boolean(env, true, &result));
        return result;
    } catch (...) {
        return CreateErrorFromException(env);
    }
}

/**
 * hello - 测试函数，验证 addon 加载成功
 * JavaScript: addon.hello() => "Pressure Addon Ready!"
 */
addon_value Hello(addon_env env, addon_callback_info info) {
    try {
        addon_value message = nullptr;
        const char* msg = "Pressure Addon Ready!";
        Check(UxpAddonApis.uxp_addon_create_string_utf8(env, msg, strlen(msg), &message));
        return message;
    } catch (...) {
        return CreateErrorFromException(env);
    }
}

/**
 * Init - 模块初始化，注册所有函数
 */
addon_value Init(addon_env env, addon_value exports, const addon_apis& addonAPIs) {
    addon_status status = addon_ok;
    addon_value fn = nullptr;

    // 注册 hello 函数
    {
        status = addonAPIs.uxp_addon_create_function(env, NULL, 0, Hello, NULL, &fn);
        if (status != addon_ok) {
            addonAPIs.uxp_addon_throw_error(env, NULL, "Unable to wrap hello function");
        }
        status = addonAPIs.uxp_addon_set_named_property(env, exports, "hello", fn);
        if (status != addon_ok) {
            addonAPIs.uxp_addon_throw_error(env, NULL, "Unable to export hello function");
        }
    }

    // 注册 getPressure 函数
    {
        status = addonAPIs.uxp_addon_create_function(env, NULL, 0, GetPressure, NULL, &fn);
        if (status != addon_ok) {
            addonAPIs.uxp_addon_throw_error(env, NULL, "Unable to wrap getPressure function");
        }
        status = addonAPIs.uxp_addon_set_named_property(env, exports, "getPressure", fn);
        if (status != addon_ok) {
            addonAPIs.uxp_addon_throw_error(env, NULL, "Unable to export getPressure function");
        }
    }

    // 注册 setPressure 函数
    {
        status = addonAPIs.uxp_addon_create_function(env, NULL, 0, SetPressure, NULL, &fn);
        if (status != addon_ok) {
            addonAPIs.uxp_addon_throw_error(env, NULL, "Unable to wrap setPressure function");
        }
        status = addonAPIs.uxp_addon_set_named_property(env, exports, "setPressure", fn);
        if (status != addon_ok) {
            addonAPIs.uxp_addon_throw_error(env, NULL, "Unable to export setPressure function");
        }
    }

    return exports;
}

}  // namespace

// 注册初始化函数
UXP_ADDON_INIT(Init)

// 终止函数
void terminate(addon_env env) {
    // 清理资源（如果有）
}

UXP_ADDON_TERMINATE(terminate)
