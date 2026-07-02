<template>
    <div class="app-container">
        <el-card class="search-card">
            <el-form :inline="true" :model="makerModel" class="demo-form-inline">
                <!-- 给表单项标签加自定义 class -->
                <el-form-item label="汽车厂商" label-class-name="black-label">
                    <el-input v-model="makerModel.name" placeholder="汽车厂商名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" icon="el-icon-search" @click="onSubmit">查询</el-button>
                    <el-button type="info" icon="el-icon-refresh" @click="resetForm">重置</el-button>
                    <el-button v-permission="['auto:maker:makerAdd']" type="primary" icon="el-icon-plus" @click="onAdd">新增</el-button>
                    <el-button v-permission="['auto:maker:makerDelete']" type="danger" icon="el-icon-delete" @click="onDelete">删除选中</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="table-card">
            <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column label="序号" width="80" class-name="id-header" type="index"></el-table-column>
                <el-table-column prop="name" label="厂商名称" class-name="name-header"></el-table-column>
                <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button v-permission="['auto:maker:makerUpdate']" size="mini" @click="onEdit(scope.row)">编辑</el-button>
                        <el-button v-permission="['auto:maker:makerDelete']" size="mini" type="danger" @click="onDeleteRow(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination class="pagination" :current-page="currentPage" :page-size="pageSize" :total="total"
                @current-change="handlePageChange">
            </el-pagination>
        </el-card>

        <el-dialog :visible.sync="dialogFormVisible">
            <el-form :model="saveModel" ref="form" :rules="rules">
                <el-form-item label="汽车厂商名称" prop="name">
                    <el-input v-model="saveModel.name" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import makerApi from '@/api/maker'
