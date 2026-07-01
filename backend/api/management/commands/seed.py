from django.core.management.base import BaseCommand
from api.utils.mongo import boards_col
import sys

def generate_board_data(board_id, board_name):
    grades = {}
    
    for grade_num in range(4, 13):
        grade_id = f'grade-{grade_num}'
        subjects = {}
        
        # Base subjects for 4-10
        base_subjs = [
            {'id': 'mathematics', 'name': 'Mathematics', 'icon': '📐'},
            {'id': 'science', 'name': 'Science', 'icon': '🔬'},
            {'id': 'english', 'name': 'English', 'icon': '📖'}
        ]
        if grade_num >= 6 and grade_num <= 10:
            base_subjs.append({'id': 'social-science', 'name': 'Social Science', 'icon': '🌍'})
        if grade_num <= 5:
            base_subjs.append({'id': 'social-studies', 'name': 'Social Studies', 'icon': '🌍'})
            
        # Subjects for 11-12
        high_subjs = [
            {'id': 'mathematics', 'name': 'Mathematics', 'icon': '📐'},
            {'id': 'physics', 'name': 'Physics', 'icon': '⚡'},
            {'id': 'chemistry', 'name': 'Chemistry', 'icon': '⚗️'},
            {'id': 'biology', 'name': 'Biology', 'icon': '🧬'},
            {'id': 'english', 'name': 'English', 'icon': '📖'}
        ]
        
        subjs_to_use = high_subjs if grade_num >= 11 else base_subjs
        
        for s_idx, subj in enumerate(subjs_to_use):
            chapters = {}
            for ch_num in range(1, 4):
                chapters[f'chapter-{ch_num}'] = {
                    'id': f'chapter-{ch_num}',
                    'name': f'Chapter {ch_num} - {subj["name"]} Concepts',
                    'order': ch_num,
                    'types': {
                        'notes': {'id': 'notes', 'name': 'Notes', 'order': 1},
                        'question-paper': {'id': 'question-paper', 'name': 'Question Paper', 'order': 2}
                    }
                }
            
            subjects[subj['id']] = {
                'id': subj['id'],
                'name': subj['name'],
                'icon': subj['icon'],
                'order': s_idx + 1,
                'chapters': chapters
            }
            
        grades[grade_id] = {
            'id': grade_id,
            'name': f'Grade {grade_num}',
            'order': grade_num,
            'subjects': subjects
        }
        
    return {
        '_id': board_id,
        'id': board_id,
        'name': board_name,
        'grades': grades
    }

class Command(BaseCommand):
    help = 'Seeds the MongoDB database with default curriculum content'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        try:
            # Clear existing board data
            boards_col.delete_many({})
            
            cbse_data = generate_board_data('cbse', 'CBSE')
            state_data = generate_board_data('stateboard', 'State Board')
            
            # Additional custom chapter names as requested in snippet
            cbse_data['grades']['grade-4']['subjects']['mathematics']['chapters']['chapter-1']['name'] = 'Chapter 1 - Building with Bricks'
            cbse_data['grades']['grade-4']['subjects']['mathematics']['chapters']['chapter-2']['name'] = 'Chapter 2 - Long and Short'
            cbse_data['grades']['grade-4']['subjects']['mathematics']['chapters']['chapter-3']['name'] = 'Chapter 3 - A Trip to Bhopal'
            
            boards_col.insert_many([cbse_data, state_data])
            
            self.stdout.write(self.style.SUCCESS('Successfully seeded CBSE and State Board data!'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to seed database: {str(e)}'))
            sys.exit(1)
