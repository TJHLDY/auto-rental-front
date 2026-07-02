<template>
  <el-main>
    <el-form :model="RoleModel" :inline="true">
      <el-form-item label="角色名称">
        <el-input v-model="RoleModel.roleName" placeholder="请输入角色名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button type="info" @click="reset">重置</el-button>
        <el-button v-permission="['system:role:Add']" type="success" @click="add">新增</el-button>
        <el-button v-permission="['system:role:Delete']" type="danger " @click="onBatchDelete">删除选中</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="getRoles" border style="width: 100%; margin-bottom: 20px;"
      @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column label="序号" width="80px" align="center">
        <template #default="scope">
          {{ (start - 1) * size + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="角色名称" prop="roleName"> </el-table-column>
      <el-table-column label="角色编码" prop="roleCode"></el-table-column>
      <el-table-column label="描述" prop="remark"></el-table-column>
      <el-table-column label="操作" width="300" fixed="right" align="center">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button v-permission="['system:role:Update']" type="primary" icon="el-icon-edit" @click="onEdit(scope.row)" size="mini">编辑</el-button>
            <el-button v-permission="['system:role:Delete']" type="danger" icon="el-icon-delete" @click="onDelete(scope.row)" size="mini">删除</el-button>
            <el-button v-permission="['system:role:Update']" type="success" icon="el-icon-setting" @click="onPermission(scope.row)"
              size="mini">权限分配</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="start"
      :page-sizes="[10, 20, 30, 40]" :page-size="size" layout="total, prev, pager, next, jumper" :total="total"
      background="">
    </el-pagination>
    <el-dialog title="权限分配" :visible.sync="permissionDialogVisible" width="500px">
      <el-tree ref="tree" :data="permissionTreeData" node-key="id" default-expand-all :expand-on-click-node="false"
        show-checkbox :check-strictly="true" :props="{ label: 'permissionLabel', children: 'children' }">
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onPermissionSubmit">提交</el-button>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="新增修改" :visible.sync="editOrAddDialogVisible" width="500px">
      <el-form :model="EARoleModel" :inline="true">
        <el-form-item label="角色名称">
          <el-input v-model="EARoleModel.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="EARoleModel.roleCode" placeholder="请输入角色编码"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="EARoleModel.remark" placeholder="请输入描述"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onEASubmit">提交</el-button>
          <el-button @click="EAcanal">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-main>

</template>

<script>
import roleUtil from '@/api/auth_role'

export default {
  name: 'RoleList',

  data() {
    return {
      // ========== 对话框状态 ==========
      permissionDialogVisible: false, // 权限分配对话框显示状态
      editOrAddDialogVisible: false, // 新增/编辑对话框显示状态
      EAStage: '', // 操作类型：'add'-新增，'edit'-编辑

      // ========== 表格数据 ==========
      getRoles: [], // 角色列表数据
      total: 0, // 总记录数
      size: 10, // 每页显示条数
      start: 1, // 当前页码
      selectedRows: [], // 选中的行数据

      // ========== 表单模型 ==========
      EARoleModel: { // 新增/编辑表单数据
        roleName: '',
        roleCode: '',
        remark: ''
      },
      RoleModel: { // 搜索条件
        roleName: ''
      },

      // ========== 权限树相关 ==========
      permissionTreeData: [], // 权限树数据
      currentRoleId: null // 当前操作的角色ID
    }
  },

  created() {
    this.search()
  },

  methods: {
    // ==================== 权限分配相关 ====================

    /**
     * 提交权限分配
     */
    async onPermissionSubmit() {
      // 获取选中的节点（包括半选中状态）
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      const halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys()

      // 合并全选中和半选中的节点，确保完整的权限树结构
      const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

      // 构造提交数据
      const rolePermissionData = {
        id: this.currentRoleId,
        permissionIds: allCheckedKeys
      }

      try {
        const res = await roleUtil.setRolePermission(rolePermissionData)
        if (res.code === 200) {
          this.$message.success('权限分配成功')
          this.permissionDialogVisible = false
        } else {
          this.$message.error(res.message || '权限分配失败')
        }
      } catch (error) {
        this.$message.error('权限分配失败')
        console.error(error)
      }
    },

    /**
     * 打开权限分配对话框
     * @param {Object} row - 角色行数据
     */
    async onPermission(row) {
      this.currentRoleId = row.id
      const res = await roleUtil.getRPTree(row)
      if (res.code === 200) {
        const checkedKeys = res.data.checkedPermissionIds || []
        const permissions = res.data.permissions || []

        const roleSelectNode = permissions.find(p => p.permissionCode === 'system:role:Select')
        if (roleSelectNode && !checkedKeys.includes(roleSelectNode.id)) {
          checkedKeys.push(roleSelectNode.id)
        }

        const permissionTree = this.buildTree(permissions)
        this.permissionTreeData = permissionTree

        this.$nextTick(() => {
          if (this.$refs.tree) {
            this.$refs.tree.setCheckedKeys(checkedKeys)
          }
        })
      } else {
        this.$message.error(res.message || '获取权限失败')
      }
      this.permissionDialogVisible = true
    },

    /**
     * 将扁平数组转换为树形结构
     * @param {Array} flatList - 扁平化的权限列表
     * @returns {Array} 树形结构的权限数据
     */
    buildTree(flatList = []) { // 加默认空数组
      const map = {}
      const tree = []

      if (!flatList || flatList.length === 0) {
        return tree
      }

      flatList.forEach(item => {
        map[item.id] = { ...item, children: [] }
        if (item.permissionCode === 'system:role:Select') {
          map[item.id].disabled = true
        }
      })

      flatList.forEach(item => {
        const node = map[item.id]
        if (item.pid === 0 || !map[item.pid]) {
          tree.push(node)
        } else {
          if (map[item.pid]) {
            map[item.pid].children.push(node)
          }
        }
      })

      return tree
    },

    // ==================== 角色增删改查 ====================

    /**
     * 搜索角色列表
     */
    async search() {
      const res = await roleUtil.fetchData(this.start, this.size, this.RoleModel)
      if (res.code === 200) {
        this.getRoles = res.data.records
        this.total = res.data.total
      }
    },

    /**
     * 重置搜索条件
     */
    reset() {
      this.RoleModel = {
        roleName: ''
      }
      this.selectedRows = []
      this.getRoles = []
      this.search()
    },

    /**
     * 打开新增对话框
     */
    add() {
      this.EAStage = 'add'
      this.EARoleModel = {
        roleName: '',
        roleCode: '',
        remark: ''
      }
      this.editOrAddDialogVisible = true
    },

    /**
     * 打开编辑对话框
     * @param {Object} row - 角色行数据
     */
    async onEdit(row) {
      this.EAStage = 'edit'
      this.EARoleModel = { ...row }
      this.editOrAddDialogVisible = true
    },

    /**
     * 提交新增/编辑表单
     */
    async onEASubmit() {
      if (this.EAStage === 'add') {
        // 新增角色
        const res = await roleUtil.add(this.EARoleModel)
        if (res.code === 200) {
          this.$message.success('新增成功')
          this.editOrAddDialogVisible = false
          this.search()
        } else {
          this.$message.error(res.message || '新增失败')
        }
      } else if (this.EAStage === 'edit') {
        // 编辑角色
        const res = await roleUtil.update(this.EARoleModel)
        if (res.code === 200) {
          this.$message.success('修改成功')
          this.editOrAddDialogVisible = false
          this.search()
        } else {
          this.$message.error(res.message || '修改失败')
        }
      }
    },

    /**
     * 取消新增/编辑
     */
    EAcanal() {
      this.EARoleModel = {
        roleName: '',
        roleCode: '',
        remark: ''
      }
      this.editOrAddDialogVisible = false
    },

    /**
     * 删除单个角色
     * @param {Object} row - 角色行数据
     */
    async onDelete(row) {
      // 先检查是否有子用户
      const hasUserRes = await roleUtil.hasUser(row.id)
      if (hasUserRes.code === 200 && hasUserRes.data) {
        this.$message.warning('该角色下有用户,无法删除')
        return
      }

      // 二次确认
      this.$confirm(`确定要删除角色 "${row.roleName}" 吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await roleUtil.delete(row.id)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.search()
        } else {
          this.$message.error(res.message || '删除失败')
        }
      }).catch(() => {
        // 用户取消了删除操作
      })
    },

    /**
     * 批量删除角色
     */
    async onBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的行')
        return
      }

      // 检查所有选中的角色是否都有子用户
      const checkPromises = this.selectedRows.map(row => roleUtil.hasUser(row.id))
      const checkResults = await Promise.all(checkPromises)

      // 找出有子用户的角色
      const rolesWithUsers = this.selectedRows.filter((row, index) => {
        return checkResults[index].code === 200 && checkResults[index].data
      })

      if (rolesWithUsers.length > 0) {
        const roleNames = rolesWithUsers.map(r => r.roleName).join('、')
        this.$message.warning(`以下角色下有用户,无法删除: ${roleNames}`)
        return
      }

      // 二次确认
      this.$confirm('确定要删除选中的角色吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const ids = this.selectedRows.map(row => row.id)
        const res = await roleUtil.deleteBatch(ids)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.selectedRows = []
          this.search()
        } else {
          this.$message.error(res.message || '删除失败')
        }
      }).catch(() => {
        // 用户取消了删除操作
      })
    },

    // ==================== 表格事件处理 ====================

    /**
     * 表格选择变化
     * @param {Array} val - 选中的行数据
     */
    handleSelectionChange(val) {
      this.selectedRows = val
    },

    /**
     * 每页显示条数变化
     * @param {Number} val - 新的每页条数
     */
    handleSizeChange(val) {
      this.size = val
      this.search()
    },

    /**
     * 当前页码变化
     * @param {Number} val - 新的页码
     */
    handleCurrentChange(val) {
      this.start = val
      this.search()
    }
  }
}
</script>