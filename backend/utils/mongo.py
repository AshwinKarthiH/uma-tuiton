from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')

client = MongoClient(MONGO_URI)
db = client['uma_tuition_db']

users_col = db['users']
boards_col = db['boards']
files_col = db['files']
logs_col = db['logs']
announcements_col = db['announcements']

print(f"✅ MongoDB connected to: {MONGO_URI}")
