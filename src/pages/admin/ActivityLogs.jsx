import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PDFViewerModal from '../../components/PDFViewerModal';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [filterBoard, setFilterBoard] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // To preview a document
  const [filesMap, setFilesMap] = useState({});
  const [modal, setModal] = useState({ open: false, url: '', title: '', breadcrumb: '' });

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterBoard !== 'all') params.board = filterBoard;
      
      const res = await api.get('/logs/', { params });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilesMap = async () => {
    try {
      const res = await api.get('/files/');
      const map = {};
      res.data.forEach(f => { map[f.id || f._id] = f; });
      setFilesMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, debouncedSearch, filterBoard]);

  useEffect(() => {
    fetchFilesMap();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this log entry?")) return;
    try {
      await api.delete(`/logs/${id}/`);
      fetchLogs();
    } catch (err) {
      alert("Failed to delete log");
    }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/logs/export/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export CSV");
    }
  };

  const handleViewDoc = (log) => {
    const file = filesMap[log.fileId];
    if (!file) {
      alert("This document has been deleted from the file manager.");
      return;
    }
    const breadcrumb = `${log.boardName} › ${log.gradeName} › ${log.subjectName} › ${log.chapterName}`;
    setModal({ open: true, url: file.url, title: file.displayName, breadcrumb });
  };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <h2 className="h2">Activity Logs</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline" style={{ color: 'var(--primary-navy)', borderColor: 'var(--border-light)' }} onClick={exportCSV}>📥 Export CSV</button>
        </div>
      </div>

      <div className="card mb-4 d-flex gap-3 bg-light">
        <input type="text" className="form-input" placeholder="Search user or document..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ flex: 1 }} />
        <select className="form-input" style={{ width: '200px' }} value={filterBoard} onChange={e => { setFilterBoard(e.target.value); setPage(1); }}>
          <option value="all">All Boards</option>
          <option value="cbse">CBSE</option>
          <option value="stateboard">State Board</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--light-grey)', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '1rem' }}>User</th>
              <th style={{ padding: '1rem' }}>Document</th>
              <th style={{ padding: '1rem' }}>Path</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Date & Time</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No logs found.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{log.userName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.userEmail}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500, color: 'var(--primary-navy)' }}>{log.docName}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {log.boardName} › {log.gradeName}<br/>
                    {log.subjectName} › <span title={log.chapterName} style={{ maxWidth: '120px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'bottom' }}>{log.chapterName}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-gray">{log.typeId}</span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    {new Date(log.timestamp).toLocaleDateString()} <br/>
                    <span className="text-muted">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div className="d-flex justify-end gap-1">
                      <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => handleViewDoc(log)} title="View Document">👁️</button>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem', color: '#ef4444' }} onClick={() => handleDelete(log.id)} title="Delete Log">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="d-flex justify-between align-center p-3 border-top">
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
              Showing {logs.length} of {total} entries (Page {page} of {totalPages})
            </span>
            <div className="d-flex gap-1">
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem' }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      <PDFViewerModal 
        isOpen={modal.open}
        onClose={() => setModal(m => ({ ...m, open: false }))}
        pdfUrl={modal.url}
        documentTitle={modal.title}
        breadcrumb={modal.breadcrumb}
      />
    </div>
  );
}
