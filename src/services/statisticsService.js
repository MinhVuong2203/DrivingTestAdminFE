import api from './api'

export const getAdminStatistics = async (params = {}) => {
  const res = await api.get('/api/admin/statistics', { params })
  return res.data
}

export const getAdMobReport = async ({ startDate, endDate }) => {
  const res = await api.get('/api/AdMobReport/report', {
    params: { startDate, endDate },
  })
  return res.data
}
