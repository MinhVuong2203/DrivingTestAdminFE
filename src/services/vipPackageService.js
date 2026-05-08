import api from './api'

export const getVipPackages = async () => {
  const res = await api.get('/api/VipPackage')

  return res.data
}

export const createVipPackage = async data => {
  return await api.post('/api/VipPackage', data)
}

export const updateVipPackage = async (
  id,
  data,
) => {
  return await api.put(
    `/api/VipPackage/${id}`,
    data,
  )
}

export const deleteVipPackage = async id => {
  return await api.delete(
    `/api/VipPackage/${id}`,
  )
}

export const toggleVipPackageStatus =
  async id => {
    return await api.patch(
      `/api/VipPackage/${id}/toggle-active`,
    )
  }