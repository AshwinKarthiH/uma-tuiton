from rest_framework_simplejwt.authentication import JWTAuthentication

class MongoJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        # Bypass the Django ORM lookup completely!
        # Return a mock user object so DRF IsAuthenticated passes.
        class MockUser:
            is_authenticated = True
            is_active = True
        return MockUser()
