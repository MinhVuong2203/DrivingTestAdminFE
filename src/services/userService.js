import api from './api'

export const getUsers = async () => {
  const res = await api.get('/api/users')
  return res.data
}

export const updateUserStatus = async (uid, status) => {
  return await api.patch(`/api/users/${uid}/status`, JSON.stringify(status), {
    headers: {
      'Content-Type': 'application/json',
    },
  })
} 
