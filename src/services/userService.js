import api from './api'

export const getUsers = async (params = {}) => {
  const res = await api.get('/api/users', { params })
  return res.data
}

export const updateUserStatus = async (uid, status, lockDays = null) => {
  return await api.patch(`/api/users/${uid}/status`, {
    status,
    lockDays,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export const updateUserRole = async (uid, role) => {
  return await api.patch(
    `/api/users/${uid}/role`,
    { role },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
