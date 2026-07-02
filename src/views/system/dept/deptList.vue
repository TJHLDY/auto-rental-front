<template>
    <div class="rental-list">
        <!-- 搜索区域卡片化 -->
        <el-card class="search-card" shadow="never">
            <el-form :inline="true" :model="deptModel" class="demo-form-inline" size="small" label-width="80px">
                <el-form-item label="部门名称">
                    <el-input v-model="deptModel.deptName" placeholder="请输入部门名称" clearable></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="onSubmit">查询</el-button>
                    <el-button type="warning" icon="el-icon-refresh" @click="onReform">重置</el-button>
                    <el-button v-permission="['system:dept:add']" type="success" icon="el-icon-plus" @click="onAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 表格区域 -->
        <el-card class="table-card" shadow="never">
            <el-table :data="deptList" style="width: 100%" row-key="id"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" default-expand-all border>
                <el-table-column prop="deptName" label="部门名称" min-width="180"></el-table-column>
                <el-table-column prop="parentName" label="上级名称" min-width="180"></el-table-column>
                <el-table-column prop="phone" label="部门电话" width="150"></el-table-column>
                <el-table-column prop="address" label="部门地址" min-width="200"></el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                    <template slot-scope="scope">
                        <el-button v-permission="['system:dept:edit']" type="text" size="mini" icon="el-icon-edit" @click="onEdit(scope.row)">编辑</el-button>
                        <el-button v-permission="['system:dept:delete']" type="text" size="mini" icon="el-icon-delete" class="danger-text"
                            @click="onDeleteRow(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog title="编辑/新增部门" :visible.sync="DialogVisible" width="500px" append-to-body>
            <el-form :model="saveModel" :rules="rules" label-width="80px" ref="saveForm">
                <el-form-item label="上级名称" prop="pid">
                    <el-input v-model="saveModel.parentName" placeholder="请选择上级名称" clearable @click.native="SelectTree"
                        readonly></el-input>
                </el-form-item>
                <el-form-item label="部门名称" prop="deptName">
                    <el-input v-model="saveModel.deptName" placeholder="请输入部门名称" clearable></el-input>
                </el-form-item>
                <el-form-item label="部门电话">
                    <el-input v-model="saveModel.phone" placeholder="请输入部门电话" clearable></el-input>
                </el-form-item>
                <el-form-item label="部门地址">
                    <el-input v-model="saveModel.address" placeholder="请输入部门地址" clearable></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">确定</el-button>
                    <el-button @click="DialogVisible = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- 部门树选择弹窗 -->
        <el-dialog title="选择部门" :visible.sync="getDialogVisible" width="500px" append-to-body>
            <el-tree :data="treeModel" :props="{ children: 'children', label: 'deptName' }"
                @node-click="handleNodeClick" default-expand-all highlight-current node-key="id"></el-tree>
            <div style="text-align:right;margin-top:15px;">
                <el-button @click="closeTree">取消</el-button>
                <el-button type="primary" @click="confirmSelect">确定选择</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import dept from '@/api/dept'
export default {
    name: 'DeptList',
    data() {
        return {
            getDialogVisible: false,
            treeModel: [],
            // 存储当前选中的树节点
            selectedNode: null,
            saveModel: {
                deptName: '',
                pid: '',
                parentName: '',
                phone: '',
                address: ''
            },
            deptModel: {
                deptName: '',
            },
            deptList: [],
            DialogVisible: false,
            rules: {
                deptName: [
                    { required: true, message: '请选择部门名称', trigger: 'blur' }
                ],
                pid: [
                    { required: true, message: '请选择上级部门', trigger: 'blur' }
                ]
            },
            dialogStatus: 'add'
        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        // 打开部门树选择
        SelectTree() {
            this.getDialogVisible = true
            this.selectedNode = null
            // 获取部门树数据
            dept.getTree().then(res => {
                if (res.code === 200) {
                    this.treeModel = res.data
                }
            }).catch(() => {
                this.$message.error('获取部门树失败')
            })
        },

        // 关闭树弹窗
        closeTree() {
            this.getDialogVisible = false
            this.treeModel = []
        },

        // 树节点点击
        handleNodeClick(data) {
            this.selectedNode = data
        },

        // 确认选择部门
        confirmSelect() {
            if (!this.selectedNode) {
                this.$message.warning('请选择一个部门')
                return
            }
            // 回填数据
            this.saveModel.pid = this.selectedNode.id
            this.saveModel.parentName = this.selectedNode.deptName || '无'
            // 关闭弹窗
            this.getDialogVisible = false
            this.$refs.saveForm.clearValidate('pid')

        },

        // 提交保存
        handleSubmit() {
            this.$refs.saveForm.validate((valid) => {
                if (!valid) return

                if (this.dialogStatus === 'add') {
                    dept.add(this.saveModel).then(res => {
                        if (res.code === 200) {
                            this.$message.success('添加成功')
                            this.DialogVisible = false
                            this.fetchData()
                        }
                    })
                } else {
                    dept.update(this.saveModel).then(res => {
                        if (res.code === 200) {
                            this.$message.success('修改成功')
                            this.DialogVisible = false
                            this.fetchData()
                        }
                    })
                }
            })
        },

        // 获取列表数据
        async fetchData() {
            try {
                const res = await dept.search(this.deptModel)
                if (res.code === 200) {
                    this.deptList = res.data || []
                }
            } catch (error) {
                this.$message.error('获取数据失败')
            }
        },

        onSubmit() {
            this.fetchData()
        },

        // 新增
        onAdd() {
            this.dialogStatus = 'add'
            this.saveModel = {
                deptName: '',
                pid: '',
                parentName: '',
                phone: '',
                address: ''
            }
            this.DialogVisible = true
        },

        // 重置
        onReform() {
            this.deptModel = { deptName: '' }
            this.fetchData()
        },

        // 编辑
        onEdit(row) {
            this.dialogStatus = 'edit'
            this.saveModel = { ...row }
            this.DialogVisible = true
        },

        // 删除
        
        onDeleteRow(row) {
            this.$confirm(`确认删除部门 "${row.deptName}" 吗?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                dept.hasChild(row).then(async res => { 
                    if (res.data === "T") {
                        this.$message.error('无法删除，存在子部门')
                        return 
                    }else if (res.data === "F") {
                        dept.delete(row.id).then(res => {
                            if (res.code === 200) {
                                this.$message.success('删除成功')
                                this.fetchData()
                            }
                        })
                    }
                })
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        }
    }
}
</script>

<style scoped lang="scss">
.rental-list {
    padding: 20px;
    background-color: #f0f2f5;
    min-height: calc(100vh - 84px);

    .search-card {
        margin-bottom: 20px;

        ::v-deep .el-card__body {
            padding: 18px 20px;
        }
    }

    .table-card {
        ::v-deep .el-card__body {
            padding: 20px;
        }
    }

    .danger-text {
        color: #f56c6c;

        &:hover {
            color: #ff4949;
        }
    }

    ::v-deep .el-table {

        th,
        td {
            padding: 12px 0;
        }
    }
}
</style>