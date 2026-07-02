import requestHttp from '@/utils/request'

export default {
  async search(data) {
    return requestHttp.post(`/violation/search/${data.pageNum}/${data.pageSize}`, data)
  },
  async add(data) {
    return requestHttp.post('/violation/add', data)
  },
  async update(data) {
    return requestHttp.post('/violation/update', data)
  },
  async delete(id) {
    return requestHttp.delete(`/violation/delete/${id}`)
  },
  async batchDelete(ids) {
    return requestHttp.delete('/violation/deleteBatch', { data: ids })
  }
}
