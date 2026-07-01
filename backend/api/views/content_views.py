from rest_framework.views import APIView
from rest_framework.response import Response
from utils.mongo import boards_col
from bson import ObjectId

class BoardsView(APIView):
    def get(self, request):
        boards = list(boards_col.find({}, {'grades': 0}))
        for b in boards:
            b['id'] = str(b.pop('_id', b.get('id', '')))
        return Response(boards)

class GradesView(APIView):
    def get(self, request, board_id):
        board = boards_col.find_one({'_id': board_id})
        if not board: return Response([])
        grades = list(board.get('grades', {}).values())
        return Response(grades)

    def post(self, request, board_id):
        if request.auth.get('role') != 'admin': return Response(status=403)
        data = request.data
        grade_id = data.get('id') or f"grade-{int(datetime.now().timestamp()*1000)}"
        doc = { 'id': grade_id, 'name': data.get('name'), 'order': data.get('order', 1), 'subjects': {} }
        boards_col.update_one({'_id': board_id}, {'$set': {f'grades.{grade_id}': doc}})
        return Response(doc, status=201)

class GradeDetailView(APIView):
    def get(self, request, board_id, grade_id):
        board = boards_col.find_one({'_id': board_id})
        if not board: return Response(None, status=404)
        return Response(board.get('grades', {}).get(grade_id))

    def patch(self, request, board_id, grade_id):
        if request.auth.get('role') != 'admin': return Response(status=403)
        data = request.data
        updates = {}
        if 'name' in data: updates[f'grades.{grade_id}.name'] = data['name']
        if 'order' in data: updates[f'grades.{grade_id}.order'] = data['order']
        
        if updates:
            boards_col.update_one({'_id': board_id}, {'$set': updates})
        return Response({'message': 'Updated'})

    def delete(self, request, board_id, grade_id):
        if request.auth.get('role') != 'admin': return Response(status=403)
        boards_col.update_one({'_id': board_id}, {'$unset': {f'grades.{grade_id}': ""}})
        return Response({'message': 'Deleted'})

class SubjectsView(APIView):
    def get(self, request, board_id, grade_id):
        board = boards_col.find_one({'_id': board_id})
        if not board: return Response([])
        subjects = board.get('grades', {}).get(grade_id, {}).get('subjects', {})
        return Response(list(subjects.values()))

    def post(self, request, board_id, grade_id):
        if request.auth.get('role') != 'admin': return Response(status=403)
        data = request.data
        subject_id = data.get('id') or f"subject-{int(datetime.now().timestamp()*1000)}"
        doc = { 'id': subject_id, 'name': data.get('name'), 'icon': data.get('icon', '📘'), 'order': data.get('order', 1), 'chapters': {} }
        boards_col.update_one({'_id': board_id}, {'$set': {f'grades.{grade_id}.subjects.{subject_id}': doc}})
        return Response(doc, status=201)

class SubjectDetailView(APIView):
    def get(self, request, board_id, grade_id, subject_id):
        board = boards_col.find_one({'_id': board_id})
        if not board: return Response(None, status=404)
        return Response(board.get('grades', {}).get(grade_id, {}).get('subjects', {}).get(subject_id))

    def patch(self, request, board_id, grade_id, subject_id):
        if request.auth.get('role') != 'admin': return Response(status=403)
        data = request.data
        updates = {}
        if 'name' in data: updates[f'grades.{grade_id}.subjects.{subject_id}.name'] = data['name']
        if 'order' in data: updates[f'grades.{grade_id}.subjects.{subject_id}.order'] = data['order']
        if 'icon' in data: updates[f'grades.{grade_id}.subjects.{subject_id}.icon'] = data['icon']
        
        if updates:
            boards_col.update_one({'_id': board_id}, {'$set': updates})
        return Response({'message': 'Updated'})

    def delete(self, request, board_id, grade_id, subject_id):
        if request.auth.get('role') != 'admin': return Response(status=403)
        boards_col.update_one({'_id': board_id}, {'$unset': {f'grades.{grade_id}.subjects.{subject_id}': ""}})
        return Response({'message': 'Deleted'})

class ChaptersView(APIView):
    def get(self, request, board_id, grade_id, subject_id):
        board = boards_col.find_one({'_id': board_id})
        if not board: return Response([])
        chapters = board.get('grades', {}).get(grade_id, {}).get('subjects', {}).get(subject_id, {}).get('chapters', {})
        return Response(list(chapters.values()))

    def post(self, request, board_id, grade_id, subject_id):
        if request.auth.get('role') != 'admin': return Response(status=403)
        data = request.data
        chapter_id = data.get('id') or f"chapter-{int(datetime.now().timestamp()*1000)}"
        
        default_types = {
            'notes': {'id': 'notes', 'name': 'Notes', 'order': 1},
            'question-paper': {'id': 'question-paper', 'name': 'Question Paper', 'order': 2}
        }
        
        doc = { 'id': chapter_id, 'name': data.get('name'), 'order': data.get('order', 1), 'types': data.get('types', default_types) }
        boards_col.update_one({'_id': board_id}, {'$set': {f'grades.{grade_id}.subjects.{subject_id}.chapters.{chapter_id}': doc}})
        return Response(doc, status=201)

class ChapterDetailView(APIView):
    def get(self, request, board_id, grade_id, subject_id, chapter_id):
        board = boards_col.find_one({'_id': board_id})
        if not board: return Response(None, status=404)
        return Response(board.get('grades', {}).get(grade_id, {}).get('subjects', {}).get(subject_id, {}).get('chapters', {}).get(chapter_id))

    def patch(self, request, board_id, grade_id, subject_id, chapter_id):
        if request.auth.get('role') != 'admin': return Response(status=403)
        data = request.data
        updates = {}
        if 'name' in data: updates[f'grades.{grade_id}.subjects.{subject_id}.chapters.{chapter_id}.name'] = data['name']
        if 'order' in data: updates[f'grades.{grade_id}.subjects.{subject_id}.chapters.{chapter_id}.order'] = data['order']
        
        if updates:
            boards_col.update_one({'_id': board_id}, {'$set': updates})
        return Response({'message': 'Updated'})

    def delete(self, request, board_id, grade_id, subject_id, chapter_id):
        if request.auth.get('role') != 'admin': return Response(status=403)
        boards_col.update_one({'_id': board_id}, {'$unset': {f'grades.{grade_id}.subjects.{subject_id}.chapters.{chapter_id}': ""}})
        return Response({'message': 'Deleted'})
