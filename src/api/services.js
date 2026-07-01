import api from './axios';

// ── AUTH ──────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login/', { email, password }),
  me: () => api.get('/auth/me/'),
  logout: () => api.post('/auth/logout/'),
  refresh: (refresh) => api.post('/auth/refresh/', { refresh }),
};

// ── BOARDS & CONTENT ──────────────────────────────
export const contentAPI = {
  getBoards: () => api.get('/boards/'),
  getBoard: (boardId) => api.get(`/boards/${boardId}/`),
  getGrades: (boardId) => api.get(`/boards/${boardId}/grades/`),
  getGrade: (boardId, gradeId) => api.get(`/boards/${boardId}/grades/${gradeId}/`),
  addGrade: (boardId, data) => api.post(`/boards/${boardId}/grades/`, data),
  updateGrade: (boardId, gradeId, data) => api.patch(`/boards/${boardId}/grades/${gradeId}/`, data),
  deleteGrade: (boardId, gradeId) => api.delete(`/boards/${boardId}/grades/${gradeId}/`),

  getSubjects: (boardId, gradeId) => api.get(`/boards/${boardId}/grades/${gradeId}/subjects/`),
  addSubject: (boardId, gradeId, data) => api.post(`/boards/${boardId}/grades/${gradeId}/subjects/`, data),
  updateSubject: (boardId, gradeId, subjectId, data) => api.patch(`/boards/${boardId}/grades/${gradeId}/subjects/${subjectId}/`, data),
  deleteSubject: (boardId, gradeId, subjectId) => api.delete(`/boards/${boardId}/grades/${gradeId}/subjects/${subjectId}/`),

  getChapters: (boardId, gradeId, subjectId) => api.get(`/boards/${boardId}/grades/${gradeId}/subjects/${subjectId}/chapters/`),
  addChapter: (boardId, gradeId, subjectId, data) => api.post(`/boards/${boardId}/grades/${gradeId}/subjects/${subjectId}/chapters/`, data),
  updateChapter: (boardId, gradeId, subjectId, chapterId, data) => api.patch(`/boards/${boardId}/grades/${gradeId}/subjects/${subjectId}/chapters/${chapterId}/`, data),
  deleteChapter: (boardId, gradeId, subjectId, chapterId) => api.delete(`/boards/${boardId}/grades/${gradeId}/subjects/${subjectId}/chapters/${chapterId}/`),
};

// ── FILES ─────────────────────────────────────────
export const fileAPI = {
  getFiles: (params) => api.get('/files/', { params }),
  getFile: (fileId) => api.get(`/files/${fileId}/`),
  uploadFile: (data) => api.post('/files/', data),
  updateFile: (fileId, data) => api.patch(`/files/${fileId}/`, data),
  deleteFile: (fileId) => api.delete(`/files/${fileId}/`),
  publishFile: (fileId) => api.post(`/files/${fileId}/publish/`),
  unpublishFile: (fileId) => api.post(`/files/${fileId}/unpublish/`),
  getChapterFiles: (params) => api.get('/files/chapter/', { params }),
};

// ── USERS ─────────────────────────────────────────
export const userAPI = {
  getUsers: () => api.get('/users/'),
  createUser: (data) => api.post('/users/', data),
  updateUser: (userId, data) => api.patch(`/users/${userId}/`, data),
  deleteUser: (userId) => api.delete(`/users/${userId}/`),
};

// ── LOGS ──────────────────────────────────────────
export const logAPI = {
  getLogs: (params) => api.get('/logs/', { params }),
  createLog: (data) => api.post('/logs/', data),
  deleteLog: (logId) => api.delete(`/logs/${logId}/`),
  exportLogs: () => api.get('/logs/export/', { responseType: 'blob' }),
  clearLogs: () => api.delete('/logs/'),
};

// ── ANNOUNCEMENTS ─────────────────────────────────
export const announcementAPI = {
  getAnnouncements: () => api.get('/announcements/'),
  createAnnouncement: (data) => api.post('/announcements/', data),
  updateAnnouncement: (id, data) => api.patch(`/announcements/${id}/`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}/`),
};

// ── DASHBOARD ─────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats/'),
  getRecentLogs: () => api.get('/dashboard/recent-logs/'),
};
