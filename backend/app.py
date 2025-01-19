from flask import Flask, request, jsonify
import base64
import os
from dotenv import load_dotenv
from collections import deque

import sys
sys.path.append('../')
from ai.chatbot import Chatbot
from ai.tts import speak_text

load_dotenv()
app = Flask(__name__)

# Initialize chatbot
chatbot = Chatbot()

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

@app.route('/submit_task', methods=['POST'])
def submit_task():
    data = request.json
    if not data or 'task' not in data:
        return jsonify({"error": "Invalid data"}), 400
    
    task = data['task']
    
    # Update current user if provided
    if 'userName' in data and data['userName']:
        chatbot.update_user(data['userName'])
    
    chatbot.update_tasks([task])
    
    return jsonify({"tasks": [task]}), 200

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
