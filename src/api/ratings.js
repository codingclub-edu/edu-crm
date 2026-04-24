import api from './axios'

export const getMyRatings = () => api.get('/ratings/me/ratings')
export const getGroupRatings = (groupId) => api.get(`/ratings/group/${groupId}`)
export const updateDayRatings = (groupId, data) => api.put(`/ratings/group/${groupId}/day`, data)
