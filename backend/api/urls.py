from django.urls import path
from .views import auth_views, content_views, file_views, user_views, log_views, announcement_views

urlpatterns = [
    # Auth
    path('auth/login/', auth_views.LoginView.as_view()),
    path('auth/logout/', auth_views.LogoutView.as_view()),
    path('auth/me/', auth_views.MeView.as_view()),
    path('auth/refresh/', auth_views.RefreshView.as_view()),

    # Content
    path('boards/', content_views.BoardsView.as_view()),
    path('boards/<str:board_id>/grades/', content_views.GradesView.as_view()),
    path('boards/<str:board_id>/grades/<str:grade_id>/', content_views.GradeDetailView.as_view()),
    path('boards/<str:board_id>/grades/<str:grade_id>/subjects/', content_views.SubjectsView.as_view()),
    path('boards/<str:board_id>/grades/<str:grade_id>/subjects/<str:subject_id>/', content_views.SubjectDetailView.as_view()),
    path('boards/<str:board_id>/grades/<str:grade_id>/subjects/<str:subject_id>/chapters/', content_views.ChaptersView.as_view()),
    path('boards/<str:board_id>/grades/<str:grade_id>/subjects/<str:subject_id>/chapters/<str:chapter_id>/', content_views.ChapterDetailView.as_view()),

    # Files
    path('files/', file_views.FilesView.as_view()),
    path('files/<str:file_id>/', file_views.FileDetailView.as_view()),
    path('files/<str:file_id>/publish/', file_views.PublishFileView.as_view()),
    path('files/<str:file_id>/unpublish/', file_views.UnpublishFileView.as_view()),
    path('files/chapter/', file_views.ChapterFilesView.as_view()),

    # Users
    path('users/', user_views.UsersView.as_view()),
    path('users/<str:user_id>/', user_views.UserDetailView.as_view()),

    # Logs
    path('logs/', log_views.LogsView.as_view()),
    path('logs/export/', log_views.ExportLogsView.as_view()),
    path('logs/<str:log_id>/', log_views.LogDetailView.as_view()),

    # Announcements
    path('announcements/', announcement_views.AnnouncementsView.as_view()),
    path('announcements/<str:ann_id>/', announcement_views.AnnouncementDetailView.as_view()),
]
