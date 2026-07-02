<template>
    <div>
        <el-form :model="PermissionModel" ref="deptForm" label-width="80px">
            <el-form-item label="操作" prop="deptName">
                <el-button v-permission="['system:menu:menuAdd']" type="success" @click="onAdd" icon="el-icon-plus">新增</el-button>
            </el-form-item>
        </el-form>
        <el-table :data="treeModel" style="width: 100%" ref="table" border row-key="id"
            :tree-props="{ children: 'children' }">
            <el-table-column prop="permissionLabel" label="权限名称" min-width="180"></el-table-column>
            <el-table-column prop="permissionType" label="菜单类型" min-width="180">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.permissionType === 0" type="success">根目录</el-tag>
                    <el-tag v-if="scope.row.permissionType === 1" type="">菜单</el-tag>
                    <el-tag v-if="scope.row.permissionType === 2" type="warning">按钮</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="routeName" label="路由名称" min-width="180"></el-table-column>
            <el-table-column prop="routePath" label="路由地址" min-width="180"></el-table-column>
            <el-table-column prop="routeUrl" label="路由路径" min-width="180"></el-table-column>
            <el-table-column prop="icon" label="图标" min-width="180">
                <template slot-scope="scope">
                    <i :class="scope.row.icon" style="margin-right:5px;" v-if="scope.row.icon && scope.row.icon.indexOf('el-icon') !== -1"></i>
                    <svg-icon :icon-class="scope.row.icon" v-else></svg-icon>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
                <template slot-scope="scope">
                    <el-button v-permission="['system:menu:menuUpdate']" type="text" size="mini" icon="el-icon-edit" @click="onEdit(scope.row)">编辑</el-button>
                    <el-button v-permission="['system:menu:menuDelete']" type="text" size="mini" icon="el-icon-delete" class="danger-text"
                        @click="onDeleteRow(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 新增/编辑权限对话框 -->
        <el-dialog 
            :visible.sync="dialogVisible" 
            :title="dialogStatus === 'add' ? '新增权限' : '编辑权限'" 
            width="600px"
            @close="resetDialog"
        >
            <el-form 
                ref="permissionForm" 
                :model="formData" 
                :rules="formRules" 
                label-width="100px"
            >
                <el-form-item label="上级名称" prop="pid">
                    <el-input 
                        v-model="formData.parentLabel" 
                        placeholder="请选择上级菜单" 
                        clearable 
                        readonly
                        @click.native="selectParentMenu"
                        style="cursor: pointer;"
                    >
                        <i slot="suffix" class="el-icon-arrow-down"></i>
                    </el-input>
                </el-form-item>
                
                <el-form-item label="权限名称" prop="permissionLabel">
                    <el-input 
                        v-model="formData.permissionLabel" 
                        placeholder="请输入权限名称" 
                        clearable
                    ></el-input>
                </el-form-item>
                
                <el-form-item label="菜单类型" prop="permissionType">
                    <el-radio-group v-model="formData.permissionType" @change="handlePermissionTypeChange">
                        <el-radio-button :label="0">根目录</el-radio-button>
                        <el-radio-button :label="1">菜单</el-radio-button>
                        <el-radio-button :label="2">按钮</el-radio-button>
                    </el-radio-group>
                </el-form-item>
                
                <el-form-item v-if="formData.permissionType !== 2" label="路由路径" prop="routeUrl">
                    <el-input 
                        v-model="formData.routeUrl" 
                        placeholder="请输入路由路径" 
                        clearable
                    ></el-input>
                </el-form-item>
                
                <el-form-item label="图标" prop="icon">
                    <el-input 
                        v-model="formData.icon" 
                        placeholder="请输入图标类名，如：el-icon-user 或 svg 图标名" 
                        clearable
                    >
                        <i slot="prefix" :class="formData.icon" v-if="formData.icon && formData.icon.indexOf('el-icon') !== -1"></i>
                        <svg-icon slot="prefix" :icon-class="formData.icon" v-else-if="formData.icon"></svg-icon>
                    </el-input>
                </el-form-item>
                
                <el-form-item v-if="dialogStatus === 'add' && formData.permissionType === 2" label="一键添加" prop="oneClickAdd">
                    <el-switch
                      v-model="formData.oneClickAdd"
                      active-text="是"
                      inactive-text="否">
                    </el-switch>
                </el-form-item>
            </el-form>
            
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button v-if="formData.oneClickAdd" type="warning" @click="handleOneClickAdd" :loading="submitLoading">一键添加</el-button>
                <el-button v-else type="primary" @click="handleSubmit" :loading="submitLoading">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 上级菜单树选择弹窗 -->
        <el-dialog 
            title="选择上级菜单" 
            :visible.sync="treeDialogVisible" 
            width="500px" 
            append-to-body
        >
            <el-input
                v-model="filterText"
                placeholder="输入关键字进行过滤"
                clearable
                style="margin-bottom: 15px;"
            ></el-input>
            <el-tree 
                ref="menuTree"
                :data="treeModelForSelector" 
                :props="{ children: 'children', label: 'permissionLabel', isLeaf: 'isLeaf' }" 
                @node-click="handleNodeClick" 
                highlight-current
                node-key="id"
                :filter-node-method="filterNode"
                :expand-on-click-node="false"
            >
                <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span>
                        <i :class="data.icon" v-if="data.icon && data.icon.indexOf('el-icon') !== -1" style="margin-right:5px;"></i>
                        <svg-icon :icon-class="data.icon" v-else-if="data.icon" style="margin-right:5px;"></svg-icon>
                        {{ node.label }}
                    </span>
                    <el-tag size="mini" v-if="data.permissionType === 0" type="success" style="margin-left:8px;">根目录</el-tag>
                    <el-tag size="mini" v-else-if="data.permissionType === 1" style="margin-left:8px;">菜单</el-tag>
                </span>
            </el-tree>
            <div style="text-align:right;margin-top:15px;">
                <el-button @click="treeDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmSelect">确定选择</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import permission from '@/api/permission'
