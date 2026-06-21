import { collection, getDocs, orderBy, query } from 'firebase/firestore'

import api from '@/services/api'
import { auth, db } from '@/services/firebase'

const feedbackCollection = collection(db, 'feedbacks')

const normalizeTimestamp = (value) => {
  if (!value) return null

  if (typeof value?.toDate === 'function') {
    return value.toDate()
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const currentAdminName = () =>
  auth.currentUser?.displayName || auth.currentUser?.email || 'Quản trị viên'

const normalizeReply = (reply, index) => ({
  id: reply.id || `${index}`,
  content: reply.content || '',
  authorName: reply.authorName || reply.replyAuthor || '',
  source: reply.source || 'manual',
  createdAt: normalizeTimestamp(reply.createdAt || reply.repliedAt),
})

const mapFeedback = (snapshot) => {
  const data = snapshot.data()
  const nestedReply = data.reply || {}
  const nestedAi = data.ai || {}
  const nestedSpam = data.spam || {}
  const replies = Array.isArray(data.replies)
    ? data.replies.map(normalizeReply).filter((reply) => reply.content)
    : []
  const legacyReplyText = data.replyText || nestedReply.content || ''
  const fallbackReply =
    legacyReplyText && replies.length === 0
      ? [
          {
            id: 'legacy',
            content: legacyReplyText,
            authorName: data.replyAuthor || nestedReply.authorName || '',
            source: data.replySource || nestedReply.source || 'manual',
            createdAt: normalizeTimestamp(data.repliedAt || nestedReply.repliedAt),
          },
        ]
      : []
  const allReplies = [...replies, ...fallbackReply]
  const latestReply = allReplies[allReplies.length - 1] || null
  const replyText = latestReply?.content || legacyReplyText || ''
  const status = data.status || (replyText ? 'replied' : 'open')

  return {
    feedbackId: snapshot.id,
    userId: data.userId || '',
    email: data.email || '',
    displayName: data.displayName || '',
    content: data.content || '',
    platform: data.platform || 'Khác',
    status,
    timestamp: normalizeTimestamp(data.timestamp),
    updatedAt: normalizeTimestamp(data.updatedAt),
    replies: allReplies,
    replyText,
    replyAuthor: latestReply?.authorName || data.replyAuthor || nestedReply.authorName || '',
    replySource: latestReply?.source || data.replySource || nestedReply.source || '',
    repliedAt:
      latestReply?.createdAt || normalizeTimestamp(data.repliedAt || nestedReply.repliedAt),
    aiSuggestedReply: data.aiSuggestedReply || nestedAi.suggestedReply || '',
    aiGeneratedAt: normalizeTimestamp(data.aiGeneratedAt || nestedAi.generatedAt),
    spamRisk: Boolean(data.spamRisk || nestedAi.spamRisk || nestedSpam.suspected),
    spamReason: data.spamReason || nestedAi.spamReason || nestedSpam.reason || '',
  }
}

export const getFeedbacks = async () => {
  const snapshot = await getDocs(query(feedbackCollection, orderBy('timestamp', 'desc')))
  return snapshot.docs.map(mapFeedback)
}

export const saveFeedbackReply = async (feedbackId, replyText, source = 'manual') => {
  await api.put(`/api/Feedback/${feedbackId}/reply`, {
    replyText: replyText.trim(),
    source,
    replyAuthor: currentAdminName(),
  })
}

export const markFeedbackSpam = async (feedbackId, isSpam, statusAfter = 'open') => {
  await api.put(`/api/Feedback/${feedbackId}/spam`, {
    isSpam,
    statusAfter,
  })
}
