cmake_minimum_required(VERSION 3.17)


if (APPLE)













    file(GLOB_RECURSE DEMO_SOURCE_OBJC
            "${CMAKE_CURRENT_SOURCE_DIR}/src/*.mm"
            "${DEMO_CGE_DIR}/tests/*.mm"
    )
endif ()

