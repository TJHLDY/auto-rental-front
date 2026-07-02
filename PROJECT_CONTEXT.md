# 汽车租赁系统 - 项目上下文

## 项目概述

汽车租赁管理系统，前后端分离架构。数据库名：`auto_rental`。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 2 + Element UI + Vuex + Vue Router |
| 后端 | Spring Boot 3 + Spring Security + MyBatis-Plus + JWT |
| 数据库 | MySQL（auto_rental） |
| 缓存 | Redis（存储 JWT Token） |

## 目录结构

### 后端 `D:\ieda-java\auto_rental`

包路径：`org.gduf`

```
controller/     # REST 控制器
entity/         # 实体类（MyBatis-Plus @TableName）
  vo/           # 视图对象（UserInfo, RouteVO, RolePermissionTreeVO, UserVo）
mapper/         # MyBatis-Plus Mapper 接口
service/        # Service 接口
  impl/         # Service 实现
security/       # Spring Security 相关
  config/       # SecurityConfig（过滤链、CORS、密码编码器）
  filter/       # VerifyTokenFilter（JWT 校验过滤器）
  handle/       # 认证成功/失败/登出/拒绝访问 处理器
utils/          # 工具类（JwtUtil, RedisUtil, R, RouteTreeUtil, DeptTreeUtil）
```

### 前端 `D:\vue-element-admin-master\vue-element-admin-master`

基于 vue-element-admin 模板改造。

```
src/
  api/            # 接口封装（user.js, brand.js, maker.js, role.js, dept.js, permission.js, auth_role.js）
  directive/      # 自定义指令
    permission/   # v-permission 按钮权限指令
  layout/         # 布局组件（侧边栏、导航栏、TagsView）
  router/         # 路由（constantRoutes 静态 + 后端动态菜单）
  store/modules/  # Vuex 模块
    user.js       # 用户状态（token, name, avatar, roles）
    permission.js # 路由权限（动态路由生成）
  utils/
    request.js    # Axios 封装（requestHttp 对象，含 post/get/put/delete/login 方法）
    auth.js       # Token 存取（Cookie: Admin-Token）
    permission.js # checkPermission 工具函数
  views/          # 业务页面
    system/       # 系统管理（user, role, dept, menu）
    auto/         # 车辆管理（maker 厂商, brand 品牌）
    busi/         # 业务管理（rental 租赁 - 暂未开发）
```

## 认证与授权体系

### 登录流程

1. 前端 POST `/user/login`（form-urlencoded），Spring Security `formLogin` 处理
2. `CustomerUserDetailsService.loadUserByUsername()` 查用户 + 加载权限列表
3. 认证成功 → `CustomAuthenticationSuccessHandler` 生成 JWT，存入 Redis（key: `token:{jwt}`），返回 token
4. 前端存 token 到 Cookie（key: `Admin-Token`），后续请求通过 `request.js` 拦截器在 header 加 `Token` 字段

### Token 校验

- `VerifyTokenFilter` 在每次请求前校验 JWT，从 Redis 验证有效性
- 无状态会话（`SessionCreationPolicy.STATELESS`）

### 权限加载

1. 前端路由守卫（`permission.js`）检测到无 roles → 调用 `store.dispatch('user/getInfo')`
2. 后端 `AuthController.getInfo()` 返回 `UserInfo`：
   - `roles` 字段实际存的是 `permissionCode[]`（如 `["system:user:select", "system:user:add", ...]`）
3. 前端将 permissionCode 数组存入 `store.state.user.roles`
4. 同时调用 `store.dispatch('permission/generateRoutes')` → 请求 `/auth/getMenuList` 获取动态菜单

### 菜单权限（页面级）

- 后端 `AuthController.getMenuList()` 查当前用户权限，过滤掉 `permissionType=2`（按钮），构建路由树返回
- 前端 `permission.js` store 的 `filterAsyncRoutes` 动态解析组件路径，`router.addRoutes` 注入

### 按钮权限（按钮级）

