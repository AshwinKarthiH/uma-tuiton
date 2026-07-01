import { createContext, useContext, useState, useCallback } from 'react';
import { DEFAULT_USERS } from '../data';

const AuthContext = createContext(null);
const SK_SESSION = 'bp_session';
const SK_USERS = 'bp_users';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (!localStorage.getItem(SK_USERS)) localStorage.setItem(SK_USERS, JSON.stringify(DEFAULT_USERS));
    const s = localStorage.getItem(SK_SESSION);
    if (s) {
      try {
        const parsed = JSON.parse(s);
        const users = JSON.parse(localStorage.getItem(SK_USERS) || '[]');
        const found = users.find(u => u.id === parsed.id && u.status === 'active');
        if (found) {
          // Backward compatibility check
          let aBoard = found.assignedBoard || 'cbse';
          let aGrades = found.assignedGrades || ['all'];
          if (found.assignedGrades && !Array.isArray(found.assignedGrades)) {
            aBoard = found.assignedGrades.cbse?.length ? 'cbse' : 'stateboard';
            aGrades = found.assignedGrades[aBoard] || ['all'];
          }
          return { id: found.id, name: found.name, email: found.email, role: found.role, assignedBoard: aBoard, assignedGrades: aGrades };
        }
        localStorage.removeItem(SK_SESSION);
      } catch { localStorage.removeItem(SK_SESSION); }
    }
    return null;
  });

  const refreshUser = useCallback(() => {
    const users = JSON.parse(localStorage.getItem(SK_USERS) || '[]');
    if (user) {
      const found = users.find(u => u.id === user.id);
      if (found) {
        let aBoard = found.assignedBoard || 'cbse';
        let aGrades = found.assignedGrades || ['all'];
        if (found.assignedGrades && !Array.isArray(found.assignedGrades)) {
          aBoard = found.assignedGrades.cbse?.length ? 'cbse' : 'stateboard';
          aGrades = found.assignedGrades[aBoard] || ['all'];
        }
        const updated = { id: found.id, name: found.name, email: found.email, role: found.role, assignedBoard: aBoard, assignedGrades: aGrades };
        setUser(updated);
        localStorage.setItem(SK_SESSION, JSON.stringify(updated));
      }
    }
  }, [user]);

  const login = useCallback((email, password) => {
    const users = JSON.parse(localStorage.getItem(SK_USERS) || '[]');
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { success: false, error: 'Invalid email or password.' };
    if (found.status !== 'active') return { success: false, error: 'Account deactivated. Contact administrator.' };
    let aBoard = found.assignedBoard || 'cbse';
    let aGrades = found.assignedGrades || ['all'];
    if (found.assignedGrades && !Array.isArray(found.assignedGrades)) {
      aBoard = found.assignedGrades.cbse?.length ? 'cbse' : 'stateboard';
      aGrades = found.assignedGrades[aBoard] || ['all'];
    }
    const sessionUser = { id: found.id, name: found.name, email: found.email, role: found.role, assignedBoard: aBoard, assignedGrades: aGrades };
    setUser(sessionUser);
    localStorage.setItem(SK_SESSION, JSON.stringify(sessionUser));
    return { success: true, user: sessionUser };
  }, []);

  const logout = useCallback(() => { setUser(null); localStorage.removeItem(SK_SESSION); }, []);

  const canAccessGrade = useCallback((boardId, gradeId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.assignedBoard !== boardId) return false;
    if (!user.assignedGrades) return false;
    return user.assignedGrades.includes('all') || user.assignedGrades.includes(gradeId);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user, isAdmin: user?.role === 'admin', canAccessGrade, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export { SK_USERS };
