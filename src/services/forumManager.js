import api from "./api";

export const getPosts = async () => {
    const res = await api.get('/api/Post');
    return res.data
}

export const getCommentsByPostId = async (postId) => {
  const res = await api.get(`/api/Comment/${postId}`)
  return res.data
}

export const deletePost = async (postId) => {
  const res = await api.delete(`/api/Post/${postId}`)
  return res.data
}

export const getModerationKeywords = async () => {
  const res = await api.get('/api/Moderation/keywords')
  return res.data
}

export const createModerationKeyword = async (keyword) => {
  const res = await api.post('/api/Moderation/keywords', {
    keyword
  })
  return res.data
}

export const toggleModerationKeyword = async (id, isActive) => {
  const res = await api.put(`/api/Moderation/keywords/${id}/toggle`, null, {
    params: { isActive }
  })
  return res.data
}

export const getAutoDeleteStatus = async () => {
  const res = await api.get('/api/Moderation/auto-delete')
  return res.data
}

export const updateAutoDeleteStatus = async (enabled) => {
  const res = await api.put('/api/Moderation/auto-delete', null, {
    params: { enabled }
  })
  return res.data
}