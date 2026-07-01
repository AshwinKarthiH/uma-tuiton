import api from '../api/axios';

export const getSession = () => {
  try {
    const raw = localStorage.getItem('brightpath_session');
    return raw ? JSON.parse(raw) : null;
  } catch { 
    return null;
  }
};

export const saveSession = (user, accessToken, refreshToken) => {
  localStorage.setItem('brightpath_session', JSON.stringify({
    id: user.id, 
    name: user.name, 
    email: user.email,
    role: user.role, 
    assignedBoard: user.assignedBoard,
    assignedGrades: user.assignedGrades
  }));
  if (accessToken) {
    localStorage.setItem('uma_access_token', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('uma_refresh_token', refreshToken);
  }
  window.dispatchEvent(new Event('session-updated'));
};

export const clearSession = () => {
  localStorage.removeItem('brightpath_session');
  localStorage.removeItem('uma_access_token');
  localStorage.removeItem('uma_refresh_token');
  window.dispatchEvent(new Event('session-updated'));
};

export const logActivity = async (session, file, boardName, gradeName, subjectName, chapterName) => {
  if (!session || session.role === 'admin') return;
  
  try {
    await api.post('/logs/', {
      userId: session.id,
      userName: session.name,
      userEmail: session.email,
      fileId: file.id || file._id,
      docName: file.displayName || file.name,
      boardId: file.boardId, 
      boardName,
      gradeId: file.gradeId, 
      gradeName,
      subjectId: file.subjectId, 
      subjectName,
      chapterId: file.chapterId, 
      chapterName,
      typeId: file.typeId,
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};
