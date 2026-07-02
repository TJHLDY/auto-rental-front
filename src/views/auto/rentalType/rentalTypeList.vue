<template>
  <div class="app-container">
    <!-- 搜索条件和操作按钮 -->
    <div class="filter-container" style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
      <el-input 
        v-model="listQuery.typeName" 
        placeholder="出租类型" 
        style="width: 200px;" 
        class="filter-item" 
        @keyup.enter.native="handleFilter" 
      />
      
      <!-- 用容器包裹文本+输入框，确保整体居中 -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>最低折扣:</span>
        <el-input-number 
          v-model="listQuery.lowDiscount" 
          :min="0" 
          :max="listQuery.highDiscount" 
          :step="0.01" 
          style="width: 120px;" 
        />
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span>最高折扣:</span>
        <el-input-number 
          v-model="listQuery.highDiscount" 
          :min="listQuery.lowDiscount" 
          :max="1" 
          :step="0.01" 
          style="width: 120px;" 
        />
      </div>

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" icon="el-icon-refresh" @click="handleReset">
        重置
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button class="filter-item" type="danger" icon="el-icon-delete" @click="handleDeleteSelected" :disabled="multipleSelection.length===0">
        删除选中
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
      style="width: 100%;"
    >
      <el-table-column type="selection" align="center" width="55" />
      <el-table-column label="序号" type="index" :index="indexMethod" align="center" width="60" />
      <el-table-column label="出租类型" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="折扣" width="100" align="center">
        <template slot-scope="{row}">
          {{ row.typeDiscount }}
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" :before-close="handleClose">
      <!-- 关键：form设置100%宽度，适配dialog内边距 -->
      <el-form 
        ref="dialogForm" 
        :model="dialogForm" 
        :rules="dialogRules" 
        label-width="90px"
        style="width: 100%; padding: 0 10px;"
      >
        <el-form-item label="出租类型" prop="typeName">
          <!-- 给el-input设置100%宽度，和其他控件统一 -->
          <el-input 
            v-model="dialogForm.typeName" 
            placeholder="请输入出租类型" 
            style="width: 100%;" 
          />
        </el-form-item>
        <el-form-item label="折扣" prop="typeDiscount">
          <!-- 保持el-input-number的100%宽度，统一控件宽度 -->
          <el-input-number 
            v-model="dialogForm.typeDiscount" 
            :min="0" 
            :max="1" 
            :step="0.01" 
            style="width: 100%;" 
          />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <!-- 给textarea设置100%宽度，同时固定行数，避免高度影响布局 -->
          <el-input 
            v-model="dialogForm.remark" 
            type="textarea" 
            placeholder="请输入描述" 
            style="width: 100%;" 
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分页组件 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />
  </div>
</template>

<script>
import waves from '@/directive/waves' // 引入水波纹指令
import Pagination from '@/components/Pagination' // 引入分页组件
import rentalTypeAPI from '@/api/rentalType' // 导入API

