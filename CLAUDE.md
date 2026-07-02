# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

汽车租赁管理系统（Auto Rental）前端，基于 vue-element-admin v4.4.0 模板开发。后端项目位于 `D:\ieda-java\auto_rental`。

Tech stack: Vue 2.6.10 + Element UI 2.13.2 + Vuex 3.1.0 + Vue Router 3.0.2 + Axios

## Commands

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (http://localhost:9527)
npm run build:prod   # 生产环境构建
npm run build:stage  # 预发布环境构建
npm run lint         # ESLint 检查
npm run test:unit    # Jest 单元测试
npm run test:ci      # lint + 单元测试
```

## Architecture

### API 层 (`src/utils/request.js`)

Axios 封装了 7 种请求方法，所有 API 调用必须使用对应方法：
- `login()` — form-urlencoded POST（Spring Security formLogin）
- `post()` / `put()` — JSON body（@RequestBody）
- `get()` — query string（qs.stringify）
- `getRestFulApi()` — RESTful 路径参数
- `delete()` — RESTful DELETE（支持批量 data 数组）
- `upload()` — multipart/form-data

请求拦截器从 Cookie (`Admin-Token`) 读取 token 并设置到 `Token` header。响应拦截器校验 `code === 200`，处理 token 过期（50008/50012/50014）。

### 认证与权限

**登录流程：** POST `/user/login` (form-urlencoded) → 后端返回 JWT → 存入 Cookie (`Admin-Token`) → 路由守卫触发 `getInfo` 获取权限码 → `generateRoutes` 请求 `/auth/getMenuList` 获取菜单树 → `router.addRoutes()` 动态注册路由。

**两级权限控制：**
- 页面级：路由守卫 (`src/permission.js`) + 动态路由生成 (`store/modules/permission.js`)
- 按钮级：`v-permission` 指令（`src/directive/permission/permission.js`），用法：`v-permission="['system:user:add']"`

**权限码存储位置：** `store.state.user.roles`（注意：字段名是 roles，实际存的是权限码数组，不是角色名）

### 权限码命名规范（现状不一致）

存在三种风格混用：
- 小写：`system:user:select`, `system:dept:add`
- PascalCase：`system:role:Select`, `system:role:Add`
- camelCase：`system:menu:menuSelect`, `auto:maker:makerAdd`

### 路由结构

- 静态路由 (`constantRoutes`)：login、dashboard、profile、404/401
- 动态路由：由后端 `/auth/getMenuList` 返回菜单树，前端 `filterAsyncRoutes()` 递归处理后注册

### 环境配置

- 开发环境 API 地址：`http://localhost:8080/`（`.env.development`）
- 生产环境 API 地址：`http://localhost:8080/`（`.env.production`）
- 开发环境集成了 Mock Server（`vue.config.js` devServer.before）

### 业务模块

- `views/system/` — 系统管理（用户、角色、部门、菜单）
- `views/auto/` — 车辆管理（厂商、品牌、租赁类型、车辆信息）
- `views/busi/` — 业务管理（租赁管理，尚未开发）

### API 模块约定

每个 `src/api/*.js` 文件 export default 一个对象，包含 async 方法，使用 `requestHttp` 中对应的请求方法。新增 API 模块时遵循此模式。

### 列表页通用模式

左侧树形筛选 + 右侧搜索表单 + 表格 + 分页 + 对话框增删改。参考 `views/system/user/userList.vue`。
