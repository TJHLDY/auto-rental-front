<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form :inline="true" :model="queryModel" class="demo-form-inline">
        <el-form-item label="客户姓名">
          <el-input v-model="queryModel.name" placeholder="客户姓名" />
        </el-form-item>
        <el-form-item label="客户状态">
          <el-select v-model="queryModel.status" placeholder="客户状态" clearable>
            <el-option label="白名单" :value="true" />
            <el-option label="黑名单" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="success" icon="el-icon-search" @click="onSearch">查询</el-button>
          <el-button type="info" icon="el-icon-refresh" @click="onReset">重置</el-button>
          <el-button v-permission="['busi:customer:customerAdd']" type="primary" icon="el-icon-plus" @click="onAdd">新增</el-button>
          <el-button v-permission="['busi:customer:customerDelete']" type="danger" icon="el-icon-delete" @click="onBatchDelete">删除选中</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="80" type="index" />
        <el-table-column prop="name" label="客户姓名" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="tel" label="手机号" />
        <el-table-column label="出生日期" width="120">
          <template slot-scope="scope">{{ scope.row.birthday }}</template>
        </el-table-column>
        <el-table-column prop="idNum" label="身份证号" />
        <el-table-column label="客户状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'" size="small">
              {{ scope.row.status ? '白名单' : '黑名单' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button v-permission="['busi:customer:customerUpdate']" size="mini" @click="onEdit(scope.row)">编辑</el-button>
            <el-button v-permission="['busi:customer:customerDelete']" size="mini" type="danger" @click="onDeleteRow(scope.row)">删除</el-button>
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

    <el-dialog :visible.sync="dialogVisible" title="客户信息">
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="rules" label-width="80px">
        <el-form-item label="客户姓名" prop="name">
          <el-input v-model="dialogForm.name" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="dialogForm.age" :min="0" :max="200" placeholder="请输入年龄" />
        </el-form-item>
        <el-form-item label="手机号" prop="tel">
          <el-input v-model="dialogForm.tel" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="出生日期" prop="birthday">
          <el-date-picker v-model="dialogForm.birthday" type="date" placeholder="请选择出生日期" value-format="yyyy-MM-dd" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idNum">
          <el-input v-model="dialogForm.idNum" placeholder="请输入身份证号" />
        </el-form-item>
        <el-form-item label="客户状态" prop="status">
          <el-switch v-model="dialogForm.status" active-text="白名单" inactive-text="黑名单" />
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
import customerApi from '@/api/customer'

export default {
  data() {
    return {
      queryModel: {
        pageNum: 1,
        pageSize: 10,
        name: '',
        status: null
      },
      dialogForm: {
        id: null,
        name: '',
        age: null,
        tel: '',
        birthday: null,
        idNum: '',
        status: true
      },
      rules: {
        name: [
          { required: true, message: '请输入客户姓名', trigger: 'blur' }
        ],
        tel: [
          { required: true, message: '请输入手机号', trigger: 'blur' }
        ]
      },
      tableData: [],
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
  },
  methods: {
    async fetchData() {
      this.queryModel.pageNum = this.currentPage
      this.queryModel.pageSize = this.pageSize
      const res = await customerApi.search(this.queryModel)
      this.tableData = res.data.records || []
      this.total = res.data.total || 0
    },
    onSearch() {
      this.currentPage = 1
      this.fetchData()
    },
    onReset() {
      this.queryModel = { pageNum: 1, pageSize: 10, name: '', status: null }
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
      this.dialogForm = { id: null, name: '', age: null, tel: '', birthday: null, idNum: '', status: true }
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
        const res = await customerApi.batchDelete(ids)
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
        name: row.name,
        age: row.age,
        tel: row.tel,
        birthday: row.birthday,
        idNum: row.idNum,
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
        const res = await customerApi.delete(row.id)
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
          await customerApi.update(this.dialogForm)
          this.$message.success('更新成功')
        } else {
          await customerApi.add(this.dialogForm)
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