export default {
    data() {
        const validateRouteUrl = (rule, value, callback) => {
            if (this.formData.permissionType !== 2 && !value) {
                callback(new Error('请输入路由路径'))
            } else {
                callback()
            }
        }
        return {
            PermissionModel: {},
            treeModel: [],
            treeModelForSelector: [],
            dialogVisible: false,
            dialogStatus: '',
            submitLoading: false,
            treeDialogVisible: false,
            filterText: '',
            selectedNode: null,
            formData: {
                id: null,
                pid: null,
                parentLabel: '',
                permissionLabel: '',
                permissionType: 1,
                routeUrl: '',
                icon: '',
                oneClickAdd: false
            },
            formRules: {
                permissionLabel: [
                    { required: true, message: '请输入权限名称', trigger: 'blur' },
                    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
                ],
                permissionType: [
                    { required: true, message: '请选择菜单类型', trigger: 'change' }
                ],
                routeUrl: [
                    { validator: validateRouteUrl, trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        this.getTableData()
        this.getTree()
    },
    watch: {
        filterText(val) {
            this.$refs.menuTree?.filter(val)
        },
        'formData.oneClickAdd'() {
            this.updateValidationRules()
        }
    },
    methods: {
        filterNode(value, data) {
            if (data.permissionType === 2) {
                return false
            }
            if (!value) return true
            return data.permissionLabel.indexOf(value) !== -1
        },
        async getTree() {
            // 获取树形数据用于对话框中的上级菜单选择器
            const res = await permission.getTree()
            if (res.code === 200) {
                // 为选择器处理数据，添加 isLeaf 标记
                const processTreeDataForSelector = (data) => {
                    return data.map(item => {
                        const newItem = { ...item }
                        if (newItem.permissionType === 1) {
                            // 菜单类型且无子节点，标记为叶子节点
                            delete newItem.children
                            newItem.isLeaf = true
                        } else if (newItem.children?.length > 0) {
                            // 有子节点，递归处理
                            newItem.children = processTreeDataForSelector(newItem.children)
                            newItem.isLeaf = false
                        } else {
                            // 无子节点的其他类型，标记为叶子节点
                            delete newItem.children
                            newItem.isLeaf = true
                        }
                        return newItem
                    })
                }
                this.treeModelForSelector = processTreeDataForSelector(res.data)
            }
        },

        async getTableData() {
            // 获取表格数据用于主表格显示
            const res = await permission.search()
            if (res.code === 200) {
                // 主表格直接使用后端数据，让 Element UI 根据 children 自动判断展开/收起
                this.treeModel = res.data
            }
        },

        selectParentMenu() {
            this.treeDialogVisible = true
            this.selectedNode = null
            this.filterText = ''
            this.$nextTick(() => {
                this.$refs.menuTree?.filter('')
            })
        },

        handleNodeClick(data) {
            this.selectedNode = data
        },

        confirmSelect() {
            if (!this.selectedNode) {
                this.$message.warning('请选择一个上级菜单')
                return
            }
            this.formData.pid = this.selectedNode.id
            this.formData.parentLabel = this.selectedNode.permissionLabel
            this.treeDialogVisible = false
        },

        handlePermissionTypeChange() {
            if (this.formData.permissionType === 2) {
                this.formData.routeUrl = ''
            }
        },

        onAdd() {
            this.dialogStatus = 'add'
            this.resetFormData()
            this.dialogVisible = true
        },
        
        onEdit(row) {
            this.dialogStatus = 'edit'
            this.formData = {
                id: row.id,
                parentLabel: row.parentLabel || '',
                permissionLabel: row.permissionLabel,
                permissionType: row.permissionType,
                routeUrl: row.routeUrl,
                icon: row.icon || '',
                oneClickAdd: false
            }
            this.dialogVisible = true
        },
        
        async handleSubmit() {
            this.$refs.permissionForm.validate(async (valid) => {
                if (!valid) return
                
                this.submitLoading = true
                try {
                    let res
                    if (this.dialogStatus === 'add') {
                        res = await permission.add(this.formData)
                        if (res.code === 200) {
                            this.$message.success('新增成功')
                        }
                    } else {
                        res = await permission.update(this.formData)
                        if (res.code === 200) {
                            this.$message.success('编辑成功')
                        }
                    }
                    // 无论新增还是编辑，只要成功就刷新数据
                    this.dialogVisible = false
                    await this.getTableData()
                    await this.getTree()
                } catch (error) {
                    this.$message.error('操作失败')
                } finally {
                    this.submitLoading = false
                }
            })
        },
        
        async handleOneClickAdd() {
            this.$refs.permissionForm.validate(async (valid) => {
                if (!valid) return
                
                if (!this.formData.pid) {
                    this.$message.error('请先选择上级菜单')
                    return
                }
                
                this.submitLoading = true
                try {
                    const res = await permission.oneClickAddButton(this.formData.pid)
                    if (res.code === 200) {
                        this.$message.success('一键添加成功')
                        this.dialogVisible = false
                        await this.getTableData()
                        await this.getTree()
                    }
                } catch (error) {
                    this.$message.error('一键添加失败')
                } finally {
                    this.submitLoading = false
                }
            })
        },
        
        resetDialog() {
            this.$refs.permissionForm?.resetFields()
            this.dialogStatus = ''
            this.selectedNode = null
        },

        resetFormData() {
            this.formData = {
                id: null,
                pid: null,
                parentLabel: '',
                permissionLabel: '',
                permissionType: 1,
                routeUrl: '',
                icon: '',
                oneClickAdd: false
            }
        },
        
        // 监听一键添加状态变化，动态调整验证规则
        updateValidationRules() {
            this.$nextTick(() => {
                if (this.formData.oneClickAdd) {
                    // 如果勾选一键添加，则移除权限名称的验证规则
                    this.formRules.permissionLabel = []
                } else {
                    // 否则恢复原来的验证规则
                    this.formRules.permissionLabel = [
                        { required: true, message: '请输入权限名称', trigger: 'blur' },
                        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
                    ]
                }
                // 清除当前验证状态
                this.$refs.permissionForm?.clearValidate()
            })
        },

        async onDeleteRow(row) {
            try {
                await this.$confirm(`确认删除权限 "${row.permissionLabel}" 吗?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                
                const res = await permission.hasChild(row)
                if (res.data === "T") {
                    this.$message.error('无法删除，存在子权限')
                    return
                }
                
                const deleteRes = await permission.delete(row.id)
                if (deleteRes.code === 200) {
                    this.$message.success('删除成功')
                    await this.getTableData()
                    await this.getTree()
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.info('已取消删除')
                }
            }
        }
    }
}
</script>

<style scoped>
::v-deep .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}

::v-deep .el-tree-node__content {
    height: 36px;
    line-height: 36px;
}

::v-deep .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: #ecf5ff;
    color: #409EFF;
    font-weight: 500;
}

::v-deep .el-tree-node__expand-icon.expanded {
    transform: rotate(90deg);
}

::v-deep .el-input__inner:focus {
    border-color: #409EFF;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}
</style>