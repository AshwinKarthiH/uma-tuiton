import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export default function GradeGuard({ children }) {
  const { board, gradeId } = useParams();
  const { user, isAdmin, canAccessGrade } = useAuth();
  const { findBoard, findGrade } = useData();

  // Admins bypass grade restrictions
  if (isAdmin) return children;

  // Check per-board access
  if (canAccessGrade(board, gradeId)) {
    return children;
  }

  // Format enrolled grades string for display
  let enrolledString = 'None';
  if (user?.assignedBoard) {
    const bName = findBoard(user.assignedBoard)?.name || user.assignedBoard;
    if (user.assignedGrades?.includes('all')) {
      enrolledString = `All Grades (${bName})`;
    } else if (user.assignedGrades?.length > 0) {
      const gNames = user.assignedGrades.map(g => findGrade(user.assignedBoard, g)?.name || g).join(', ');
      enrolledString = `${gNames} (${bName})`;
    }
  }

  return (
    <div className="page-wrapper" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="access-denied-card">
        <div className="access-denied-icon">🔒</div>
        <h2>Access Restricted</h2>
        <p>You don't have access to this content.</p>
        <div className="enrolled-info">
          <span className="enrolled-label">Your enrolled grade:</span>
          <span className="enrolled-value">{enrolledString}</span>
        </div>
        <Link to={`/${user?.assignedBoard || 'dashboard'}`} className="action-btn action-btn-primary">
          ← Go Back to My Materials
        </Link>
      </div>
    </div>
  );
}
