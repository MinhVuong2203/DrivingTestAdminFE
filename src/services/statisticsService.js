import api from './api'

export const getAdminStatistics = async (params = {}) => {
  const res = await api.get('/api/admin/statistics', { params })
  return res.data
}
