import requestHttp from '@/utils/request'

export async function login(data) {
  return await requestHttp.login('/user/login', data)
}

export async function getInfo(token) {
  return await requestHttp.get('/auth/getInfo', { token })
}
export async function logout(token) {
  return await requestHttp.post('/auth/logout', { token })
}
export async function getMenuList() {
  return await requestHttp.get('/auth/getMenuList')
}
export default {
  async add(data) {
    return await requestHttp.post('/user/add', data)
  },
  async delete(id) {
    return await requestHttp.delete(`/user/delete/${id}`)
  },
  async deleteBatch(ids) {
    return await requestHttp.delete('/user/deleteBatch', { data: ids })
  },
  async fetchData(data) {
    return await requestHttp.post('/user/selectByNameOrDeptId', data)
  },
  async update(data) {
    return await requestHttp.put('/user/update', data)
  }
}
