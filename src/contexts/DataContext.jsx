import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createSeedContent, uid, slugify } from '../data';
import { SK_USERS } from './AuthContext';

const DataContext = createContext(null);

const SK_CONTENT = 'bp_content_v4';
const SK_FILES = 'bp_files_v4';
const SK_LOGS = 'bp_logs_v4';
const SK_ANNOUNCEMENTS = 'bp_announcements_v4';

function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function initUsers() { return load(SK_USERS, []); }
function initContent() {
  const c = load(SK_CONTENT, null);
  if (c && c.boards) return c;
  const seeded = createSeedContent();
  save(SK_CONTENT, seeded);
  return seeded;
}
function initFiles() { return load(SK_FILES, {}); }
function initLogs() { return load(SK_LOGS, []); }
function initAnnouncements() { return load(SK_ANNOUNCEMENTS, []); }

export function DataProvider({ children }) {
  const [users, setUsers] = useState(initUsers);
  const [content, setContent] = useState(initContent);
  const [files, setFiles] = useState(initFiles);
  const [logs, setLogs] = useState(initLogs);
  const [announcements, setAnnouncements] = useState(initAnnouncements);

  const saveContent = useCallback((c) => { setContent(c); save(SK_CONTENT, c); }, []);
  const saveUsers = useCallback((u) => { setUsers(u); save(SK_USERS, u); }, []);
  const saveFiles = useCallback((f) => { setFiles(f); save(SK_FILES, f); }, []);
  const saveLogs = useCallback((l) => { setLogs(l); save(SK_LOGS, l); }, []);
  const saveAnnouncements = useCallback((a) => { setAnnouncements(a); save(SK_ANNOUNCEMENTS, a); }, []);

  const getOrdered = useCallback((obj) => {
    if (!obj) return [];
    return Object.values(obj).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, []);

  // ── GRADE CRUD ──
  const addGrade = useCallback((boardId, name) => {
    const id = slugify(name);
    const c = JSON.parse(JSON.stringify(content));
    if (!c.boards[boardId] || c.boards[boardId].grades[id]) return false;
    c.boards[boardId].grades[id] = { id, name, order: Object.keys(c.boards[boardId].grades).length, subjects: {} };
    saveContent(c);
    return true;
  }, [content, saveContent]);

  const renameGrade = useCallback((boardId, gid, name) => {
    const c = JSON.parse(JSON.stringify(content));
    if (c.boards[boardId]?.grades[gid]) { c.boards[boardId].grades[gid].name = name; saveContent(c); }
  }, [content, saveContent]);

  const deleteGrade = useCallback((boardId, gid) => {
    const newFiles = { ...files };
    Object.keys(newFiles).forEach(k => { if (k.includes(`-${gid}-`)) delete newFiles[k]; });
    saveFiles(newFiles);
    const c = JSON.parse(JSON.stringify(content));
    if (c.boards[boardId]?.grades[gid]) { delete c.boards[boardId].grades[gid]; saveContent(c); }
  }, [content, files, saveContent, saveFiles]);

  const reorderGrades = useCallback((boardId, orderedIds) => {
    const c = JSON.parse(JSON.stringify(content));
    orderedIds.forEach((id, i) => { if (c.boards[boardId]?.grades[id]) c.boards[boardId].grades[id].order = i; });
    saveContent(c);
  }, [content, saveContent]);

  // ── SUBJECT CRUD ──
  const addSubject = useCallback((boardId, gid, name, icon) => {
    const id = slugify(name);
    const c = JSON.parse(JSON.stringify(content));
    const grade = c.boards[boardId]?.grades[gid];
    if (!grade || grade.subjects[id]) return false;
    grade.subjects[id] = { id, name, icon: icon || '📚', order: Object.keys(grade.subjects).length, chapters: {} };
    saveContent(c);
    return true;
  }, [content, saveContent]);

  const renameSubject = useCallback((boardId, gid, sid, name, icon) => {
    const c = JSON.parse(JSON.stringify(content));
    const s = c.boards[boardId]?.grades[gid]?.subjects[sid];
    if (s) { if (name) s.name = name; if (icon !== undefined) s.icon = icon; saveContent(c); }
  }, [content, saveContent]);

  const deleteSubject = useCallback((boardId, gid, sid) => {
    const newFiles = { ...files };
    Object.keys(newFiles).forEach(k => { if (k.includes(`-${sid}-`)) delete newFiles[k]; });
    saveFiles(newFiles);
    const c = JSON.parse(JSON.stringify(content));
    const grade = c.boards[boardId]?.grades[gid];
    if (grade?.subjects[sid]) { delete grade.subjects[sid]; saveContent(c); }
  }, [content, files, saveContent, saveFiles]);

  // ── CHAPTER CRUD ──
  const addChapter = useCallback((boardId, gid, sid, name) => {
    const id = slugify(name);
    const c = JSON.parse(JSON.stringify(content));
    const subject = c.boards[boardId]?.grades[gid]?.subjects[sid];
    if (!subject || subject.chapters[id]) return false;
    subject.chapters[id] = {
      id, name, order: Object.keys(subject.chapters).length,
      types: { [slugify('Notes')]: { id: slugify('Notes'), name: 'Notes', icon: '📄' }, [slugify('Question Paper')]: { id: slugify('Question Paper'), name: 'Question Paper', icon: '📝' } }
    };
    saveContent(c);
    return true;
  }, [content, saveContent]);

  const renameChapter = useCallback((boardId, gid, sid, cid, name) => {
    const c = JSON.parse(JSON.stringify(content));
    const ch = c.boards[boardId]?.grades[gid]?.subjects[sid]?.chapters[cid];
    if (ch) { ch.name = name; saveContent(c); }
  }, [content, saveContent]);

  const deleteChapter = useCallback((boardId, gid, sid, cid) => {
    const newFiles = { ...files };
    Object.keys(newFiles).forEach(k => { if (k.includes(`-${cid}-`)) delete newFiles[k]; });
    saveFiles(newFiles);
    const c = JSON.parse(JSON.stringify(content));
    const subject = c.boards[boardId]?.grades[gid]?.subjects[sid];
    if (subject?.chapters[cid]) { delete subject.chapters[cid]; saveContent(c); }
  }, [content, files, saveContent, saveFiles]);

  const reorderChapters = useCallback((boardId, gid, sid, orderedIds) => {
    const c = JSON.parse(JSON.stringify(content));
    const subject = c.boards[boardId]?.grades[gid]?.subjects[sid];
    if (subject) { orderedIds.forEach((id, i) => { if (subject.chapters[id]) subject.chapters[id].order = i; }); saveContent(c); }
  }, [content, saveContent]);

  // ── TYPE CRUD ──
  const addType = useCallback((boardId, gid, sid, cid, name, icon) => {
    const id = slugify(name);
    const c = JSON.parse(JSON.stringify(content));
    const ch = c.boards[boardId]?.grades[gid]?.subjects[sid]?.chapters[cid];
    if (!ch || ch.types[id]) return false;
    ch.types[id] = { id, name, icon: icon || '📄' };
    saveContent(c);
    return true;
  }, [content, saveContent]);

  const renameType = useCallback((boardId, gid, sid, cid, tid, name, icon) => {
    const c = JSON.parse(JSON.stringify(content));
    const t = c.boards[boardId]?.grades[gid]?.subjects[sid]?.chapters[cid]?.types[tid];
    if (t) { if (name) t.name = name; if (icon !== undefined) t.icon = icon; saveContent(c); }
  }, [content, saveContent]);

  const deleteType = useCallback((boardId, gid, sid, cid, tid) => {
    const newFiles = { ...files };
    Object.keys(newFiles).forEach(k => { if (k.includes(`-${tid}`)) delete newFiles[k]; });
    saveFiles(newFiles);
    const c = JSON.parse(JSON.stringify(content));
    const ch = c.boards[boardId]?.grades[gid]?.subjects[sid]?.chapters[cid];
    if (ch?.types[tid]) { delete ch.types[tid]; saveContent(c); }
  }, [content, files, saveContent, saveFiles]);

  // ── FILE MANAGEMENT ──
  const uploadFile = useCallback((key, fileData) => { saveFiles({ ...files, [key]: fileData }); }, [files, saveFiles]);
  const deleteFile = useCallback((key) => { const f = { ...files }; delete f[key]; saveFiles(f); }, [files, saveFiles]);
  const renameFile = useCallback((key, displayName) => { if (files[key]) saveFiles({ ...files, [key]: { ...files[key], displayName } }); }, [files, saveFiles]);
  const publishFile = useCallback((key) => { if (files[key]) saveFiles({ ...files, [key]: { ...files[key], status: 'published', scheduledPublishAt: null } }); }, [files, saveFiles]);
  const unpublishFile = useCallback((key) => { if (files[key]) saveFiles({ ...files, [key]: { ...files[key], status: 'draft', scheduledPublishAt: null } }); }, [files, saveFiles]);
  const bulkPublish = useCallback((keys) => { const f = { ...files }; keys.forEach(k => { if (f[k]) f[k] = { ...f[k], status: 'published', scheduledPublishAt: null }; }); saveFiles(f); }, [files, saveFiles]);
  const updateFile = useCallback((key, updates) => { if (files[key]) saveFiles({ ...files, [key]: { ...files[key], ...updates } }); }, [files, saveFiles]);
  const getFile = useCallback((key) => files[key] || null, [files]);
  const getPublishedFile = useCallback((key) => { const f = files[key]; return f && f.status === 'published' ? f : null; }, [files]);

  // ── AUTO PUBLISH ──
  useEffect(() => {
    const checkScheduledPublish = () => {
      const now = new Date();
      let changed = false;
      const newFiles = { ...files };
      Object.values(newFiles).forEach(file => {
        if (file.status === 'scheduled' && file.scheduledPublishAt && new Date(file.scheduledPublishAt) <= now) {
          newFiles[file.id] = { ...file, status: 'published', scheduledPublishAt: null };
          changed = true;
        }
      });
      if (changed) saveFiles(newFiles);
    };
    checkScheduledPublish(); // check on mount
    const interval = setInterval(checkScheduledPublish, 60000);
    return () => clearInterval(interval);
  }, [files, saveFiles]);

  // ── USER CRUD ──
  const addUser = useCallback((u) => { const nu = { ...u, id: Date.now(), dateAdded: new Date().toISOString() }; saveUsers([...users, nu]); return nu; }, [users, saveUsers]);
  const updateUser = useCallback((id, upd) => saveUsers(users.map(u => u.id === id ? { ...u, ...upd } : u)), [users, saveUsers]);
  const deleteUser = useCallback((id) => saveUsers(users.filter(u => u.id !== id)), [users, saveUsers]);
  const toggleUserStatus = useCallback((id) => saveUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)), [users, saveUsers]);

  // ── LOGS ──
  const addLog = useCallback((entry) => { saveLogs([{ id: uid(), ...entry, timestamp: new Date().toISOString(), ip: '127.0.0.1' }, ...logs]); }, [logs, saveLogs]);
  const deleteLog = useCallback((id) => saveLogs(logs.filter(l => l.id !== id)), [logs, saveLogs]);
  const clearLogs = useCallback(() => saveLogs([]), [saveLogs]);

  // ── ANNOUNCEMENTS ──
  const addAnnouncement = useCallback((ann) => { saveAnnouncements([{ ...ann, id: uid(), createdAt: new Date().toISOString() }, ...announcements]); }, [announcements, saveAnnouncements]);
  const updateAnnouncement = useCallback((id, upd) => saveAnnouncements(announcements.map(a => a.id === id ? { ...a, ...upd } : a)), [announcements, saveAnnouncements]);
  const deleteAnnouncement = useCallback((id) => saveAnnouncements(announcements.filter(a => a.id !== id)), [announcements, saveAnnouncements]);

  // ── LOOKUPS ──
  const findBoard = useCallback((bid) => content?.boards?.[bid], [content]);
  const findGrade = useCallback((bid, gid) => content?.boards?.[bid]?.grades?.[gid], [content]);
  const findSubject = useCallback((bid, gid, sid) => content?.boards?.[bid]?.grades?.[gid]?.subjects?.[sid], [content]);
  const findChapter = useCallback((bid, gid, sid, cid) => content?.boards?.[bid]?.grades?.[gid]?.subjects?.[sid]?.chapters?.[cid], [content]);
  const getBoardGrades = useCallback((bid) => getOrdered(content?.boards?.[bid]?.grades), [content, getOrdered]);

  // ── STATS ──
  const stats = content?.boards ? (() => {
    const allFiles = Object.values(files);
    let totalGrades = 0, totalSubjects = 0, totalChapters = 0;
    Object.values(content.boards).forEach(b => {
      const grades = Object.values(b.grades || {});
      totalGrades += grades.length;
      grades.forEach(g => {
        const subjects = Object.values(g.subjects || {});
        totalSubjects += subjects.length;
        subjects.forEach(s => { totalChapters += Object.keys(s.chapters || {}).length; });
      });
    });
    return {
      totalUsers: users.length, totalGrades, totalSubjects, totalChapters,
      totalFiles: allFiles.length,
      totalDraft: allFiles.filter(f => f.status === 'draft').length,
      totalPublished: allFiles.filter(f => f.status === 'published').length,
      totalScheduled: allFiles.filter(f => f.status === 'scheduled').length,
      totalViews: logs.length,
    };
  })() : { totalUsers: 0, totalGrades: 0, totalSubjects: 0, totalChapters: 0, totalFiles: 0, totalDraft: 0, totalPublished: 0, totalScheduled: 0, totalViews: 0 };

  return (
    <DataContext.Provider value={{
      users, content, files, logs, announcements, stats, getOrdered,
      addGrade, renameGrade, deleteGrade, reorderGrades,
      addSubject, renameSubject, deleteSubject,
      addChapter, renameChapter, deleteChapter, reorderChapters,
      addType, renameType, deleteType,
      uploadFile, deleteFile, renameFile, publishFile, unpublishFile, bulkPublish, updateFile, getFile, getPublishedFile,
      addUser, updateUser, deleteUser, toggleUserStatus,
      addLog, deleteLog, clearLogs,
      addAnnouncement, updateAnnouncement, deleteAnnouncement,
      findBoard, findGrade, findSubject, findChapter, getBoardGrades,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}
