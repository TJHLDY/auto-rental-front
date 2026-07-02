import requestHttp from '@/utils/request'
export default {
  async add(data) {
    return requestHttp.post('/permission/add', data)
  },
  async delete(id) {
    return requestHttp.post(`/permission/delete/${id}`)
  },
  async getTree() {
    return requestHttp.get('/permission/getTree')
  },
  async update(data) {
    return requestHttp.post('/permission/update', data)
  },
  async hasChild(data) {
    return requestHttp.post('/permission/hasChild', data)
  },
  async search() {
    return requestHttp.get('/permission/search')
  },
  async oneClickAddButton(pid){
    return requestHttp.post(`/permission/oneClickAddButton/${pid}`)
  }
}