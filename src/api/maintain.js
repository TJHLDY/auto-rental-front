import requestHttp from '@/utils/request'

export default {
  async search(data) {
    return requestHttp.post(`/maintain/search/${data.pageNum}/${data.pageSize}`, data)
  },
  async add(data) {
    return requestHttp.post('/maintain/add', data)
  },
  async update(data) {
    return requestHttp.post('/maintain/update', data)
  },
  async delete(id) {
    return requestHttp.delete(`/maintain/delete/${id}`)
  },
  async batchDelete(ids) {
    return requestHttp.delete('/maintain/deleteBatch', { data: ids })
  }
}
