import requestHttp from '@/utils/request'

export default {
  async search(start, size, data) {
    return requestHttp.post(`/order/search/${start}/${size}`, data)
  },
  async rental(data) {
    return requestHttp.post('/order/rental', data)
  },
  async returnCar(id, data) {
    return requestHttp.post(`/order/return/${id}`, data)
  },
  async delete(id) {
    return requestHttp.delete(`/order/delete/${id}`)
  },
  async batchDelete(ids) {
    return requestHttp.delete('/order/deleteBatch', { data: ids })
  }
}
