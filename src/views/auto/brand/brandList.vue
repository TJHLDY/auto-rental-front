<template>
    <div class="app-container">
        <el-card class="box-card">
            <el-form :inline="true" :model="brandModel" class="demo-form-inline">
                <el-form-item label="汽车厂商">
                    <el-select v-model="brandModel.mid" placeholder="厂商名称" filterable @change="afterSelected">
                        <el-option v-for="item in makerList" :key="item.id" :label="item.name" :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="汽车品牌">
                    <el-input v-model="brandModel.brandName" placeholder="品牌名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" icon="el-icon-search" @click="onSubmit">查询</el-button>
                    <el-button type="info" icon="el-icon-refresh" @click="resetForm">重置</el-button>
                    <el-button v-permission="['auto:brand:brandAdd']" type="primary" icon="el-icon-plus" @click="onAdd">新增</el-button>
                    <el-button v-permission="['auto:brand:brandDelete']" type="danger" icon="el-icon-delete" @click="onDelete">删除选中</el-button>
                </el-form-item>
            </el-form>
        </el-card>
        <el-card class="table-card">
            <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="序号" width="80" class-name="id-header" type="index"></el-table-column>
                <el-table-column prop="makerName" label="厂商名称" class-name="name-header"></el-table-column>
                <el-table-column prop="brandName" label="品牌名称" class-name="name-header"></el-table-column>
                <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button v-permission="['auto:brand:brandUpdate']" size="mini" @click="onEdit(scope.row)">编辑</el-button>
                        <el-button v-permission="['auto:brand:brandDelete']" size="mini" type="danger" @click="onDeleteRow(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination class="pagination" :current-page="currentPage" :page-size="pageSize" :total="total"
                @current-change="handlePageChange">
            </el-pagination>
        </el-card>

        <!-- 弹窗：添加校验规则 -->
        <el-dialog :visible.sync="dialogFormVisible" title="汽车品牌">
            <!-- 1. 添加 ref 和 rules -->
            <el-form ref="dialogFormRef" :model="dialogForm" :rules="rules" label-width="80px">
                <el-form-item label="汽车厂商" prop="mid"> <!-- 2. 添加 prop -->
                    <el-select v-model="dialogForm.mid" placeholder="请选择/输入搜索厂商" filterable clearable>
                        <el-option v-for="item in makerList" :key="item.id" :label="item.name"
                            :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="汽车品牌" prop="brandName"> <!-- 2. 添加 prop -->
                    <el-input v-model="dialogForm.brandName" placeholder="请输入品牌名称" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import makerApi from '@/api/maker'
import brandApi from '@/api/brand'
export default {
    data() {
        return {
            // 顶部查询专用对象
            brandModel: {
                pageNum: 1,
                pageSize: 10,
                mid: null,
                brandName: ''
            },
            // 弹窗独立表单对象
            dialogForm: {
                id: null,
                mid: null,
                brandName: ''
            },
            // ✅ 表单校验规则（核心）
            rules: {
                // 厂商必选
                mid: [
                    { required: true, message: '请选择汽车厂商', trigger: 'change' }
                ],
                // 品牌名称必填
                brandName: [
                    { required: true, message: '请输入汽车品牌名称', trigger: 'blur' }
                ]
            },
            makerList: [],
            tableData: [],
            total: 0,
            currentPage: 1,
            pageSize: 10,
            selectedRows: [],
            dialogStatus: '',
            dialogFormVisible: false
        }
    },
    created() {
        this.fetchMakerData()
        this.fetchBrandData()
    },
    methods: {
        // 获取品牌列表
        async fetchBrandData() {
            this.brandModel.pageNum = this.currentPage
            this.brandModel.pageSize = this.pageSize
            const res = await brandApi.search(this.brandModel)
            this.tableData = res.data.records || []
            this.total = res.data.total || 0
        },
        // 获取厂商列表
        async fetchMakerData() {
            const res = await makerApi.getAllList()
            this.makerList = res.data
        },
        // 查询
        onSubmit() {
            this.currentPage = 1
            this.fetchBrandData()
        },
        // 重置
        resetForm() {
            this.brandModel = {
                pageNum: 1,
                pageSize: 10,
                mid: null,
                brandName: ''
            }
            this.fetchBrandData()
        },
        // 分页
        handlePageChange(val) {
            this.currentPage = val
            this.fetchBrandData()
        },
        // 多选
        handleSelectionChange(val) {
            this.selectedRows = val
        },
        // 打开新增弹窗
        onAdd() {
            this.dialogStatus = 'add'
            this.dialogForm = { id: null, mid: null, brandName: '' }
            this.dialogFormVisible = true
        },
        // 批量删除
        onDelete() {
            if (this.selectedRows.length === 0) {
                this.$message.warning('请选择要删除的数据')
                return
            }
            this.$confirm(`确认删除选中的 ${this.selectedRows.length} 条数据吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const ids = this.selectedRows.map(item => item.id)
                const res = await brandApi.batchDelete(ids)
                if (res.code === 200) {
                    this.$message.success('删除成功')
                    this.fetchBrandData()
                }
            }).catch(() => { })
        },
        // 编辑
        onEdit(row) {
            this.dialogStatus = 'edit'
            this.dialogForm = {
                id: row.id,
                mid: row.mid,
                brandName: row.brandName
            }
            this.dialogFormVisible = true
        },
        // 单行删除
        onDeleteRow(row) {
            this.$confirm('是否确认删除？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await brandApi.delete(row.id)
                if (res.code === 200) {
                    this.fetchBrandData()
                    this.$message.success('删除成功!')
                }
            }).catch(() => {
                this.$message.info('已取消删除')
            })
        },
        // 厂商切换查询
        afterSelected() {
            this.fetchBrandData()
        },
        // ✅ 弹窗提交（自动校验，替换手动判断）
        async submitForm() {
            // 调用 ElementUI 官方校验
            const isValid = await this.$refs.dialogFormRef.validate()
            if (!isValid) return

            try {
                if (this.dialogStatus === 'edit') {
                    await brandApi.update(this.dialogForm)
                    this.$message.success('更新成功')
                } else {
                    await brandApi.add(this.dialogForm)
                    this.$message.success('保存成功')
                }
                this.dialogFormVisible = false
                this.fetchBrandData()
            } catch (error) {
                this.$message.error('操作失败')
            }
        }
    }
}
</script>

<style></style>