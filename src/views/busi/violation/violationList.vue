<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form :inline="true" :model="queryModel" class="demo-form-inline">
        <el-form-item label="车牌号">
          <el-input v-model="queryModel.autoNum" placeholder="车牌号" />
        </el-form-item>
<el-form-item label="处理状态">
          <el-select v-model="queryModel.status" placeholder="处理状态" clearable>
            <el-option label="未处理" :value="false" />
            <el-option label="已处理" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item label="违章时间">
          <el-date-picker
            v-model="queryModel.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-ddTHH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="success" icon="el-icon-search" @click="onSearch">查询</el-button>
          <el-button type="info" icon="el-icon-refresh" @click="onReset">重置</el-button>
          <el-button v-permission="['busi:violation:violationAdd']" type="primary" icon="el-icon-plus" @click="onAdd">新增</el-button>
          <el-button v-permission="['busi:violation:violationDelete']" type="danger" icon="el-icon-delete" @click="onBatchDelete">删除选中</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column prop="autoNum" label="车牌号" />
        <el-table-column label="违章时间" width="160">
          <template slot-scope="scope">{{ scope.row.violationTime }}</template>
        </el-table-column>
        <el-table-column prop="reason" label="违章事由" />
        <el-table-column prop="location" label="违章地点" />
        <el-table-column prop="deductPoints" label="扣分" width="80" />
        <el-table-column prop="fine" label="罚款(元)" width="100" />
        <el-table-column label="处理状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status ? 'success' : 'warning'" size="small">
              {{ scope.row.status ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button v-permission="['busi:violation:violationUpdate']" size="mini" @click="onEdit(scope.row)">编辑</el-button>
            <el-button v-permission="['busi:violation:violationDelete']" size="mini" type="danger" @click="onDeleteRow(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </el-card>

    <el-dialog :visible.sync="dialogVisible" title="违章信息">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="rules" label-width="80px">
        <el-form-item label="车牌号" prop="autoId">
          <el-select v-model="dialogForm.autoId" placeholder="请选择车牌号" filterable clearable>
            <el-option v-for="car in carList" :key="car.id" :label="car.autoNum" :value="car.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="违章时间" prop="violationTime">
          <el-date-picker
            v-model="dialogForm.violationTime"
            type="datetime"
            value-format="yyyy-MM-ddTHH:mm:ss"
            placeholder="请选择违章时间"
          />
        </el-form-item>
        <el-form-item label="违章事由" prop="reason">
          <el-input v-model="dialogForm.reason" placeholder="请输入违章事由" />
        </el-form-item>
        <el-form-item label="违章地点" prop="location">
          <el-input v-model="dialogForm.location" placeholder="请输入违章地点" />
        </el-form-item>
        <el-form-item label="扣分" prop="deductPoints">
          <el-input-number v-model="dialogForm.deductPoints" :min="0" :max="12" placeholder="扣分" />
        </el-form-item>
        <el-form-item label="罚款" prop="fine">
          <el-input-number v-model="dialogForm.fine" :min="0" :step="50" placeholder="罚款金额" />
        </el-form-item>
        <el-form-item label="处理状态" prop="status">
          <el-switch v-model="dialogForm.status" active-text="已处理" inactive-text="未处理" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import violationApi from '@/api/violation'
import infoApi from '@/api/info'

export default {
  data() {
    return {
      queryModel: {
        pageNum: 1,
        pageSize: 10,
        autoNum: '',
        status: null,
        dateRange: null
      },
      dialogForm: {
        id: null,
        autoId: null,
        violationTime: null,
        reason: '',
        location: '',
        deductPoints: null,
        fine: null,
        status: false
      },
      rules: {
        autoId: [
          { required: true, message: '请选择车牌号', trigger: 'change' }
        ],
        violationTime: [
          { required: true, message: '请选择违章时间', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请输入违章事由', trigger: 'blur' }
        ],
        location: [
          { required: true, message: '请输入违章地点', trigger: 'blur' }
        ]
      },
      tableData: [],
      carList: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      selectedRows: [],
      dialogStatus: '',
      dialogVisible: false
    }
  },
  created() {
    this.fetchData()
    this.fetchCarList()
  },
  methods: {
    async fetchData() {
      this.queryModel.pageNum = this.currentPage
      this.queryModel.pageSize = this.pageSize
      const params = { ...this.queryModel }
      if (params.dateRange && params.dateRange.length === 2) {
        params.startDate = params.dateRange[0]
        params.endDate = params.dateRange[1]
      }
      delete params.dateRange
      const res = await violationApi.search(params)
      this.tableData = res.data.records || []
      this.total = res.data.total || 0
    },
    async fetchCarList() {
      const res = await infoApi.search(1, 9999, {})
      this.carList = res.data.records || []
    },
    onSearch() {
      this.currentPage = 1
      this.fetchData()
    },
    onReset() {
      this.queryModel = { pageNum: 1, pageSize: 10, autoNum: '', status: null, dateRange: null }
      this.fetchData()
    },
    handlePageChange(val) {
      this.currentPage = val
      this.fetchData()
    },
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    onAdd() {
      this.dialogStatus = 'add'
      this.dialogForm = { id: null, autoId: null, violationTime: null, reason: '', location: '', deductPoints: null, fine: null, status: false }
      this.dialogVisible = true
    },
    onBatchDelete() {
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
        const res = await violationApi.batchDelete(ids)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.fetchData()
        }
      }).catch(() => {})
    },
    onEdit(row) {
      this.dialogStatus = 'edit'
      this.dialogForm = {
        id: row.id,
        autoId: row.autoId,
        violationTime: row.violationTime,
        reason: row.reason,
        location: row.location,
        deductPoints: row.deductPoints,
        fine: row.fine,
        status: row.status
      }
      this.dialogVisible = true
    },
    onDeleteRow(row) {
      this.$confirm('是否确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await violationApi.delete(row.id)
        if (res.code === 200) {
          this.fetchData()
          this.$message.success('删除成功')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    async submitForm() {
      const isValid = await this.$refs.dialogFormRef.validate()
      if (!isValid) return

      try {
        if (this.dialogStatus === 'edit') {
          await violationApi.update(this.dialogForm)
          this.$message.success('更新成功')
        } else {
          await violationApi.add(this.dialogForm)
          this.$message.success('保存成功')
        }
        this.dialogVisible = false
        this.fetchData()
      } catch (error) {
        this.$message.error('操作失败')
      }
    }
  }
}
</script>

<style></style>
