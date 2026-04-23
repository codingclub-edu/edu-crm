import api from './axios'

export const getAllArticles  = ()          => api.get('/admin/articles')
export const getArticleById = (id)        => api.get(`/admin/articles/${id}`)
export const createArticle  = (data)      => api.post('/admin/articles', data)
export const updateArticle  = (id, data)  => api.put(`/admin/articles/${id}`, data)
export const deleteArticle  = (id)        => api.delete(`/admin/articles/${id}`)