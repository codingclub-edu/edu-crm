import api from "./axios";

export const getMyAttendance = () => api.get("/attendance/me/attendance");
export const getGroupAttendance = (groupId) => api.get(`/attendance/group/${groupId}`);
export const updateDayAttendance = (groupId, data) => api.post(`/attendance/group/${groupId}`, data);
