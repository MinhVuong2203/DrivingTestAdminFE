import axios from 'axios'
// const api = axios.create({
//   baseURL: 'http://localhost:7211',
// })

const api = axios.create({
  baseURL: 'https://drivingtestadmin-production.up.railway.app',
})

export default api
