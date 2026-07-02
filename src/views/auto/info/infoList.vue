<template>
  <div class="app-container">
    <!-- 搜索条件和操作按钮 -->
    <div class="filter-container" style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
      <el-input v-model="listQuery.autoNum" placeholder="车牌号" style="width: 120px;" class="filter-item"
        @keyup.enter.native="handleFilter" />

      <el-input v-model="listQuery.makerName" placeholder="制造商" style="width: 120px;" class="filter-item"
        @keyup.enter.native="handleFilter" @blur="onSearchMakerNameChange" />

      <el-select v-model="listQuery.brandId" placeholder="品牌" style="width: 120px" class="filter-item"
        @change="handleFilter">
        <el-option v-for="brand in brandOptions" :key="brand.id" :label="brand.brandName" :value="brand.id" />
      </el-select>

      <el-select v-model="listQuery.status" placeholder="状态" style="width: 120px" class="filter-item"
        @change="handleFilter">
        <el-option label="全部" value="" />
        <el-option label="未租" value="false" />
        <el-option label="已租" value="true" />
        <el-option label="维保" value="3" />
        <el-option label="自用" value="4" />
      </el-select>

      <el-select v-model="listQuery.infoType" placeholder="信息类型" style="width: 120px" class="filter-item"
        @change="handleFilter">
        <el-option label="全部" value="" />
        <el-option label="燃油车" value="false" />
        <el-option label="电动车" value="true" />
      </el-select>

      <el-input v-model="listQuery.color" placeholder="颜色" style="width: 100px;" class="filter-item"
        @keyup.enter.native="handleFilter" />

      <el-input v-model="listQuery.displacement" placeholder="排量" style="width: 100px;" class="filter-item"
        @keyup.enter.native="handleFilter" />

      <el-date-picker v-model="listQuery.registrationDate" type="date" placeholder="注册日期" format="yyyy-MM-dd"
        value-format="yyyy-MM-dd" class="filter-item" style="width: 150px;" @change="handleFilter" />

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" icon="el-icon-refresh" @click="handleReset">
        重置
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button class="filter-item" type="danger" icon="el-icon-delete" @click="handleDeleteSelected"
        :disabled="multipleSelection.length === 0">
        删除选中
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row
      @selection-change="handleSelectionChange" style="width: 100%;">
      <el-table-column type="selection" align="center" width="55" />
      <el-table-column label="序号" type="index" :index="indexMethod" align="center" width="60" />
      <el-table-column label="车牌号" min-width="120px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.autoNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="制造商" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.makerName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="品牌" min-width="100px">
        <template slot-scope="{row}">
          <span>{{ row.brandName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图片" min-width="100px" align="center">
        <template slot-scope="{row}">
          <el-image 
            v-if="row.pic" 
            style="width: 50px; height: 50px" 
            :src="row.pic" 
            fit="cover"
            :preview-src-list="[row.pic]",
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="80px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="statusMap[row.status]">{{ statusText[row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="信息类型" min-width="100px" align="center">
        <template slot-scope="{row}">
          <span>{{ infoTypeText[row.infoType] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="颜色" min-width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.color }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排量" min-width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.displacement }}{{ row.unit || 'L' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册日期" width="120" align="center">
        <template slot-scope="{row}">
          {{ row.registrationDate | parseTime('{y}-{m}-{d}') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px" :before-close="handleClose">
      <el-form ref="dialogForm" :model="dialogForm" :rules="dialogRules" label-width="100px"
        style="width: 100%; padding: 0 10px;">
        <el-form-item label="车牌号" prop="autoNum">
          <el-input v-model="dialogForm.autoNum" placeholder="请输入车牌号" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="制造商" prop="makerId">
          <el-input v-model="dialogForm.makerName" placeholder="请输入制造商名称" style="width: 100%;"
            @blur="onMakerNameChange" />
        </el-form-item>
        <el-form-item label="品牌" prop="brandId">
          <el-select v-model="dialogForm.brandId" placeholder="请选择品牌" style="width: 100%;">
            <el-option v-for="brand in brandOptions" :key="brand.id" :label="brand.brandName" :value="brand.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="汽车图片" prop="pic">
          <div style="display: flex; align-items: center; gap: 10px;">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handlePicChange"
              accept="image/jpeg,image/png"
            >
              <img v-if="previewPic || dialogForm.pic" :src="previewPic || dialogForm.pic" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <el-button 
              v-if="previewPic || dialogForm.pic"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              @click="handleRemovePic"
              title="删除图片"
            ></el-button>
          </div>
          <div style="font-size: 12px; color: #999; margin-top: 5px;">
            {{ dialogStage === 'add' ? '提示：选择图片后，点击"确定"保存时将一并上传' : '建议尺寸: 200x200, 支持jpg/png' }}
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dialogForm.status">
            <el-radio :label="false">未租</el-radio>
            <el-radio :label="true">已租</el-radio>
            <el-radio :label="3">维保</el-radio>
            <el-radio :label="4">自用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="信息类型" prop="infoType">
          <el-radio-group v-model="dialogForm.infoType">
            <el-radio :label="false">燃油车</el-radio>
            <el-radio :label="true">电动车</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-input v-model="dialogForm.color" placeholder="请输入颜色" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="排量" prop="displacement">
          <el-input v-model="dialogForm.displacement" placeholder="请输入排量" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="注册日期" prop="registrationDate">
          <el-date-picker v-model="dialogForm.registrationDate" type="date" placeholder="选择注册日期" format="yyyy-MM-dd"
            value-format="yyyy-MM-dd" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogForm.description" type="textarea" placeholder="请输入描述" style="width: 100%;"
            :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分页组件 -->
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size"
      @pagination="getList" />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import infoApi from '@/api/info'
import makerApi from '@/api/maker'
import brandApi from '@/api/brand'
import requestHttp from '@/utils/request'

export default {
  name: 'InfoList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        current: 1,
        size: 10,
        autoNum: undefined,
        makerName: undefined,
        makerId: undefined,
        brandId: undefined,
        status: undefined,
        infoType: undefined,
        color: undefined,
        displacement: undefined,
        registrationDate: undefined
      },
      brandOptions: [],
      multipleSelection: [],
      dialogVisible: false,
      dialogStage: '',
      uploadAction: process.env.VUE_APP_BASE_API.replace(/\/$/, '') + '/upload/pic', 
      dialogForm: {
        id: undefined,
        autoNum: '',
        makerId: undefined,
        makerName: '',
        brandId: undefined,
        brandName: '',
        status: false,
        infoType: false,
        color: '',
        displacement: '',
        unit: 'L',
        registrationDate: '',
        description: '',
        pic: '',
        tempFile: null, // 用于暂存选中的图片文件
        previewPic: '' // 仅用于本地预览，不参与表单提交
      },
      dialogRules: {
        autoNum: [
          { required: true, message: '请输入车牌号', trigger: 'blur' }
        ]
      },
      statusMap: {
        false: 'info',
        true: 'success',
        3: 'warning',
        4: 'danger'
      },
      statusText: {
        false: '未租',
        true: '已租',
        3: '维保',
        4: '自用'
      },
      infoTypeText: {
        false: '燃油车',
        true: '电动车'
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.dialogStage === 'edit' ? '编辑信息' : '新增信息'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 处理图片选择变化
    handlePicChange(file) {
      const isJPG = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
      const isLt2M = file.raw.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!')
        return
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
        return
      }

      // 暂存文件对象
      this.dialogForm.tempFile = file.raw
      
      // 生成本地预览URL
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = (e) => {
        this.previewPic = e.target.result
      }
    },

    // 上传图片到通用端点，返回 URL
    async uploadPic() {
      if (!this.dialogForm.tempFile) {
        return true
      }

      const formData = new FormData()
      formData.append('file', this.dialogForm.tempFile)

      try {
        this.$message.info('正在上传图片...')
        const res = await requestHttp.upload('/upload/pic', formData)

        if (res.code === 200 || res.code === 0) {
          this.$message.success('图片上传成功')
          if (res.data) {
            const url = typeof res.data === 'string' ? res.data : (res.data.url || res.data.path)
            this.dialogForm.pic = url
            this.previewPic = url
          }
          this.dialogForm.tempFile = null
          return true
        } else {
          this.$message.error(res.message || '图片上传失败')
          return false
        }
      } catch (error) {
        console.error('上传失败:', error)
        this.$message.error('图片上传失败')
        return false
      }
    },

    // 统一：根据制造商名称加载品牌列表
    async loadBrands(makerName) {
      try {
        this.brandOptions = []
        if (!makerName) return

        const makerRes = await makerApi.search({ name: makerName })
        const makerList = makerRes.data || []
        
        if (!makerList || makerList.length === 0) {
          this.$message.warning('未找到该制造商')
          return
        }

        const currentMaker = makerList[0]
        const brandRes = await brandApi.getBrandListByMarkerId(currentMaker.id)
        this.brandOptions = brandRes.data || []

        if (this.dialogVisible) {
          this.dialogForm.makerId = currentMaker.id
        } else {
          this.listQuery.makerId = currentMaker.id
        }

        if (this.brandOptions.length === 0) {
          this.$message.info('该制造商暂无品牌')
        }
      } catch (err) {
        console.error('加载品牌失败：', err)
        this.$message.error('加载品牌失败')
      }
    },

    // 获取列表数据
    async getList() {
      this.listLoading = true
      try {
        const params = {
          autoNum: this.listQuery.autoNum || undefined,
          makerName: this.listQuery.makerName || undefined,
          makerId: this.listQuery.makerId || undefined,
          brandId: this.listQuery.brandId || undefined,
          status: this.listQuery.status !== '' ? this.strToValue(this.listQuery.status) : undefined,
          infoType: this.listQuery.infoType !== '' ? this.strToValue(this.listQuery.infoType) : undefined,
          color: this.listQuery.color || undefined,
          displacement: this.listQuery.displacement || undefined,
          registrationDate: this.listQuery.registrationDate || undefined,
        }
        const response = await infoApi.search(
          (this.listQuery.current - 1) * this.listQuery.size,
          this.listQuery.size,
          params
        )
        if (response && response.data && response.data.records) {
          this.list = response.data.records
          this.total = response.data.total
        } else {
          this.list = []
          this.total = 0
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.listLoading = false
      }
    },

    // 字符串转值
    strToValue(str) {
      if (str === "true") return true
      if (str === "false") return false
      if (str === "3") return 3
      if (str === "4") return 4
      const num = Number(str)
      return isNaN(num) ? str : num
    },

    // 筛选
    async handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },

    // 重置
    async handleReset() {
      this.listQuery = {
        current: 1,
        size: 10,
        autoNum: undefined, makerName: undefined, makerId: undefined, brandId: undefined,
        status: undefined, infoType: undefined, color: undefined, displacement: undefined, registrationDate: undefined
      }
      this.brandOptions = []
      this.handleFilter()
    },

    // 新增
    handleCreate() {
      this.dialogStage = 'add'
      this.resetDialogForm()
      this.dialogVisible = true
    },

    // 编辑
    handleUpdate(row) {
      this.dialogStage = 'edit'
      this.dialogForm = { ...row }
      // 先设置可见状态，确保 loadBrands 中能正确识别上下文为弹窗模式，从而更新 dialogForm.makerId
      this.dialogVisible = true
      // 编辑时加载对应品牌
      this.loadBrands(row.makerName)
    },

    // 关闭弹窗
    handleClose() {
      this.dialogVisible = false
      this.previewPic = ''
      this.$refs.dialogForm.clearValidate()
      this.brandOptions = []
    },

    // 提交
    async handleSubmit() {
      this.$refs.dialogForm.validate(async valid => {
        if (valid) {
          let success = false
          
          if (this.dialogStage === 'add') {
            // 新增模式
            try {
              // 1. 先上传图片，获取 URL
              if (this.dialogForm.tempFile) {
                const uploadSuccess = await this.uploadPic()
                if (!uploadSuccess) {
                  return
                }
              }

              // 2. 保存基本信息（pic 已是上传后的 URL）
              const payload = { ...this.dialogForm }
              delete payload.tempFile
              delete payload.previewPic
              await infoApi.add(payload)

              this.$message.success('新增成功')
              this.dialogVisible = false
              this.getList()
              success = true
            } catch (error) {
              console.error(error)
              this.$message.error('新增失败: ' + (error.message || ''))
            }
          } else {
            // 编辑模式
            try {
              // 1. 先上传图片，获取 URL
              if (this.dialogForm.tempFile) {
                const uploadSuccess = await this.uploadPic()
                if (!uploadSuccess) {
                  return
                }
              }

              // 2. 更新基本信息
              const payload = { ...this.dialogForm }
              delete payload.tempFile
              delete payload.previewPic
              await infoApi.update(payload)

              this.$message.success('更新成功')
              this.dialogVisible = false
              this.getList()
              success = true
            } catch (error) {
              this.$message.error('更新失败')
            }
          }
        }
      })
    },

    // 重置弹窗表单
    resetDialogForm() {
      this.dialogForm = {
        id: undefined, autoNum: '', makerId: undefined, makerName: '', brandId: undefined, brandName: '',
        status: false, infoType: false, color: '', displacement: '', unit: 'L', registrationDate: '', description: '', pic: '',
        tempFile: null // 重置临时文件
      }
      this.brandOptions = []
    },

    // 删除单条
    async handleDelete(row, index) {
      this.$confirm('是否删除?', '提示', { type: 'warning' }).then(async () => {
        await infoApi.delete(row.id)
        this.list.splice(index, 1)
        this.total--
        if (this.list.length === 0 && this.listQuery.current > 1) {
          this.listQuery.current--
          this.getList()
        }
        this.$message.success('删除成功')
      }).catch(() => this.$message.info('已取消'))
    },

    // 批量删除
    handleDeleteSelected() {
      if (!this.multipleSelection.length) return this.$message.warning('请选择数据')
      this.$confirm(`确定删除${this.multipleSelection.length}条？`).then(async () => {
        await infoApi.deleteBatch(this.multipleSelection.map(i => i.id))
        this.$message.success('删除成功')
        this.getList()
      }).catch(() => this.$message.info('已取消'))
    },

    // 多选事件
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 序号
    indexMethod(index) {
      return (this.listQuery.current - 1) * this.listQuery.size + index + 1
    },

    // 弹窗：制造商输入实时加载品牌
    onMakerNameChange() {
      this.dialogForm.brandId = undefined
      this.loadBrands(this.dialogForm.makerName)
    },

    // 搜索栏：制造商输入实时加载品牌
    onSearchMakerNameChange() {
      this.listQuery.brandId = undefined
      this.loadBrands(this.listQuery.makerName)
    },

    // 删除图片
    async handleRemovePic() {
      this.$confirm('确定要删除当前图片吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 修改: 直接清空前端表单数据。
        // 如果后端需要在删除图片时同步清理服务器文件，通常在提交表单时发现 pic 从有变无，后端自行处理；
        // 或者调用专门的删除接口，而不是复用上传接口。
        this.dialogForm.pic = ''
        this.previewPic = ''
        this.$message.success('图片已移除（保存后生效）')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
::v-deep .el-form-item__label {
  white-space: nowrap;
  text-align: right;
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
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>