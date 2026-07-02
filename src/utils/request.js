import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import qs from 'qs'
// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 200) {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('您已注销，您可以取消以留在页面中，也可以重新登陆', '确认登出', {
          confirmButtonText: '重新登陆',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    if (error.config && error.config.url.includes('/login')) {
      return Promise.reject(error)
    }
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

const requestHttp = {
  // 1. POST JSON（新增、修改，对应后端 @RequestBody）
  post(url, params) {
    return service.post(url, params, {
      transformRequest: [(params) => JSON.stringify(params)],
      headers: { 'Content-Type': 'application/json' }
    })
  },

  // 2. PUT JSON（修改）
  put(url, params) {
    return service.put(url, params, {
      transformRequest: [(params) => JSON.stringify(params)],
      headers: { 'Content-Type': 'application/json' }
    })
  },

  // 3. GET 普通请求 ?name=xxx&age=xxx
  get(url, params) {
    return service.get(url, {
      params: params,
      paramsSerializer: (params) => qs.stringify(params)
    })
  },

  // 4. RESTful 风格 /user/1/2/3
  getRestFulApi(url, params) {
    if (!params) return service.get(url)

    let path = ''
    for (const key in params) {
      if (params[key] != null && params[key] !== '') {
        path += `/${params[key]}`
      }
    }
    return service.get(url + path)
  },

  // 5. DELETE RESTful /user/1
  delete(url, params) {
    if (!params) return service.delete(url)

    // 批量删除 / 带 data 的删除
    if (params && (Array.isArray(params) || params.data)) {
      return service.delete(url, { data: params.data || params }).catch(err => {
        Message.error(err.msg || '删除失败')
        return Promise.reject(err)
      })
    }

    // 单条删除：拼接 ID 路径
    let path = ''
    for (const key in params) {
      if (params[key] != null && params[key] !== '') {
        path += `/${params[key]}`
      }
    }
    return service.delete(url + path)
  },

  // 6. 文件上传
  upload(url, params) {
    return service.post(url, params, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 7. 登录（表单格式，对应后端 @RequestParam）
  login(url, params) {
    return service.post(url, params, {
      transformRequest: [(params) => qs.stringify(params)],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  }
}

export default requestHttp
