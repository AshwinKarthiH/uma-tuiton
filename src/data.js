/**
 * Uma Tuition — Seed Data & Helpers
 * Only 2 boards: CBSE and State Board
 */

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export const PLACEHOLDER_PDF = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';

export const ICON_OPTIONS = ['🔬', '📖', '🌍', '🧮', '💻', '🎨', '🏃', '🎵', '📐', '🧪', '📚', '✏️', '🌿', '🔢', '📝', '🗺️', '🧬', '⚡', '🔭', '🎭'];

export const TYPE_ICON_OPTIONS = ['📄', '📝', '✅', '📋', '📑', '🗒️', '📃', '🔖', '📎', '📌'];

export const FEATURES = [
  { icon: '📚', title: 'Grade-wise Materials', description: 'Structured content organized by grade for easy navigation and focused learning.' },
  { icon: '📄', title: 'Notes & PDFs', description: 'Access comprehensive notes and PDFs for every chapter, curated by expert educators.' },
  { icon: '📖', title: 'Subject-wise Content', description: 'Materials neatly categorized by subject for focused and efficient study sessions.' },
  { icon: '🔒', title: 'Secure Viewing', description: 'View-only PDF access ensures content integrity and protection of study materials.' },
];

export const TESTIMONIALS = [
  { quote: "Uma Tuition helped me score 95% in my board exams. The organized notes and question papers were exactly what I needed.", name: "Priya Sharma", grade: "Grade 12, CBSE", rating: 5 },
  { quote: "The subject-wise content made it so easy to prepare for each exam. I could find everything in one place without wasting time.", name: "Arjun Patel", grade: "Grade 10, State Board", rating: 5 },
  { quote: "I've been using Uma Tuition for two years now. The quality of study materials is consistently excellent and up-to-date.", name: "Kavitha Rajan", grade: "Grade 11, CBSE", rating: 5 },
];

export const CONTACT = {
  email: 'info@umatuition.com',
  phone: '1800-XXX-XXXX',
  address: '123 Education Lane, Knowledge City, Tamil Nadu',
};

export const BOARD_META = {
  cbse: {
    name: 'CBSE',
    fullName: 'Central Board of Secondary Education',
    description: 'Central Board of Secondary Education — Grades 4 to 12',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)',
    icon: '📘',
    tags: ['Notes', 'Question Papers', 'All Grades'],
  },
  stateboard: {
    name: 'State Board',
    fullName: 'Tamil Nadu State Board',
    description: 'Tamil Nadu State Board — Grades 4 to 12',
    gradient: 'linear-gradient(135deg, #4a1a6b 0%, #2c5282 100%)',
    icon: '📗',
    tags: ['Notes', 'Question Papers', 'All Grades'],
  },
};

// ── Seed Grades / Subjects / Chapters / Types ──
function makeType(name, icon) {
  const id = slugify(name);
  return { [id]: { id, name, icon } };
}

function makeChapter(name, order) {
  const id = slugify(name);
  return { [id]: { id, name, order, types: { ...makeType('Notes', '📄'), ...makeType('Question Paper', '📝') } } };
}

function makeSubject(name, icon, order, chapterNames) {
  const id = slugify(name);
  const chapters = {};
  chapterNames.forEach((cn, i) => Object.assign(chapters, makeChapter(cn, i)));
  return { [id]: { id, name, icon, order, chapters } };
}

function makeGrade(name, order) {
  const id = slugify(name);
  const subjects = {
    ...makeSubject('Mathematics', '🧮', 0, ['Real Numbers', 'Polynomials', 'Linear Equations']),
    ...makeSubject('Science', '🔬', 1, ['Chemical Reactions', 'Acids and Bases', 'Life Processes']),
    ...makeSubject('English', '📖', 2, ['A Letter to God', 'Nelson Mandela', 'Two Stories about Flying']),
    ...makeSubject('Social Studies', '🌍', 3, ['Rise of Nationalism', 'Resources and Development', 'Power Sharing']),
  };
  return { [id]: { id, name, order, subjects } };
}

export function createSeedContent() {
  const cbseGrades = {};
  const stateboardGrades = {};

  for (let g = 4; g <= 12; g++) {
    Object.assign(cbseGrades, makeGrade(`Grade ${g}`, g - 4));
    Object.assign(stateboardGrades, makeGrade(`Grade ${g}`, g - 4));
  }

  return {
    boards: {
      cbse: { id: 'cbse', name: 'CBSE', grades: cbseGrades },
      stateboard: { id: 'stateboard', name: 'State Board', grades: stateboardGrades },
    }
  };
}

export const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Administrator',
    email: 'admin@umatuition.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    assignedGrades: { cbse: ['all'], stateboard: ['all'] },
    dateAdded: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    email: 'user@umatuition.com',
    password: 'user123',
    role: 'user',
    status: 'active',
    assignedBoard: 'cbse',
    assignedGrades: ['grade-10'],
    dateAdded: '2026-01-15T00:00:00.000Z'
  },
];

export function fileKey(boardId, gradeId, subjectId, chapterId, typeId) {
  return `f-${boardId}-${gradeId}-${subjectId}-${chapterId}-${typeId}`;
}

export function autoDisplayName(gradeName, subjectName, chapterName, typeName) {
  return `${subjectName} – ${chapterName} ${typeName}`;
}

export function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}
