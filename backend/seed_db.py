import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'uma_tuition.settings')
django.setup()

from utils.mongo import db, users_col, boards_col
from django.contrib.auth.hashers import make_password
from datetime import datetime

# Reset
users_col.delete_many({})
boards_col.delete_many({})

def slugify(text):
    import re
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def make_type(name, icon):
    id_str = slugify(name)
    return {id_str: {'id': id_str, 'name': name, 'icon': icon, 'order': 1 if id_str=='notes' else 2}}

def make_chapter(name, order):
    id_str = slugify(name)
    types = {}
    types.update(make_type('Notes', '📄'))
    types.update(make_type('Question Paper', '📝'))
    return {id_str: {'id': id_str, 'name': name, 'order': order, 'types': types}}

def make_subject(name, icon, order, chapter_names):
    id_str = slugify(name)
    chapters = {}
    for i, cn in enumerate(chapter_names):
        chapters.update(make_chapter(cn, i))
    return {id_str: {'id': id_str, 'name': name, 'icon': icon, 'order': order, 'chapters': chapters}}

def make_grade(name, order):
    id_str = slugify(name)
    subjects = {}
    subjects.update(make_subject('Mathematics', '🧮', 1, ['Real Numbers', 'Polynomials', 'Linear Equations']))
    subjects.update(make_subject('Science', '🔬', 2, ['Chemical Reactions', 'Acids and Bases', 'Life Processes']))
    subjects.update(make_subject('English', '📖', 3, ['A Letter to God', 'Nelson Mandela', 'Two Stories about Flying']))
    subjects.update(make_subject('Social Studies', '🌍', 4, ['Rise of Nationalism', 'Resources and Development', 'Power Sharing']))
    return {id_str: {'id': id_str, 'name': name, 'order': order, 'subjects': subjects}}

print("Generating grades...")
cbse_grades = {}
stateboard_grades = {}
for g in range(4, 13):
    cbse_grades.update(make_grade(f"Grade {g}", g - 4))
    stateboard_grades.update(make_grade(f"Grade {g}", g - 4))

print("Inserting boards...")
boards_col.insert_many([
    {'_id': 'cbse', 'id': 'cbse', 'name': 'CBSE', 'grades': cbse_grades},
    {'_id': 'stateboard', 'id': 'stateboard', 'name': 'State Board', 'grades': stateboard_grades}
])

print("Inserting users...")
users_col.insert_many([
    {
        '_id': 'admin-1',
        'id': 'admin-1',
        'name': 'Administrator',
        'email': 'admin@umatuition.com',
        'password': make_password('admin123'),
        'role': 'admin',
        'status': 'active',
        'assignedBoard': None,
        'assignedGrades': ['all'],
        'dateAdded': datetime.now().isoformat()
    },
    {
        '_id': 'user-2',
        'id': 'user-2',
        'name': 'Priya Sharma',
        'email': 'user@umatuition.com',
        'password': make_password('user123'),
        'role': 'user',
        'status': 'active',
        'assignedBoard': 'cbse',
        'assignedGrades': ['grade-10'],
        'dateAdded': datetime.now().isoformat()
    }
])

print("Database seeded successfully!")
