import api from './axios'

export const getAllCourses = () => api.get('/courses')
export const getCourseById = (id) => api.get(`/courses/${id}`)
