import requestHttp from '@/utils/request'

export default {
  async getMonthlyReport(year) {
    return requestHttp.get('/report/monthly', { year })
  }
}
