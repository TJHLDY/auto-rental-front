import requestHttp from '@/utils/request'

export default {
  async search(data) {
    return requestHttp.post('/customer/getCustomerList', data)
  },
  async delete(id) {
    return requestHttp.delete(`/customer/deleteCustomer/${id}`)
  },
  async batchDelete(ids) {
    return requestHttp.delete('/customer/deleteCustomerBatch', { data: ids })
  },
  async add(data) {
    return requestHttp.post('/customer/addCustomer', data)
  },
  async update(data) {
    return requestHttp.post('/customer/updateCustomer', data)
  }
}
