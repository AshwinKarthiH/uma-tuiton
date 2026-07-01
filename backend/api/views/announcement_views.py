from rest_framework.views import APIView
from rest_framework.response import Response
from utils.mongo import announcements_col
from datetime import datetime
import uuid

def serialize_announcement(a):
    a['id'] = str(a.pop('_id', a.get('id', '')))
    return a

class AnnouncementsView(APIView):
    def get(self, request):
        anns = list(announcements_col.find().sort('createdAt', -1))
        return Response([serialize_announcement(a) for a in anns])

    def post(self, request):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        data = request.data
        ann_id = f"ann-{int(datetime.now().timestamp()*1000)}"
        doc = {
            '_id': ann_id,
            'id': ann_id,
            'title': data.get('title'),
            'message': data.get('message'),
            'type': data.get('type', 'info'),
            'targetRoles': data.get('targetRoles', ['user']),
            'dismissible': data.get('dismissible', True),
            'createdAt': datetime.now().isoformat(),
        }
        announcements_col.insert_one(doc)
        return Response(serialize_announcement(doc), status=201)

class AnnouncementDetailView(APIView):
    def patch(self, request, ann_id):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        allowed = ['title', 'message', 'type', 'targetRoles', 'dismissible', 'active', 'expiry']
        updates = {k: v for k, v in request.data.items() if k in allowed}
        announcements_col.update_one({'_id': ann_id}, {'$set': updates})
        return Response({'message': 'Updated.'})

    def delete(self, request, ann_id):
        if request.auth.get('role') != 'admin':
            return Response({'error': 'Admin only.'}, status=403)
        announcements_col.delete_one({'_id': ann_id})
        return Response({'message': 'Deleted.'})