- `sys_permission` 表中 `permission_type=2` 的记录为按钮权限
- `permission_code` 格式：`模块:子模块:操作`，如 `system:user:add`
- 后端通过 `@PreAuthorize("hasAuthority('xxx')")` 注解保护接口
- 前端通过 `v-permission` 指令控制按钮显隐（已在 main.js 全局注册）
- 已对所有业务页面的按钮加上 v-permission 控制：
  - `system/user/userList.vue` — 新增(`system:user:add`)、删除选中(`system:user:delete`)、编辑(`system:user:edit`)、删除(`system:user:delete`)
  - `system/role/roleList.vue` — 新增(`system:role:Add`)、删除选中(`system:role:Delete`)、编辑(`system:role:Update`)、删除(`system:role:Delete`)、权限分配(`system:role:Update`)
  - `system/dept/deptList.vue` — 新增(`system:dept:add`)、编辑(`system:dept:edit`)、删除(`system:dept:delete`)
  - `system/menu/menuList.vue` — 新增(`system:menu:menuAdd`)、编辑(`system:menu:menuUpdate`)、删除(`system:menu:menuDelete`)
  - `auto/maker/makerList.vue` — 新增(`auto:maker:makerAdd`)、删除选中(`auto:maker:makerDelete`)、编辑(`auto:maker:makerUpdate`)、删除(`auto:maker:makerDelete`)
  - `auto/brand/brandList.vue` — 新增(`auto:brand:brandAdd`)、删除选中(`auto:brand:brandDelete`)、编辑(`auto:brand:brandUpdate`)、删除(`auto:brand:brandDelete`)

### 权限分配特殊规则

- 角色管理的权限分配弹窗中，`system:role:Select`（角色查询）权限节点被强制勾选且 disabled 不可取消
- 实现方式：`roleList.vue` 的 `buildTree` 中对该节点设置 `disabled: true`，`onPermission` 中强制将其 id 加入 checkedKeys

## 数据库核心表

| 表名 | 说明 |
|------|------|
| sys_user | 用户表（实现 UserDetails） |
| sys_role | 角色表 |
| sys_permission | 权限/菜单表（type: 0-根目录, 1-子目录, 2-按钮） |
| sys_user_role | 用户-角色关联 |
| sys_role_permission | 角色-权限关联 |
| sys_dept | 部门表（树形结构） |
| auto_maker | 汽车厂商 |
| auto_brand | 汽车品牌（关联 maker） |

## 后端接口权限码对照表

### 系统管理

| 模块 | 操作 | permissionCode |
|------|------|----------------|
| 用户管理 | 查询 | `system:user:select` |
| 用户管理 | 新增 | `system:user:add` |
| 用户管理 | 编辑 | `system:user:edit` |
| 用户管理 | 删除 | `system:user:delete` |
| 角色管理 | 查询 | `system:role:Select` |
| 角色管理 | 新增 | `system:role:Add` |
| 角色管理 | 编辑 | `system:role:Update` |
| 角色管理 | 删除 | `system:role:Delete` |
| 部门管理 | 查询 | `system:dept:select` |
| 部门管理 | 新增 | `system:dept:add` |
| 部门管理 | 编辑 | `system:dept:edit` |
| 部门管理 | 删除 | `system:dept:delete` |
| 菜单管理 | 查询 | `system:menu:menuSelect` |
| 菜单管理 | 新增 | `system:menu:menuAdd` |
| 菜单管理 | 编辑 | `system:menu:menuUpdate` |
| 菜单管理 | 删除 | `system:menu:menuDelete` |

### 车辆管理

| 模块 | 操作 | permissionCode |
|------|------|----------------|
| 厂商管理 | 查询 | `auto:maker:makerSelect` |
| 厂商管理 | 新增 | `auto:maker:makerAdd` |
| 厂商管理 | 编辑 | `auto:maker:makerUpdate` |
| 厂商管理 | 删除 | `auto:maker:makerDelete` |
| 品牌管理 | 查询 | `auto:brand:brandSelect` |
| 品牌管理 | 新增 | `auto:brand:brandAdd` |
| 品牌管理 | 编辑 | `auto:brand:brandUpdate` |
| 品牌管理 | 删除 | `auto:brand:brandDelete` |

## 前端关键文件

| 文件 | 作用 |
|------|------|
| `src/main.js` | 入口，全局注册 v-permission 指令 |
| `src/permission.js` | 路由守卫，控制页面访问权限 |
| `src/store/modules/user.js` | 用户状态管理，getInfo 获取 permissionCode 存入 roles |
| `src/store/modules/permission.js` | 动态路由生成，从后端获取菜单列表 |
| `src/directive/permission/permission.js` | v-permission 指令实现，匹配 roles 中的 permissionCode |
| `src/utils/request.js` | Axios 封装，自动携带 Token |
| `src/utils/auth.js` | Token 存取（Cookie） |

## 注意事项

- permissionCode 命名风格不统一：角色管理用大写开头（`system:role:Select`），其他模块用小写（`system:user:select`）或驼峰（`system:menu:menuSelect`）
- `v-permission` 指令使用 `removeChild` 移除 DOM，不可逆。如需动态切换角色后恢复按钮，需改用 `v-if` + `checkPermission` 方式
- `UserInfo.roles` 字段名叫 roles 但实际存的是 permissionCode 数组，前端 store 也沿用 roles 这个名字
- 租赁模块（busi/rental）页面尚未开发，只有占位模板
