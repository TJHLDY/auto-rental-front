<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form :inline="true" :model="queryModel" class="demo-form-inline">
        <el-form-item label="订单编号">
          <el-input v-model="queryModel.orderNum" placeholder="订单编号" clearable />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input v-model="queryModel.autoNum" placeholder="车牌号" clearable />
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="queryModel.customerName" placeholder="客户姓名" clearable />
        </el-form-item>
        <el-form-item label="出租日期">
          <el-date-picker
            v-model="queryModel.startDate"
            type="datetime"
            placeholder="开始日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 180px"
          />
          <span style="margin: 0 8px">至</span>
          <el-date-picker
            v-model="queryModel.endDate"
            type="datetime"
            placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="success" icon="el-icon-search" @click="onSearch">查询</el-button>
          <el-button type="info" icon="el-icon-refresh" @click="onReset">重置</el-button>
          <el-button v-permission="['busi:order:orderRental']" type="primary" icon="el-icon-plus" @click="onRental">车辆出租</el-button>
          <el-button v-permission="['busi:order:orderDelete']" type="danger" icon="el-icon-delete" @click="onBatchDelete">删除选中</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="60" type="index" />
        <el-table-column prop="orderNum" label="订单编号" width="180" />
        <el-table-column prop="autoNum" label="车牌号" width="120" />
        <el-table-column prop="customerName" label="客户姓名" width="100" />
        <el-table-column prop="typeName" label="出租类型" width="100" />
        <el-table-column label="日租金" width="90">
          <template slot-scope="scope">{{ (scope.row.rent / 100).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="押金" width="90">
          <template slot-scope="scope">{{ (scope.row.deposit / 100).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="mileage" label="起租里程" width="90" />
        <el-table-column prop="rentalTime" label="出租时间" width="160" />
        <el-table-column prop="returnMileage" label="归还里程" width="90" />
        <el-table-column prop="returnTime" label="归还时间" width="160" />
        <el-table-column label="应付租金" width="90">
          <template slot-scope="scope">
            {{ scope.row.rentPayable != null ? (scope.row.rentPayable / 100).toFixed(2) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="实付租金" width="90">
          <template slot-scope="scope">
            {{ scope.row.rentActual != null ? (scope.row.rentActual / 100).toFixed(2) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="已扣押金" width="90">
          <template slot-scope="scope">
            {{ scope.row.deductedDeposit != null ? (scope.row.deductedDeposit / 100).toFixed(2) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="押金返还" width="90">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.returnTime == null" type="info" size="small">未归还</el-tag>
            <el-tag v-else-if="scope.row.depositReturn" type="success" size="small">已返还</el-tag>
            <el-tag v-else type="danger" size="small">未返还</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.returnTime == null"
              v-permission="['busi:order:orderReturn']"
              size="mini"
              type="success"
              @click="onReturn(scope.row)"
            >归还</el-button>
            <el-button
              v-permission="['busi:order:orderDelete']"
              size="mini"
              type="danger"
              @click="onDeleteRow(scope.row)"
            >删除</el-button>
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

    <!-- 出租对话框 -->
    <el-dialog :visible.sync="rentalDialogVisible" title="车辆出租" width="500px">
      <el-form ref="rentalFormRef" :model="rentalForm" :rules="rentalRules" label-width="80px">
        <el-form-item label="选择车辆" prop="autoId">
          <el-select v-model="rentalForm.autoId" placeholder="请选择车辆" filterable style="width: 100%">
            <el-option
              v-for="car in carOptions"
              :key="car.id"
              :label="car.autoNum + ' | ' + car.brandName + ' | 日租' + (car.rent / 100).toFixed(2) + '元'"
              :value="car.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择客户" prop="customerId">
          <el-select v-model="rentalForm.customerId" placeholder="请选择客户" filterable style="width: 100%">
            <el-option
              v-for="c in customerOptions"
              :key="c.id"
              :label="c.name + ' | ' + c.tel"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出租类型" prop="typeId">
          <el-select v-model="rentalForm.typeId" placeholder="请选择出租类型" style="width: 100%">
            <el-option
              v-for="t in typeOptions"
              :key="t.id"
              :label="t.typeName + ' (折扣' + (t.typeDiscount * 100).toFixed(0) + '%)'"
              :value="t.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rentalDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRental">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 归还对话框 -->
    <el-dialog :visible.sync="returnDialogVisible" title="车辆归还" width="500px">
      <el-form ref="returnFormRef" :model="returnForm" :rules="returnRules" label-width="100px">
        <el-form-item label="订单编号">
          <el-input :value="returnForm.orderNum" disabled />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input :value="returnForm.autoNum" disabled />
        </el-form-item>
        <el-form-item label="客户">
          <el-input :value="returnForm.customerName" disabled />
        </el-form-item>
        <el-form-item label="起租里程">
          <el-input :value="returnForm.mileage" disabled />
        </el-form-item>
        <el-form-item label="日租金">
          <el-input :value="(returnForm.rent / 100).toFixed(2) + ' 元'" disabled />
        </el-form-item>
        <el-form-item label="押金">
          <el-input :value="(returnForm.deposit / 100).toFixed(2) + ' 元'" disabled />
        </el-form-item>
        <el-form-item label="归还里程" prop="returnMileage">
          <el-input-number v-model="returnForm.returnMileage" :min="0" placeholder="请输入归还里程" style="width: 100%" />
        </el-form-item>
        <el-form-item label="实付租金">
          <el-input v-model="returnForm.rentActual" placeholder="留空则自动计算" style="width: 100%" />
        </el-form-item>
        <el-form-item label="押金抵扣">
          <el-input :value="deductPreview" disabled>
            <i slot="suffix" style="font-style:normal;line-height:40px;">元</i>
          </el-input>
        </el-form-item>
        <el-form-item label="应补/应退">
          <el-input :value="netPayablePreview" disabled>
            <i slot="suffix" style="font-style:normal;line-height:40px;">元</i>
          </el-input>
        </el-form-item>
        <el-form-item label="押金返还">
          <el-switch v-model="returnForm.depositReturn" active-text="已返还" inactive-text="未返还" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="returnDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitReturn">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import rentalApi from '@/api/rental'
import infoApi from '@/api/info'
import customerApi from '@/api/customer'
import rentalTypeApi from '@/api/rentalType'
import violationApi from '@/api/violation'

export default {
  data() {
    return {
      queryModel: {
        orderNum: '',
        autoNum: '',
        customerName: '',
        startDate: null,
        endDate: null
      },
      rentalForm: {
        autoId: null,
        customerId: null,
        typeId: null
      },
      rentalRules: {
        autoId: [{ required: true, message: '请选择车辆', trigger: 'change' }],
        customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
        typeId: [{ required: true, message: '请选择出租类型', trigger: 'change' }]
      },
      returnForm: {
        id: null,
        orderNum: '',
        autoNum: '',
        customerName: '',
        mileage: null,
        rent: 0,
        deposit: 0,
        returnMileage: null,
        rentActual: null,
        depositReturn: true
      },
      returnRules: {
        returnMileage: [{ required: true, message: '请输入归还里程', trigger: 'blur' }]
      },
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,
      selectedRows: [],
      rentalDialogVisible: false,
      returnDialogVisible: false,
      carOptions: [],
      customerOptions: [],
      typeOptions: []
    }
  },
  computed: {
    deductPreview() {
      const deposit = Number(this.returnForm.deposit) || 0
      const rentActual = Number(this.returnForm.rentActual) || 0
      const deducted = Math.min(deposit, rentActual)
      return (deducted / 100).toFixed(2)
    },
    netPayablePreview() {
      const deposit = Number(this.returnForm.deposit) || 0
      const rentActual = Number(this.returnForm.rentActual) || 0
      const deducted = Math.min(deposit, rentActual)
      const net = rentActual - deducted
      if (net > 0) return '补交 ' + (net / 100).toFixed(2)
      if (net < 0) return '退还 ' + (-net / 100).toFixed(2)
      return '结清 0.00'
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      const res = await rentalApi.search(this.currentPage, this.pageSize, this.queryModel)
      this.tableData = res.data.records || []
      this.total = res.data.total || 0
    },
    onSearch() {
      this.currentPage = 1
      this.fetchData()
    },
    onReset() {
      this.queryModel = {
        orderNum: '',
        autoNum: '',
        customerName: '',
        startDate: null,
        endDate: null
      }
      this.onSearch()
    },
    handlePageChange(val) {
      this.currentPage = val
      this.fetchData()
    },
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    async loadCarOptions() {
      const res = await infoApi.search(1, 200, { status: 0 })
      this.carOptions = res.data.records || []
    },
    async loadCustomerOptions() {
      const res = await customerApi.search({ pageNum: 1, pageSize: 200, status: true })
      this.customerOptions = res.data.records || []
    },
    async loadTypeOptions() {
      const res = await rentalTypeApi.search({}, 1, 200)
      this.typeOptions = res.data.records || []
    },
    async onRental() {
      this.rentalForm = { autoId: null, customerId: null, typeId: null }
      this.rentalDialogVisible = true
      await Promise.all([this.loadCarOptions(), this.loadCustomerOptions(), this.loadTypeOptions()])
    },
    async onReturn(row) {
      try {
        const violationRes = await violationApi.search({ pageNum: 1, pageSize: 1, autoNum: row.autoNum, status: false })
        if (violationRes.data && violationRes.data.total > 0) {
          try {
            await this.$confirm(
              `该车辆（${row.autoNum}）有 ${violationRes.data.total} 条未处理的违章记录，是否跳转到违章管理页面？`,
              '违章提醒',
              { confirmButtonText: '前往处理', cancelButtonText: '继续归还', type: 'warning' }
            )
            this.$router.push('/violation')
            return
          } catch {
            // 用户选择继续归还
          }
        }
      } catch {
        // 违章查询失败，不影响归还流程
      }
      this.returnForm = {
        id: row.id,
        orderNum: row.orderNum,
        autoNum: row.autoNum,
        customerName: row.customerName,
        mileage: row.mileage,
        rent: row.rent,
        deposit: row.deposit || 0,
        returnMileage: row.returnMileage || null,
        rentActual: row.rentActual || null,
        depositReturn: true
      }
      this.returnDialogVisible = true
    },
    async submitRental() {
      const isValid = await this.$refs.rentalFormRef.validate()
      if (!isValid) return

      try {
        const res = await rentalApi.rental(this.rentalForm)
        if (res.code === 200) {
          this.$message.success('出租成功')
          this.rentalDialogVisible = false
          this.fetchData()
        } else {
          this.$message.error(res.msg || '出租失败')
        }
      } catch (error) {
        this.$message.error('出租失败')
      }
    },
    async submitReturn() {
      const isValid = await this.$refs.returnFormRef.validate()
      if (!isValid) return

      try {
        const res = await rentalApi.returnCar(this.returnForm.id, {
          returnMileage: this.returnForm.returnMileage,
          rentActual: this.returnForm.rentActual ? Number(this.returnForm.rentActual) : null,
          depositReturn: this.returnForm.depositReturn
        })
        if (res.code === 200) {
          this.$message.success('归还成功')
          this.returnDialogVisible = false
          this.fetchData()
        } else {
          this.$message.error(res.msg || '归还失败')
        }
      } catch (error) {
        this.$message.error('归还失败')
      }
    },
    onDeleteRow(row) {
      this.$confirm('是否确认删除该订单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await rentalApi.delete(row.id)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.fetchData()
        } else {
          this.$message.error(res.msg || '删除失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
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
        const res = await rentalApi.batchDelete(ids)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.fetchData()
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.table-card {
  margin-top: 16px;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
