import api from './axios'

export const getMyPayments = () => api.get('/payments/me/payments')