export default {
    data() {
        return {
            makerModel: {
                name: ''
            },
            tableData: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            selectedRows: [],
            dialogFormVisible: false,
            saveModel: {},
            dialogStatus: '',
            rules: {
                name: [
                    { required: true, message: '请输入汽车厂商名称', trigger: 'blur' },
                    //{ min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
                ],
            }
        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        async fetchData() {
            const params = {
                pageNum: this.currentPage,
                pageSize: this.pageSize,
                name: this.makerModel.name
            }
            const res = await makerApi.search(params)
            if (res.code === 200) {
                this.tableData = res.data.records
                this.total = res.data.total
            }
        },
        onSubmit() {
            this.fetchData()
        },
        onAdd() {
            this.dialogStatus = 'create'
            this.saveModel = {}
            this.dialogFormVisible = true
        },
        onEdit(row) {
            this.dialogStatus = 'update'
            this.saveModel = { ...row }
            this.dialogFormVisible = true
        },
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
                const ids = this.selectedRows.map(item => item.id)  // 提取 ID 数组
                const res = await makerApi.batchDelete(ids)  // ✅ 直接传数组，不包装
                if (res.code === 200) {
                    this.$message.success('删除成功')
                    this.fetchData()
                }
            }).catch(() => { })
        },
        onDeleteRow(row) {
            this.$confirm(`确认删除厂商 "${row.name}" 吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                const res = await makerApi.delete(row.id)

                if (res.code === 200) {
                    this.$message.success('删除成功')
                    this.fetchData()
                }
            }).catch(() => { })
        },
        resetForm() {
            this.makerModel.name = ''
            this.fetchData()
        },
        handleSelectionChange(val) {
            this.selectedRows = val
        },
        handlePageChange(page) {
            this.currentPage = page
            this.fetchData()
        },
        createData() {
            makerApi.add(this.saveModel).then(res => {
                if (res.code === 200) {
                    this.$message.success('创建成功')
                    this.dialogFormVisible = false
                    this.fetchData()
                }
            })
        },
        updateData() {
            makerApi.update(this.saveModel).then(res => {
                if (res.code === 200) {
                    this.$message.success('更新成功')
                    this.dialogFormVisible = false
                    this.fetchData()
                }
            })
        }
    }
}
</script>

<style scoped>
/* 整体容器 */
.app-container {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    background-color: #f0f2f5;
    min-height: 100vh;
}

/* 搜索卡片 */
.search-card {
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

/* 表格卡片 */
.table-card {
    min-height: 400px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    background: #fff;
}

/* ========== 表格样式优化 ========== */

/* 表格整体 */
::v-deep .el-table {
    border-radius: 4px;
    overflow: hidden;
    font-size: 14px;
}

/* 统一表头样式 - 关键修复 */
::v-deep .el-table th.el-table__cell {
    background: #f5f7fa !important;
    color: #303133;
    font-weight: 600;
    font-size: 14px;
    border-bottom: 1px solid #ebeef5;
    padding: 12px 0;
}

/* 表头单元格内容 */
::v-deep .el-table th .cell {
    color: #303133;
    font-weight: 600;
}

/* 特殊列表头样式（ID、厂商名称）*/
::v-deep .el-table th.id-header,
::v-deep .el-table th.name-header {
    background: #f5f7fa !important;
}

::v-deep .el-table th.id-header .cell,
::v-deep .el-table th.name-header .cell {
    color: #303133;
    font-weight: 600;
    font-size: 14px;
}

/* 表格数据行 */
::v-deep .el-table td.el-table__cell {
    padding: 12px 0;
    border-bottom: 1px solid #ebeef5;
    color: #606266;
}

/* 表格数据：ID 列 */
::v-deep .el-table td.id-header .cell {
    font-weight: 600;
    color: #409EFF;
}

/* 表格数据：厂商名称 列 */
::v-deep .el-table td.name-header .cell {
    font-weight: 500;
    color: #303133;
}

/* 行悬停效果 */
::v-deep .el-table--enable-row-hover .el-table__body tr:hover>td {
    background-color: #f5f7fa !important;
}

/* 表格斑马纹（可选）*/
::v-deep .el-table--striped .el-table__body tr.el-table__row--striped td {
    background: #fafafa;
}

/* ========== 分页样式 - 左边对齐版 ========== */

.pagination {
    margin-top: 24px;
    padding: 24px 20px;
    background: linear-gradient(to right, #ffffff, #f8f9fa);
    border-radius: 8px;
    border-top: 1px solid #e8ecef;
}

/* 分页整体布局 - 修改 justify-content 为 flex-start */
::v-deep .el-pagination {
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    /* 改为左边对齐 */
    gap: 12px;
    flex-wrap: wrap;
}

/* 分页总数统计 - 徽章样式 */
::v-deep .el-pagination .el-pagination__total {
    color: #606266;
    font-size: 13px;
    font-weight: 500;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 6px 14px;
    border-radius: 20px;
    height: auto;
    line-height: 1.5;
    display: inline-flex;
    align-items: center;
    margin-right: 8px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* 每页条数选择器 */
::v-deep .el-pagination .el-select {
    margin: 0;
}

::v-deep .el-pagination .el-select .el-input__inner {
    border-radius: 6px;
    height: 38px;
    line-height: 38px;
    border: 1px solid #e4e7ed;
    background: #fff;
    padding: 0 14px;
    font-size: 13px;
    color: #303133;
    transition: all 0.3s ease;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

::v-deep .el-pagination .el-select .el-input__inner:hover {
    border-color: #409EFF;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

/* 分页导航按钮 - 上一页/下一页 */
::v-deep .el-pagination .btn-prev,
::v-deep .el-pagination .btn-next {
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ebef 100%);
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    color: #606266;
    min-width: 38px;
    height: 38px;
    line-height: 38px;
    font-size: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    font-weight: 600;
}

::v-deep .el-pagination .btn-prev:hover,
::v-deep .el-pagination .btn-next:hover {
    background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
    border-color: #409EFF;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

::v-deep .el-pagination .btn-prev:disabled,
::v-deep .el-pagination .btn-next:disabled {
    background: #f5f7fa;
    color: #c0c4cc;
    border-color: #e4e7ed;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

/* 分页页码数字按钮 */
::v-deep .el-pagination li {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    min-width: 38px;
    height: 38px;
    line-height: 38px;
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    background: #fff;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

::v-deep .el-pagination li:hover {
    color: #409EFF;
    border-color: #409EFF;
    background: #ecf5ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(64, 158, 255, 0.25);
}

/* 当前激活页码 - 渐变背景 */
::v-deep .el-pagination li.active {
    background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%) !important;
    border-color: #409EFF !important;
    color: #fff !important;
    font-weight: 600;
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(64, 158, 255, 0.45);
}

/* 分页省略号 */
::v-deep .el-pagination li.more {
    border: none;
    background: transparent;
    box-shadow: none;
    color: #909399;
    font-weight: 600;
    letter-spacing: 2px;
}

::v-deep .el-pagination li.more::before {
    color: #909399;
}

/* 分页跳转区域 */
::v-deep .el-pagination .el-pagination__jump {
    color: #606266;
    font-size: 13px;
    margin-left: 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #f8f9fa;
    padding: 4px 12px;
    border-radius: 6px;
    height: 38px;
}

::v-deep .el-pagination .el-pagination__jump .el-input__inner {
    border-radius: 6px;
    height: 30px;
    line-height: 30px;
    border: 1px solid #dcdfe6;
    padding: 0 10px;
    text-align: center;
    font-size: 13px;
    font-weight: 500;
    background: #fff;
    transition: all 0.3s ease;
    width: 50px;
}

::v-deep .el-pagination .el-pagination__jump .el-input__inner:hover {
    border-color: #409EFF;
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.15);
}

::v-deep .el-pagination .el-pagination__jump .el-input__inner:focus {
    border-color: #409EFF;
    outline: none;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
}
</style>