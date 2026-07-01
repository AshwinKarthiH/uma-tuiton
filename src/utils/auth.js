export const getSession = () => {
  try {
    const raw = localStorage.getItem('uma_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveSession = (user, access, refresh) => {
  localStorage.setItem('uma_session', JSON.stringify(user));
  if (access) localStorage.setItem('uma_access_token', access);
  if (refresh) localStorage.setItem('uma_refresh_token', refresh);
  
  // This tells the Header to re-render instantly!
  window.dispatchEvent(new Event('session-updated')); 
};

export const clearSession = () => {
  localStorage.removeItem('uma_session');
  localStorage.removeItem('uma_access_token');
  localStorage.removeItem('uma_refresh_token');
  
  window.dispatchEvent(new Event('session-updated'));
};

export const isAdmin = () => getSession()?.role === 'admin';
export const isUser = () => getSession()?.role === 'user';
export const isLoggedIn = () => !!getSession();
