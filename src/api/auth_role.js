import requestHttp from "@/utils/request";
export default {
  async add(data) {
    return await requestHttp.post('/role/add', data)
  },
  async delete(id) {
    return await requestHttp.delete(`/role/delete/${id}`)
  },
  async deleteBatch(ids) {
    return await requestHttp.delete('/role/deleteBatch', { data: ids })
  },
  async fetchData(start, size, data) {
    return await requestHttp.post(`/role/search/${start}/${size}`, data)
  },
  async update(data) {
    return await requestHttp.put('/role/update', data)
  },
  async hasUser(id){
    return await requestHttp.get(`/role/hasUser/${id}`)
  },
  async getRPTree(data){
    return await requestHttp.post('/role/searchRPTree', data)
  },
  async setRolePermission(data){
    return await requestHttp.put('/role/setRolePermission', data)
  },
  async selectChildRoleByUserId(){
    return await requestHttp.get('/role/selectChildRoleByUserId')
  }
}