import { collection, getDocs, orderBy, query } from 'firebase/firestore'

import { db } from '@/services/firebase'

const feedbackCollection = collection(db, 'feedbacks')

const normalizeTimestamp = (value) => {
  if (!value) return null

  if (typeof value?.toDate === 'function') {
    return value.toDate()
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const mapFeedback = (snapshot) => {
  const data = snapshot.data()

  return {
    feedbackId: snapshot.id,
    userId: data.userId || '',
    email: data.email || '',
    displayName: data.displayName || '',
    content: data.content || '',
    platform: data.platform || 'Khác',
    timestamp: normalizeTimestamp(data.timestamp),
  }
}

export const getFeedbacks = async () => {
  const snapshot = await getDocs(query(feedbackCollection, orderBy('timestamp', 'desc')))
  return snapshot.docs.map(mapFeedback)
}
