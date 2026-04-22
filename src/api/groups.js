import api from './axios'

export const getMyGroups = () => api.get('/groups/me')
export const getAllGroups = () => api.get('/groups')
export const getGroupById = (id) => api.get(`/groups/${id}`)