export default {
  name: 'RentalTypeList',
  components: { Pagination },
  directives: { waves },
  data() {
    // 自定义验证规则
    const validateDiscount = (rule, value, callback) => {
      if (!value && value !== 0) {
        callback(new Error('请输入折扣'))
      } else if (value < 0 || value > 1) {
        callback(new Error('折扣应在0到1之间'))
      } else {
        callback()
      }
    }
    
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        current: 1,
        size: 10,
        typeName: undefined,
        lowDiscount: 0, // 修复：数字 0，替代 undefined
        highDiscount: 1 // 修复：数字 1，替代 undefined
      },
      multipleSelection: [], // 选中的项目
      dialogVisible: false, // 对话框显示状态
      dialogStage: '', // 对话框状态 ('add' 或 'edit')
      dialogForm: { // 对话框表单数据
        id: undefined,
        typeName: '',
        typeDiscount: 0,
        remark: ''
      },
      dialogRules: { // 表单验证规则
        typeName: [
          { required: true, message: '请输入出租类型', trigger: 'blur' }
        ],
        typeDiscount: [
          { required: true, validator: validateDiscount, trigger: 'blur' },
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.dialogStage === 'edit' ? '编辑出租类型' : '新增出租类型'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      
      // 使用API调用
      const params = {
        typeName: this.listQuery.typeName || '',
        lowDiscount: this.listQuery.lowDiscount,
        highDiscount: this.listQuery.highDiscount
      }
      
      // 计算start参数
      const start = (this.listQuery.current - 1) * this.listQuery.size;
      const size = this.listQuery.size;
      
      rentalTypeAPI.search(params, start, size)
        .then(response => {
          // 根据后端实际返回的数据结构进行适配
          this.list = response.data.records || []
          this.total = response.data.total || 0
        })
        .catch(error => {
          console.log('获取数据失败:', error)
          this.$message.error('获取数据失败')
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    handleReset() {
      // 重置所有搜索条件
      this.listQuery.typeName = undefined
      this.listQuery.lowDiscount = 0
      this.listQuery.highDiscount = 1
      this.handleFilter()
    },
    handleCreate() {
      this.dialogStage = 'add'
      // 重置表单数据，确保不与搜索条件混用
      this.resetDialogForm()
      this.dialogVisible = true
    },
    handleUpdate(row) {
      this.dialogStage = 'edit'
      // 将行数据填充到表单，但不影响搜索条件
      this.dialogForm = {
        id: row.id,
        typeName: row.typeName,
        typeDiscount: row.typeDiscount,
        remark: row.remark
      }
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.dialogForm.clearValidate()
    },
    handleSubmit() {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          if (this.dialogStage === 'add') {
            this.createRentalType()
          } else {
            this.updateRentalType()
          }
        } else {
          return false
        }
      })
    },
    createRentalType() {
      rentalTypeAPI.add(this.dialogForm)
        .then(() => {
          this.$message.success('新增成功')
          this.dialogVisible = false
          this.getList()
        })
        .catch(error => {
          console.log('新增失败:', error)
          this.$message.error('新增失败')
        })
    },
    updateRentalType() {
      rentalTypeAPI.update(this.dialogForm)
        .then(() => {
          this.$message.success('更新成功')
          this.dialogVisible = false
          this.getList()
        })
        .catch(error => {
          console.log('更新失败:', error)
          this.$message.error('更新失败')
        })
    },
    resetDialogForm() {
      this.dialogForm = {
        id: undefined,
        typeName: '',
        typeDiscount: 0,
        remark: ''
      }
    },
    handleDelete(row, index) {
      this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        rentalTypeAPI.delete(row.id)
          .then(() => {
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.list.splice(index, 1)
            this.total--
            // 如果当前页数据为空，自动回退到上一页
            if (this.list.length === 0 && this.listQuery.current > 1) {
              this.listQuery.current--
              this.getList()
            }
          })
          .catch(error => {
            console.log('删除失败:', error)
            this.$message.error('删除失败')
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleDeleteSelected() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning('请至少选择一项')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.multipleSelection.length} 条记录吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const ids = this.multipleSelection.map(item => item.id)
        try {
          await rentalTypeAPI.deleteBatch(ids)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          // 重新获取列表
          this.getList()
        } catch (error) {
          console.log('批量删除失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    indexMethod(index) {
      return (this.listQuery.current - 1) * this.listQuery.size + index + 1
    }
  }
}
</script>

<style scoped>
/* 关键：强制label不换行+右对齐，保持垂直基线对齐（需要::v-deep穿透scoped） */
::v-deep .el-form-item__label {
  white-space: nowrap; /* 禁止label文字换行 */
  text-align: right;   /* label文字右对齐，整体更整齐 */
}
.filter-container {
  padding-bottom: 10px;
  flex-wrap: wrap;
}
.app-container {
  padding: 20px;
}
.el-divider--vertical {
  margin: 0 8px;
}
</style>