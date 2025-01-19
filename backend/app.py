# app.py
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from collections import deque
from pymongo import MongoClient
from datetime import datetime
import pytz
import os
from flask_cors import CORS
from pathlib import Path
from fuzzywuzzy import fuzz

import sys
sys.path.append('../')
from ai.chatbot import Chatbot
from ai.generateCustomSteps import generate_steps
from ai.tts_new import speak_text
# from ai.tts import speak_text

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
todos_collection = db['todos']
achievements_collection = db['achievements']


def init_leetcode_achievement():
    """Initialize the LeetCode achievement if it doesn't exist"""
    achievement = achievements_collection.find_one({"id": "leetcode_master"})
    if not achievement:
        achievement = {
            "id": "leetcode_master",
            "title": "LeetCode Master",
            "description": "Complete LeetCode programming challenges",
            "progress": 0,
            "total": 50,
            "unlocked": False
        }
        achievements_collection.insert_one(achievement)
        print("✅ LeetCode achievement initialized")
    return achievement


def is_leetcode_task(task_text):
    """Check if a task is related to LeetCode using fuzzy string matching"""
    leetcode_variants = ['leetcode', 'leet code', 'leedcode']
    task_lower = task_text.lower()
    
    # Check for exact substring first
    if any(variant in task_lower for variant in leetcode_variants):
        return True
    
    # Use fuzzy matching for more flexible matching
    return any(fuzz.partial_ratio(variant, task_lower) > 85 for variant in leetcode_variants)


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

@app.route('/achievements/leetcode', methods=['GET'])
def get_leetcode_achievement():
    try:
        achievement = achievements_collection.find_one(
            {"id": "leetcode_master"},
            {"_id": 0}  # Exclude MongoDB's _id field
        )
        if not achievement:
            achievement = init_leetcode_achievement()
            # Remove _id from response if it exists
            achievement.pop('_id', None)
        return jsonify(achievement), 200
    except Exception as e:
        print(f"Error getting LeetCode achievement: {str(e)}")
        return jsonify({"error": str(e)}), 500



@app.route('/todos', methods=['GET'])
def get_todos():
    try:
        todos = list(todos_collection.find(
            {}, 
            {"_id": 0, "id": 1, "text": 1, "done": 1}
        ))
        return jsonify({"todos": todos}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/todos', methods=['POST'])
def add_todo():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({"error": "Invalid data"}), 400
        
        new_todo = {
            "id": str(datetime.now().timestamp()),  # Using timestamp as ID
            "text": data['text'],
            "done": False
        }
        
        todos_collection.insert_one(new_todo)
        # Remove _id from response
        new_todo.pop('_id', None)
        return jsonify({"todo": new_todo}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/todos/<todo_id>', methods=['PUT'])
def toggle_todo(todo_id):
    try:
        todo = todos_collection.find_one({"id": todo_id})
        if not todo:
            return jsonify({"error": "Todo not found"}), 404
        
        new_status = not todo['done']
        todos_collection.update_one(
            {"id": todo_id},
            {"$set": {"done": new_status}}
        )
        return jsonify({"status": "success", "done": new_status}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/todos/<todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    try:
        result = todos_collection.delete_one({"id": todo_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Todo not found"}), 404
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/chat', methods=['POST'])
def handle_chat():
    try:
        data = request.json
        if not data or 'message' not in data:
            return jsonify({"error": "No message provided"}), 400

        message = data['message']
        screenshot = data.get('screenshot')
        
        analysis = chatbot.analyze_with_context(message, screenshot)
        audio_path = speak_text(analysis)
        
        return jsonify({
            "status": "success",
            "analysis": analysis,
            "audio_path": audio_path,
            "previous_responses": list(chatbot.previous_responses)
        }), 200

    except Exception as e:
        print(f"\n❌ Error: {error_msg}")
        return jsonify({"error": str(e)}), 500

# In your Flask app
@app.route('/submit_task', methods=['POST'])
def submit_task():
    try:
        data = request.json
        if not data or 'task' not in data:
            return jsonify({"error": "No task provided"}), 400

        task = data['task']
        if task == "get a job":
            custom_steps = ["leetcode", "job application"]
        else:
            custom_steps = generate_steps(task)


        achievement_updated = False
        achievement = None

        # Check if this is a LeetCode task
        if is_leetcode_task(task):
            # Get current achievement state
            achievement = achievements_collection.find_one({"id": "leetcode_master"})
            
            if not achievement:
                achievement = init_leetcode_achievement()

            # Update achievement progress
            new_progress = achievement['progress'] + 1
            achievements_collection.update_one(
                {"id": "leetcode_master"},
                {
                    "$set": {
                        "progress": new_progress,
                        "unlocked": new_progress >= achievement['total']
                    }
                }
            )
            
            # Get updated achievement for response
            achievement = achievements_collection.find_one(
                {"id": "leetcode_master"},
                {"_id": 0}
            )
            achievement_updated = True

        # Record the task
        activities_collection.insert_one({
            "task": task,
            "steps": custom_steps,
            "timestamp": datetime.now(pytz.UTC)
        })

        if 'userName' in data and data['userName']:
            chatbot.update_user(data['userName'])
        chatbot.update_tasks([task])

        response = {
            "status": "success",
            "message": "Task submitted successfully",
            "steps": custom_steps
        }

        if achievement_updated:
            response["achievement"] = achievement

        return jsonify(response), 200

    except Exception as e:
        print(f"Error in /submit_task: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

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

def initialize_achievements():
    init_leetcode_achievement()
    print("✅ Achievements initialized")


# @app.route('/chat', methods=['POST'])
# def handle_chat():
#     try:
#         data = request.json
#         if not data or 'message' not in data:
#             return jsonify({"error": "No message provided"}), 400

#         # Update current user if provided
#         if 'userName' in data and data['userName']:
#             chatbot.update_user(data['userName'])

#         # Get the message and screenshot
#         message = data['message']
#         screenshot = data.get('screenshot')
        
#         # Send to chatbot for analysis
#         analysis = chatbot.analyze_with_context(message, screenshot)
        
#         # Speak the analysis using TTS
#         try:
#             speak_text(analysis)
#         except Exception as e:
#             print(f"❌ TTS Error: {str(e)}")
        
#         return jsonify({
#             "status": "success",
#             "analysis": analysis,
#             "previous_responses": list(chatbot.previous_responses)
#         }), 200

#     except Exception as e:
#         error_msg = f"Error: {str(e)}"
#         print(f"\n❌ Error: {error_msg}")
#         return jsonify({"error": error_msg}), 500


if __name__ == "__main__":
    initialize_achievements()
    print("🚀 Starting Flask server...")
    app.run(debug=True, port=5000)
