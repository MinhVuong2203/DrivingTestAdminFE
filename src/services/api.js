import axios from 'axios'
const api = axios.create({
  baseURL: 'https://localhost:7211',
})

export default api
