import requestHttp from '@/utils/request'
import { del } from 'vue'

export default {
  // 直接传整个对象
  async search(data) {
    return requestHttp.post('/maker/getMakerList', data
    )
  },
  async delete(id) {
    return requestHttp.delete(`/maker/deleteMaker/${id}`)
  },
  async batchDelete(ids) {
    return requestHttp.delete('/maker/deleteMakerBatch', { data: ids })
  },
  async add(data) {
    return requestHttp.post('/maker/addMaker', data)
  }
  ,
  async update(data) {
    return requestHttp.post('/maker/updateMaker', data)
  },
  async getAllList() {
    return requestHttp.put('/maker/getAllList')
  }
}