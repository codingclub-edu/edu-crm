import api from './axios'

export const getMyGroups = () => api.get('/groups/me')
export const getAllGroups = () => api.get('/groups')
export const getGroupById = (id) => api.get(`/groups/${id}`)
export const getAllRooms = () => api.get('/rooms')
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data)
