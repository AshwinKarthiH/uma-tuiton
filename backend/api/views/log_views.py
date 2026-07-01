from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from utils.mongo import logs_col
from datetime import datetime
import uuid, csv, io

def serialize_log(l):
    l['id'] = str(l.pop('_id', l.get('id', '')))
    return l

class LogsView(APIView):
    def get(self, request):
        role = request.auth.get('role')
        user_id = request.auth.get('user_id')

        if role == 'admin':
            query = {}
        else:
            query = {'userId': user_id}

        search = request.query_params.get('search', '')
        board = request.query_params.get('board', '')
        date_from = request.query_params.get('from', '')
        date_to = request.query_params.get('to', '')

        if board: query['boardId'] = board
        if date_from: query['timestamp'] = {'$gte': date_from}
        if date_to: query.setdefault('timestamp', {})['$lte'] = date_to

        page = int(request.query_params.get('page', 1))
        per_page = 20

        all_logs = list(logs_col.find(query).sort('timestamp', -1))

        if search:
            search_lower = search.lower()
            all_logs = [l for l in all_logs if
                search_lower in l.get('userName', '').lower() or
                search_lower in l.get('docName', '').lower() or
                search_lower in l.get('userEmail', '').lower()]

        total = len(all_logs)
        paginated = all_logs[(page-1)*per_page : page*per_page]

        return Response({
            'total': total,
            'page': page,
            'pages': (total + per_page - 1) // per_page,
            'logs': [serialize_log(l) for l in paginated]
        })

    def post(self, request):
        role = request.auth.get('role')
        if role == 'admin':
            return Response({'message': 'Admin views not logged.'})

        data = request.data
        log_id = f"log-{int(datetime.now().timestamp()*1000)}-{uuid.uuid4().hex[:4]}"
        doc = {
            '_id': log_id,
            'id': log_id,
            'userId': request.auth.get('user_id'),
            'userName': request.auth.get('name'),
            'userEmail': request.auth.get('email'),
            'fileId': data.get('fileId'),
            'docName': data.get('docName'),
            'boardId': data.get('boardId'), 'boardName': data.get('boardName'),
            'gradeId': data.get('gradeId'), 'gradeName': data.get('gradeName'),
            'subjectId': data.get('subjectId'), 'subjectName': data.get('subjectName'),
            'chapterId': data.get('chapterId'), 'chapterName': data.get('chapterName'),
            'typeId': data.get('typeId'),
            'timestamp': datetime.now().isoformat(),
        }
        logs_col.insert_one(doc)
        return Response({'message': 'Logged.'}, status=201)

class LogDetailView(APIView):
    def delete(self, request, log_id):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        logs_col.delete_one({'_id': log_id})
        return Response({'message': 'Deleted.'})

class ExportLogsView(APIView):
    def get(self, request):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        logs = list(logs_col.find({}).sort('timestamp', -1))
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['User', 'Email', 'Document', 'Board', 'Grade', 'Subject', 'Chapter', 'Type', 'Date & Time'])
        for l in logs:
            writer.writerow([
                l.get('userName'), l.get('userEmail'), l.get('docName'),
                l.get('boardName'), l.get('gradeName'), l.get('subjectName'),
                l.get('chapterName'), l.get('typeId'),
                l.get('timestamp', '')[:19].replace('T', ' ')
            ])
        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="uma_tuition_logs.csv"'
        return response
