<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form :inline="true">
        <el-form-item label="选择年份">
          <el-date-picker
            v-model="selectedYear"
            type="year"
            value-format="yyyy"
            placeholder="选择年份"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="success" icon="el-icon-search" @click="fetchData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="16" class="summary-row">
      <el-col :span="4">
        <el-card class="summary-card">
          <div class="summary-label">年度总收入</div>
          <div class="summary-value revenue">{{ totalRevenue }}</div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card class="summary-card">
          <div class="summary-label">年度总成本</div>
          <div class="summary-value cost">{{ totalCost }}</div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card class="summary-card">
          <div class="summary-label">年度总罚款</div>
          <div class="summary-value fine">{{ totalFine }}</div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card class="summary-card">
          <div class="summary-label">年度总订单</div>
          <div class="summary-value order">{{ totalOrders }} 笔</div>
        </el-card>
      </el-col>
      <el-col :span="5">
        <el-card class="summary-card">
          <div class="summary-label">年度净利润</div>
          <div class="summary-value profit">{{ totalNetProfit }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card">
      <div ref="chartContainer" class="chart-container" />
    </el-card>

    <el-card class="table-card">
      <el-table :data="monthList" style="width: 100%" show-summary :summary-method="getSummaries">
        <el-table-column prop="month" label="月份" width="100" :formatter="monthFormatter" />
        <el-table-column prop="revenue" label="收入(元)" :formatter="amountFormatter" />
        <el-table-column prop="cost" label="维保成本(元)" :formatter="amountFormatter" />
        <el-table-column prop="fine" label="违章罚款(元)" :formatter="amountFormatter" />
        <el-table-column prop="orderCount" label="订单数" />
        <el-table-column prop="netProfit" label="净利润(元)" :formatter="amountFormatter" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import reportApi from '@/api/report'

export default {
  data() {
    return {
      selectedYear: String(new Date().getFullYear()),
      monthList: [],
      chart: null,
      loading: false
    }
  },
  computed: {
    totalRevenue() {
      return (this.monthList.reduce((s, m) => s + m.revenue, 0) / 100).toFixed(2) + ' 元'
    },
    totalCost() {
      return (this.monthList.reduce((s, m) => s + m.cost, 0) / 100).toFixed(2) + ' 元'
    },
    totalFine() {
      return (this.monthList.reduce((s, m) => s + m.fine, 0) / 100).toFixed(2) + ' 元'
    },
    totalOrders() {
      return this.monthList.reduce((s, m) => s + m.orderCount, 0)
    },
    totalNetProfit() {
      return (this.monthList.reduce((s, m) => s + m.netProfit, 0) / 100).toFixed(2) + ' 元'
    }
  },
  created() {
    this.fetchData()
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chart) { this.chart.dispose(); this.chart = null }
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const res = await reportApi.getMonthlyReport(this.selectedYear)
        if (res.code === 200) {
          this.monthList = res.data.monthList || []
          this.$nextTick(() => this.initChart())
        }
      } finally {
        this.loading = false
      }
    },
    initChart() {
      if (this.chart) { this.chart.dispose(); this.chart = null }
      const chartDom = this.$refs.chartContainer
      if (!chartDom) return
      this.chart = echarts.init(chartDom)

      const months = this.monthList.map(m => m.month + '月')
      const revenueData = this.monthList.map(m => (m.revenue / 100).toFixed(2))
      const costData = this.monthList.map(m => (m.cost / 100).toFixed(2))
      const fineData = this.monthList.map(m => (m.fine / 100).toFixed(2))
      const netProfit = this.monthList.map(m => (m.netProfit / 100).toFixed(2))
      const orderCounts = this.monthList.map(m => m.orderCount)

      const option = {
        tooltip: { trigger: 'axis' },
        legend: {
          data: ['收入', '维保成本', '违章罚款', '净利润', '订单数'],
          top: 10
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: months },
        yAxis: [
          { type: 'value', name: '金额(元)' },
          { type: 'value', name: '订单数' }
        ],
        series: [
          { name: '收入', type: 'bar', data: revenueData, itemStyle: { color: '#67C23A' }, barMaxWidth: 20 },
          { name: '维保成本', type: 'bar', data: costData, itemStyle: { color: '#E6A23C' }, barMaxWidth: 20 },
          { name: '违章罚款', type: 'bar', data: fineData, itemStyle: { color: '#F56C6C' }, barMaxWidth: 20 },
          { name: '净利润', type: 'line', data: netProfit, itemStyle: { color: '#409EFF' }, symbol: 'circle', symbolSize: 6 },
          { name: '订单数', type: 'line', yAxisIndex: 1, data: orderCounts, itemStyle: { color: '#909399' }, lineStyle: { type: 'dashed' }, symbol: 'diamond', symbolSize: 6 }
        ]
      }
      this.chart.setOption(option)
    },
    handleResize() {
      if (this.chart) { this.chart.resize() }
    },
    monthFormatter(row) {
      return row.month + '月'
    },
    amountFormatter(row, column, value) {
      return (value / 100).toFixed(2)
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((col, index) => {
        if (index === 0) { sums[index] = '合计'; return }
        const values = data.map(item => Number(item[col.property]))
        const total = values.reduce((prev, curr) => prev + curr, 0)
        if (col.property === 'orderCount') {
          sums[index] = total
        } else {
          sums[index] = (total / 100).toFixed(2)
        }
      })
      return sums
    }
  }
}
</script>

<style scoped>
.summary-row {
  margin-bottom: 16px;
}
.summary-card {
  text-align: center;
}
.summary-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}
.summary-value {
  font-size: 18px;
  font-weight: bold;
}
.summary-value.revenue { color: #67C23A; }
.summary-value.cost { color: #E6A23C; }
.summary-value.fine { color: #F56C6C; }
.summary-value.order { color: #909399; }
.summary-value.profit { color: #409EFF; }
.chart-card {
  margin-bottom: 16px;
}
.chart-container {
  width: 100%;
  height: 400px;
}
</style>
