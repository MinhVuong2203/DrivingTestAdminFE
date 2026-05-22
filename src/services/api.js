import axios from 'axios'
const api = axios.create({
  baseURL: 'http://localhost:7211',
})

export default api
