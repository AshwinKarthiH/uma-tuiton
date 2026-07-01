from rest_framework.views import APIView
from rest_framework.response import Response
from utils.mongo import users_col
from datetime import datetime
import uuid

def serialize_user(u):
    u['id'] = str(u.pop('_id', u.get('id', '')))
    u.pop('password', None)
    return u

class UsersView(APIView):
    def get(self, request):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        users = list(users_col.find({}, {'password': 0}))
        return Response([serialize_user(u) for u in users])

    def post(self, request):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        data = request.data
        user_id = f"user-{uuid.uuid4().hex[:8]}"
        doc = {
            '_id': user_id,
            'id': user_id,
            'name': data['name'],
            'email': data['email'].lower().strip(),
            'password': data['password'],
            'role': data.get('role', 'user'),
            'status': data.get('status', 'active'),
            'assignedBoard': data.get('assignedBoard'),
            'assignedGrades': data.get('assignedGrades', []),
            'createdAt': datetime.now().isoformat(),
        }
        if users_col.find_one({'email': doc['email']}):
            return Response({'error': 'Email already exists.'}, status=400)
        users_col.insert_one(doc)
        doc.pop('password')
        return Response(serialize_user(doc), status=201)

class UserDetailView(APIView):
    def patch(self, request, user_id):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        allowed = ['name', 'email', 'password', 'role', 'status', 'assignedBoard', 'assignedGrades']
        update = {k: v for k, v in request.data.items() if k in allowed}
        users_col.update_one({'_id': user_id}, {'$set': update})
        return Response({'message': 'Updated.'})

    def delete(self, request, user_id):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        if user_id == request.auth.get('user_id'):
            return Response({'error': 'Cannot delete your own account.'}, status=400)
        users_col.delete_one({'_id': user_id})
        return Response({'message': 'Deleted.'})
