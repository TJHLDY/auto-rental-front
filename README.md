# Auto Rental Management System Frontend

汽车租赁管理系统前端，基于 Vue 2、Element UI 和 vue-element-admin 改造，配合 Spring Boot 后端实现后台管理、动态菜单、按钮级权限和汽车租赁业务页面。

> 后端仓库：[auto_reantal](https://github.com/TJHLDY/auto_reantal)

## 项目定位

本项目是汽车租赁管理系统的前端工程，用于展示后台管理系统的页面组织、权限路由、接口封装和业务管理界面。

当前仓库用于代码展示和本地运行验证，暂未提供公网在线 Demo。

## 技术栈

| 类型 | 技术 |
| --- | --- |
| 框架 | Vue 2 |
| UI | Element UI |
| 状态管理 | Vuex |
| 路由 | Vue Router |
| 网络请求 | Axios |
| 权限控制 | 动态路由 + `v-permission` |
| 构建工具 | Vue CLI |

## 核心功能

- 登录页：对接后端 `/user/login`，保存 JWT Token。
- 动态路由：登录后请求后端菜单树，根据权限生成可访问页面。
- 按钮权限：使用 `v-permission` 控制新增、编辑、删除等操作按钮。
- 系统管理：用户、角色、部门、菜单管理。
- 车辆管理：厂商、品牌、车辆信息等页面。
- 业务管理：客户、订单、租赁类型、违章、维护等模块页面。
- 前后端联调：Axios 拦截器统一携带 Token 并处理认证状态。

## 本地启动

先启动后端：

```powershell
cd D:\ieda-java\auto_rental
docker compose up --build
```

再启动前端：

```powershell
cd D:\ieda-java\auto-rental-front
npm install --legacy-peer-deps
npm run dev
```

访问：

```text
http://localhost:9527
```

默认测试账号：

```text
用户名：admin
密码：123456
```

## 目录结构

```text
src
├─ api              # 后端接口封装
├─ directive        # 自定义指令，包含按钮权限 v-permission
├─ layout           # 后台管理布局
├─ router           # 静态路由
├─ store/modules    # user / permission 等 Vuex 模块
├─ utils            # request、auth、权限工具
└─ views            # 系统管理、车辆管理、业务管理页面
```

## 与后端的关系

- 登录接口：`POST /user/login`
- 用户信息：`GET /auth/getInfo`
- 动态菜单：`GET /auth/getMenuList`
- Token 存储：Cookie `Admin-Token`
- 请求头：`Token`

## 构建验证

```powershell
npm run build:prod
```

构建产物输出到：

```text
dist/
```

## 面试说明

可以重点讲：

- 如何把 vue-element-admin 模板改造成真实业务系统。
- 登录后如何通过后端菜单树生成动态路由。
- 前端按钮权限如何和后端 `permissionCode` 对齐。
- Axios 拦截器如何统一处理 Token 和接口错误。
- 前端页面如何围绕汽车租赁后台的系统管理、车辆管理和业务管理组织。

当前限制：

- 暂未提供公网在线 Demo。
- 线上部署、截图和录屏展示尚未整理到本仓库。
- 当前项目仍保留部分 vue-element-admin 基础结构，后续可继续做组件瘦身和文档补充。
