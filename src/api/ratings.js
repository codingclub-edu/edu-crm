import api from './axios'

export const getMyRatings = () => api.get('/ratings/me/ratings')
