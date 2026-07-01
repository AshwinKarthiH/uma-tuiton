from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from utils.mongo import users_col
from bson import ObjectId
import bcrypt

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')

        user = users_col.find_one({'email': email})

        if not user:
            return Response({'error': 'Invalid email or password.'}, status=401)

        if user.get('status') != 'active':
            return Response({'error': 'Your account has been deactivated. Contact admin.'}, status=403)

        # Check password (support both plain and hashed)
        stored_pw = user.get('password', '')
        pw_match = False
        if stored_pw.startswith('$2b$') or stored_pw.startswith('$2a$'):
            pw_match = bcrypt.checkpw(password.encode(), stored_pw.encode())
        else:
            pw_match = stored_pw == password  # plain text for default accounts

        if not pw_match:
            return Response({'error': 'Invalid email or password.'}, status=401)

        # Generate JWT
        user_id = str(user['_id'])
        from rest_framework_simplejwt.tokens import RefreshToken

        # Build payload
        refresh = RefreshToken()
        refresh['user_id'] = user_id
        refresh['email'] = user['email']
        refresh['role'] = user['role']
        refresh['name'] = user['name']
        refresh['assignedBoard'] = user.get('assignedBoard')
        refresh['assignedGrades'] = user.get('assignedGrades', [])

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user_id,
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'assignedBoard': user.get('assignedBoard'),
                'assignedGrades': user.get('assignedGrades', []),
            }
        })

class MeView(APIView):
    def get(self, request):
        token = request.auth
        return Response({
            'id': token.get('user_id'),
            'name': token.get('name'),
            'email': token.get('email'),
            'role': token.get('role'),
            'assignedBoard': token.get('assignedBoard'),
            'assignedGrades': token.get('assignedGrades', []),
        })

class LogoutView(APIView):
    def post(self, request):
        # JWT is stateless — client deletes tokens
        return Response({'message': 'Logged out successfully.'})

class RefreshView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        from rest_framework_simplejwt.views import TokenRefreshView
        return TokenRefreshView.as_view()(request._request)
