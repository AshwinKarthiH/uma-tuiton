from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from utils.mongo import files_col
from bson import ObjectId
from datetime import datetime
import uuid

def serialize_file(f):
    f['id'] = str(f.pop('_id', f.get('id', '')))
    return f

class FilesView(APIView):
    def get(self, request):
        role = request.auth.get('role') if request.auth else None
        query = {}
        if role != 'admin':
            query['status'] = 'published'

        board = request.query_params.get('board')
        grade = request.query_params.get('grade')
        subject = request.query_params.get('subject')
        chapter = request.query_params.get('chapter')
        type_id = request.query_params.get('type')

        if board: query['boardId'] = board
        if grade: query['gradeId'] = grade
        if subject: query['subjectId'] = subject
        if chapter: query['chapterId'] = chapter
        if type_id: query['typeId'] = type_id

        files = list(files_col.find(query, {'url': 0}))  # exclude base64 from list
        return Response([serialize_file(f) for f in files])

    def post(self, request):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)

        data = request.data
        file_id = f"file-{int(datetime.now().timestamp()*1000)}-{uuid.uuid4().hex[:6]}"

        doc = {
            '_id': file_id,
            'id': file_id,
            'displayName': data.get('displayName', ''),
            'boardId': data.get('boardId'),
            'gradeId': data.get('gradeId'),
            'subjectId': data.get('subjectId'),
            'chapterId': data.get('chapterId'),
            'typeId': data.get('typeId'),
            'status': 'draft',
            'fileName': data.get('fileName', ''),
            'fileSize': data.get('fileSize', 0),
            'url': data.get('url', ''),  # base64 string
            'uploadedAt': datetime.now().isoformat(),
            'scheduledPublishAt': data.get('scheduledPublishAt'),
        }

        files_col.insert_one(doc)
        doc.pop('url')
        return Response(serialize_file(doc), status=201)


class FileDetailView(APIView):
    def get(self, request, file_id):
        role = request.auth.get('role') if request.auth else None
        f = files_col.find_one({'_id': file_id})
        if not f:
            return Response({'error': 'File not found.'}, status=404)
        if role != 'admin' and f.get('status') != 'published':
            return Response({'error': 'Not found.'}, status=404)
        return Response(serialize_file(f))

    def patch(self, request, file_id):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        allowed = ['displayName', 'status', 'scheduledPublishAt']
        update = {k: v for k, v in request.data.items() if k in allowed}
        files_col.update_one({'_id': file_id}, {'$set': update})
        return Response({'message': 'Updated.'})

    def delete(self, request, file_id):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        files_col.delete_one({'_id': file_id})
        return Response({'message': 'Deleted.'})


class PublishFileView(APIView):
    def post(self, request, file_id):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        files_col.update_one({'_id': file_id}, {'$set': {'status': 'published', 'scheduledPublishAt': None}})
        return Response({'message': 'Published.'})


class UnpublishFileView(APIView):
    def post(self, request, file_id):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        files_col.update_one({'_id': file_id}, {'$set': {'status': 'draft'}})
        return Response({'message': 'Unpublished.'})


class ChapterFilesView(APIView):
    def get(self, request):
        role = request.auth.get('role') if request.auth else None
        query = {
            'boardId': request.query_params.get('board'),
            'gradeId': request.query_params.get('grade'),
            'subjectId': request.query_params.get('subject'),
            'chapterId': request.query_params.get('chapter'),
        }
        if role != 'admin':
            query['status'] = 'published'

        all_files = list(files_col.find(query, {'url': 0}))

        by_type = {}
        for f in sorted(all_files, key=lambda x: x.get('uploadedAt', ''), reverse=True):
            tid = f['typeId']
            if tid not in by_type:
                by_type[tid] = serialize_file(f)

        return Response(by_type)
