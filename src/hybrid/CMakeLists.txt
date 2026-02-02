cmake_minimum_required(VERSION 3.15)
project(bolt-uxp-hybrid VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# SDK 源文件
set(SDK_SOURCES
    sdk/utilities/UxpAddon.cpp
    sdk/utilities/UxpTask.cpp
    sdk/utilities/UxpValue.cpp
)

# 主模块源文件
set(MODULE_SOURCES
    PressureReader.cpp
)

# 输出为 DLL，扩展名改为 .uxpaddon
add_library(${PROJECT_NAME} SHARED
    ${SDK_SOURCES}
    ${MODULE_SOURCES}
)

# 包含路径
target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/sdk
)

# Windows 特定设置
if(WIN32)
    set_target_properties(${PROJECT_NAME} PROPERTIES
        SUFFIX ".uxpaddon"
        OUTPUT_NAME "bolt-uxp-hybrid"
    )
    
    # 链接 Windows API
    target_link_libraries(${PROJECT_NAME} PRIVATE
        user32
    )
    
    # 禁用一些警告
    target_compile_definitions(${PROJECT_NAME} PRIVATE
        _CRT_SECURE_NO_WARNINGS
    )
endif()

# 输出到 public-hybrid/win/x64
set(OUTPUT_DIR "${CMAKE_SOURCE_DIR}/../../public-hybrid/win/x64")
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy
        $<TARGET_FILE:${PROJECT_NAME}>
        "${OUTPUT_DIR}/$<TARGET_FILE_NAME:${PROJECT_NAME}>"
    COMMENT "Copying to public-hybrid..."
)
