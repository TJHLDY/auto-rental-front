<template>
  <div class="app-container">
    <el-container>
      <!-- 左侧部门树 -->
      <el-aside width="250px" class="department-aside">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span>部门列表</span>
          </div>
          <el-input v-model="deptFilterText" placeholder="输入关键字进行过滤" size="mini" clearable @clear="filterDeptTree"
            @keyup.enter.native="filterDeptTree">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
          <div class="tree-wrapper">
            <el-tree ref="deptTree" :data="deptTreeData" :props="deptTreeProps" :filter-node-method="filterNode"
              @node-click="handleDeptClick" node-key="id" highlight-current :expand-on-click-node="false"
              :default-expand-all="true" />
          </div>
        </el-card>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-container>
        <el-header class="user-header">
          <!-- 搜索表单 -->
          <el-form :model="searchForm" :inline="true" class="search-form">
            <el-form-item label="用户名">
              <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="search">查询</el-button>
              <el-button type="info" @click="reset">重置</el-button>
              <el-button v-permission="['system:user:add']" type="success" @click="onAdd">新增</el-button>
              <el-button v-permission="['system:user:delete']" type="danger" @click="onBatchDelete">删除选中</el-button>
            </el-form-item>
          </el-form>
        </el-header>

        <el-main class="user-main">
          <!-- 用户表格 -->
          <el-table :data="userList" border style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="username" label="用户名" width="150"></el-table-column>
            <el-table-column prop="gender" label="性别" width="80">
              <template #default="scope">
                <span>{{ scope.row.gender === 1 ? '男' : '女' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="电话"></el-table-column>
            <el-table-column prop="email" label="邮箱"></el-table-column>
            <el-table-column prop="roleName" label="角色" width="120"></el-table-column>
            <el-table-column prop="avatar" label="头像" width="100">
              <template #default="scope">
                <img v-if="scope.row.avatar" :src="scope.row.avatar" class="avatar-img" alt="头像" @error="handleImgError">
                <span v-else>暂无头像</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right" align="center">
              <template #default="scope">
                <div class="operation-buttons">
                  <el-button v-permission="['system:user:edit']" type="primary" icon="el-icon-edit" @click="onEdit(scope.row)" size="mini">编辑</el-button>
                  <el-button v-permission="['system:user:delete']" type="danger" icon="el-icon-delete" @click="onDelete(scope.row)" size="mini">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="currentPage" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper" :total="total" class="pagination">
          </el-pagination>
        </el-main>
      </el-container>
    </el-container>

    <!-- 编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="editDialogVisible" width="500px">
      <el-form :model="userForm" :inline="true">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="userForm.gender" placeholder="请选择性别">
            <el-option label="男" :value="1"></el-option>
            <el-option label="女" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <!-- 密码字段仅在新增模式下显示 -->
        <el-form-item v-if="dialogType === 'add'" label="密码">
          <el-input v-model="userForm.password" placeholder="请输入密码" type="password"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="userForm.phone" placeholder="请输入电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-cascader :key="cascaderKey" v-model="userForm.deptId" :options="deptOptions"
            :props="{ value: 'id', label: 'deptName', children: 'children', checkStrictly: true, isLeaf: 'isLeaf', emitPath: false }"
            placeholder="请选择所属部门" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="角色分配">
          <el-select v-model="userForm.roleId" placeholder="请选择角色" clearable style="width: 100%">
            <el-option v-for="role in roleOptions" :key="role.id" :label="role.roleName" :value="role.id" />
          </el-select>
          <div class="current-role-info" v-if="userForm.roleName">
            当前角色：{{ userForm.roleName }}
          </div>
        </el-form-item>
        <el-form-item label="头像">
          <div class="upload-avatar">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :http-request="uploadAvatar"
              :before-upload="beforeAvatarUpload"
              v-permission="['system:user:edit', 'system:user:add']">
              <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar-preview" @error="handleImgError">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <el-button 
              v-if="userForm.avatar" 
              type="text" 
              icon="el-icon-delete" 
              @click="clearAvatar"
              size="mini"
              style="margin-top:5px;width:100%">
              清空头像
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
          <el-button @click="closeDialog">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import deptApi from '@/api/dept'
import userApi from '@/api/user'
import authRoleApi from '@/api/auth_role'
import { getToken } from '@/utils/auth'
import requestHttp from '@/utils/request'

export default {
  name: 'UserList',
  data() {
    return {
      // 部门树相关
      deptTreeData: [],
      deptTreeProps: {
        label: 'deptName',
        children: 'children'
      },
      deptFilterText: '',

      // 搜索表单
      searchForm: {
        username: '',
        deptId: null
      },

      // 用户表格相关
      userList: [],
      selectedUsers: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,

      // 对话框相关
      editDialogVisible: false,
      dialogTitle: '',
      dialogType: '',
      userForm: {
        id: null,
        username: '',
        gender: 1,
        phone: '',
        email: '',
        avatar: '',
        password: '',
        deptId: null,
        deptName: '',
        roleId: null,
        roleName: ''
      },

      // 部门下拉选项
      deptOptions: [],
      cascaderKey: 0,

      // 角色下拉选项
      roleOptions: [],
      
      // 上传配置
      uploadLoading: false
    }
  },

  watch: {
    deptFilterText(val) {
      this.filterDeptTree(val)
    }
  },

  created() {
    this.loadDeptTree()
    this.loadDeptOptions()
    this.loadRoleOptions()
    this.search()
  },

  methods: {
    // 加载角色选项
    async loadRoleOptions() {
      try {
        const response = await authRoleApi.selectChildRoleByUserId()
        if (response.code === 200) {
          this.roleOptions = response.data || []
        } else {
          this.$message.error(response.message || '获取角色列表失败')
          this.roleOptions = []
        }
      } catch (error) {
        console.error('获取角色列表失败:', error)
        this.$message.error('获取角色列表失败')
        this.roleOptions = []
      }
    },

    // 加载部门树
    async loadDeptTree() {
      try {
        const response = await deptApi.getTree()
        if (response.code === 200) {
          this.deptTreeData = response.data
        } else {
          this.$message.error(response.message || '获取部门树失败')
          this.deptTreeData = []
        }
      } catch (error) {
        console.error('获取部门树失败:', error)
        this.$message.error('获取部门树失败')
        this.deptTreeData = []
      }
    },

    // 加载部门级联选项
    async loadDeptOptions() {
      try {
        const response = await deptApi.search({})
        if (response.code === 200) {
          this.deptOptions = response.data || []
          await this.setIsLeaf(this.deptOptions)
          this.cascaderKey++
        } else {
          this.$message.error(response.message || '获取部门选项失败')
          this.deptOptions = []
        }
      } catch (error) {
        console.error('获取部门选项失败:', error)
        this.$message.error('获取部门选项失败')
        this.deptOptions = []
      }
    },

    // 递归设置叶子节点
    async setIsLeaf(nodes) {
      for (const node of nodes) {
        if (node.children && node.children.length === 0) {
          delete node.children
        }
        node.isLeaf = true
        try {
          const res = await deptApi.hasChild({ id: node.id })
          if (res.code === 200 && res.data) {
            node.isLeaf = false
          }
        } catch (err) {
          node.isLeaf = true
        }
        if (node.children && node.children.length > 0) {
          await this.setIsLeaf(node.children)
        }
      }
    },

    // 部门树过滤
    filterNode(value, data) {
      if (!value) return true
      return data.deptName.indexOf(value) !== -1
    },

    filterDeptTree(val) {
      this.$refs.deptTree.filter(val)
    },

    // 左侧部门点击
    handleDeptClick(data) {
      this.searchForm.deptId = data.id
      this.currentPage = 1
      this.search()
    },

    // 查询用户
    async search() {
      try {
        const data = {
          ...this.searchForm,
          start: this.currentPage,
          size: this.pageSize
        }
        const response = await userApi.fetchData(data)
        if (response.code === 200) {
          this.userList = response.data.records
          this.total = response.data.total
        } else {
          this.$message.error(response.message || '获取用户列表失败')
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.$message.error('获取用户列表失败')
      }
    },

    // 重置
    reset() {
      this.searchForm = {
        username: '',
        deptId: null
      }
      this.deptFilterText = ''
      this.selectedUsers = []
      this.currentPage = 1
      this.search()
    },

    // 表格多选
    handleSelectionChange(selection) {
      this.selectedUsers = selection
    },

    // 批量删除
    async onBatchDelete() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请选择要删除的用户')
        return
      }
      try {
        this.$confirm(`确定要删除选中的 ${this.selectedUsers.length} 个用户吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const ids = this.selectedUsers.map(user => user.id)
          const response = await userApi.deleteBatch(ids)
          if (response.code === 200) {
            this.$message.success('删除成功')
            this.selectedUsers = []
            this.search()
          } else {
            this.$message.error(response.message || '删除失败')
          }
        })
      } catch (error) {
        console.error('批量删除失败:', error)
      }
    },

    // 单条删除
    async onDelete(row) {
      try {
        this.$confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const response = await userApi.delete(row.id)
          if (response.code === 200) {
            this.$message.success('删除成功')
            this.search()
          } else {
            this.$message.error(response.message || '删除失败')
          }
        })
      } catch (error) {
        console.error('删除用户失败:', error)
      }
    },

    // 编辑
    onEdit(row) {
      this.dialogType = 'edit'
      this.dialogTitle = '编辑用户'
      const userFormData = {
        ...row,
        roleId: row.roleId || null,
        gender: row.gender === true || row.gender === 1 ? 1 : 0
      }
      if (userFormData.deptId) {
        const selectedDept = this.deptOptions.find(dept => dept.id === userFormData.deptId)
        if (selectedDept) {
          userFormData.deptName = selectedDept.deptName
        }
      }
      this.userForm = userFormData
      this.editDialogVisible = true
    },

    // 新增
    onAdd() {
      this.dialogType = 'add'
      this.dialogTitle = '新增用户'
      this.userForm = {
        id: null,
        username: '',
        gender: 1,
        phone: '',
        email: '',
        avatar: '',
        password: '',
        deptId: null,
        deptName: '',
        roleId: null,
        roleName: ''
      }
      this.editDialogVisible = true
    },

    // 提交
    async onSubmit() {
      // 简单的前端验证
      if (!this.userForm.username) {
        this.$message.warning('请输入用户名')
        return
      }
      if (this.dialogType === 'add' && !this.userForm.password) {
        this.$message.warning('请输入密码')
        return
      }

      try {
        let response
        if (this.dialogType === 'add') {
          response = await userApi.add(this.userForm)
        } else {
          response = await userApi.update(this.userForm)
        }
        if (response.code === 200) {
          this.$message.success(`${this.dialogType === 'add' ? '新增' : '修改'}成功`)
          this.closeDialog()
          this.search()
        } else {
          this.$message.error(response.message || `${this.dialogType === 'add' ? '新增' : '修改'}失败`)
        }
      } catch (error) {
        console.error(`${this.dialogType === 'add' ? '新增' : '修改'}失败:`, error)
        this.$message.error(`${this.dialogType === 'add' ? '新增' : '修改'}失败`)
      }
    },

    // 关闭弹窗
    closeDialog() {
      this.editDialogVisible = false
      this.uploadLoading = false
    },

    // 上传前校验
    beforeAvatarUpload(file) {
      const isImage = file.type.includes('image/')
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isImage) {
        this.$message.error('只能上传图片格式！')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB！')
        return false
      }
      this.uploadLoading = true
      return true
    },
    
    async uploadAvatar(options) {
      const formData = new FormData()
      formData.append('file', options.file)
      try {
        const res = await requestHttp.upload('/upload/avatar', formData)
        if (res.code === 200) {
          this.userForm.avatar = res.data || res.url
          this.$message.success('头像上传成功')
        } else {
          this.$message.error(res.message || '头像上传失败')
        }
      } catch (e) {
        this.$message.error('头像上传失败')
      } finally {
        this.uploadLoading = false
      }
    },

    // 清空头像
    clearAvatar() {
      this.userForm.avatar = ''
      this.$message.success('头像已清空')
    },

    // 图片加载失败兜底
    handleImgError(e) {
      // 防止重复触发
      if (e.target.src !== 'https://cube.elemecdn.com/0/8c/cf5114bac85b8160e7673296039d7png.png') {
        e.target.src = 'https://cube.elemecdn.com/0/8c/cf5114bac85b8160e7673296039d7png.png'
      }
    },

    // 分页
    handleSizeChange(val) {
      this.pageSize = val
      this.search()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.search()
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.department-aside {
  margin-right: 20px;
}

.box-card {
  height: calc(100vh - 140px);
}

.tree-wrapper {
  margin-top: 10px;
  height: calc(100% - 40px);
  overflow-y: auto;
}

.user-header {
  padding: 0 0 20px 0;
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.search-form {
  width: 100%;
}

.user-main {
  padding: 0;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.upload-avatar {
  width: 100px;
  height: 100px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar-preview {
  width: 100px;
  height: 100px;
  display: block;
}

.current-role-info {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}
</style>