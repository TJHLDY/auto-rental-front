import requestHttp from '@/utils/request'

export default {
  async search(data) {
    return requestHttp.post('/brand/getBrandList', data)
  },
  async getBrandListByMarkerId(id) {
    return requestHttp.get(`/brand/getBrandListByMakerId/${id}`)
  },

  async delete(id) {
    return requestHttp.delete(`/brand/deleteBrand/${id}`)
  },
  async batchDelete(ids) {
    return requestHttp.delete('/brand/deleteBrandBatch', { data: ids })
  },
  async add(data) {
    return requestHttp.post('/brand/addBrand', data)
  },
  async update(data) {
    return requestHttp.post('/brand/updateBrand', data)
  }
}
