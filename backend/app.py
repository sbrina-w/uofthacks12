from flask import Flask, request, jsonify
from dotenv import load_dotenv
from collections import deque
from pymongo import MongoClient
from datetime import datetime
import pytz
import os
from flask_cors import CORS
from pathlib import Path


import sys
sys.path.append('../')
from ai.chatbot import Chatbot
from ai.tts import speak_text

env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

app = Flask(__name__)
CORS(app)

# Initialize chatbot
chatbot = Chatbot()

# MongoDB setup
MONGODB_URI = os.getenv('MONGODB_URI')
if not MONGODB_URI:
    print("⚠️ WARNING: MONGODB_URI not found in .env file!")
client = MongoClient(MONGODB_URI, tls=True, tlsAllowInvalidCertificates=True)
db = client['procrastinator']
activities_collection = db['activities']

def record_activity(activity_type, description, metadata=None):
    """Record an activity in MongoDB"""
    try:
        activity = {
            "type": activity_type,
            "description": description,
            "timestamp": datetime.now(pytz.UTC),
            "metadata": metadata or {}
        }
        result = activities_collection.insert_one(activity)
        print(f"✅ Activity recorded: {activity_type}")
        return str(result.inserted_id)
    except Exception as e:
        print(f"❌ Error recording activity: {str(e)}")
        return None


@app.route('/submit_screenshot', methods=['POST'])
def submit_screenshot():
    try:
        data = request.json
        if not data or 'screenshot' not in data:
            return jsonify({"error": "No screenshot data provided"}), 400

        # Update current user if provided
        if 'userName' in data and data['userName']:
            chatbot.update_user(data['userName'])

        analysis = chatbot.analyze_screenshot(data['screenshot'])
        
        # Speak the analysis using TTS
        try:
            speak_text(analysis)
        except Exception as e:
            print(f"❌ TTS Error: {str(e)}")
        
        return jsonify({
            "status": "success",
            "analysis": analysis,
            "previous_responses": list(chatbot.previous_responses)
        }), 200

    except Exception as e:
        error_msg = f"Error: {str(e)}"
        print(f"\n❌ Error: {error_msg}")
        return jsonify({"error": error_msg}), 500

# In your Flask app
@app.route('/submit_task', methods=['POST'])
def submit_task():
    data = request.json
    if not data or 'task' not in data:
        return jsonify({"error": "Invalid data"}), 400
    
    task = data['task']
    
    # Add task to MongoDB
    try:
        activities_collection.insert_one({
            "task": task,
            "timestamp": datetime.now(pytz.UTC)
        })
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")
    
    # Rest of your existing code...
    if 'userName' in data and data['userName']:
        chatbot.update_user(data['userName'])
    chatbot.update_tasks([task])
    
    return jsonify({"status": "success"}), 200

# Add route to get tasks
@app.route('/get_tasks', methods=['GET'])
def get_tasks():
    try:
        # Get last 10 tasks, newest first
        tasks = list(activities_collection.find(
            {}, 
            {"_id": 0, "task": 1, "timestamp": 1}
        ).sort("timestamp", -1).limit(10))
        return jsonify({"tasks": tasks}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/log', methods=['POST'])
def log_data():
    data = request.json
    message = data.get('message')
    
    if 'userName' in data and data['userName']:
        chatbot.update_user(data['userName'])
    
    print(f"\n📝 Log Entry: {message}")
    return jsonify({"status": "success"}), 200

if __name__ == "__main__":
    print("\n🚀 Starting Flask server...")
    app.run(debug=True, port=5000)
