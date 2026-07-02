import requestHttp from '@/utils/request'
export default {
  async add(data) {
    return requestHttp.post('/dept/add', data)
  },
  async delete(id) {
  return requestHttp.delete(`/dept/delete/${id}`)
},
  async search(data) {
    return requestHttp.post('/dept/search', data)
  }
  ,
  async update(data) {
    return requestHttp.post('/dept/update', data)
  },
  async getTree() {
    return requestHttp.get('/dept/getTree')
  },
  async hasChild(data) {
    return requestHttp.post('/dept/hasChild', data)
  }
}