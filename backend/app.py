from flask import Flask, request, jsonify
import base64
import os
from openai import OpenAI
from dotenv import load_dotenv
from collections import deque

import sys
sys.path.append('../')
# USE THIS FOR REGULAR TESTING
from ai.tts import speak_text
# USE THIS FOR DEMO / TESTING GOOD VOICE
# from ai.tts_demo import speak_text

load_dotenv()
app = Flask(__name__)

# Configure OpenAI API
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    print("⚠️ WARNING: OPENAI_API_KEY not found in .env file!")
client = OpenAI(api_key=OPENAI_API_KEY)

# Store last 10 AI responses and tasks
MAX_HISTORY_LENGTH = 10
previous_responses = deque(maxlen=MAX_HISTORY_LENGTH)
current_tasks = []
task_index = 0
current_user = "the user"  # Default name if none provided

def get_context_prompt():
    """Create a context prompt from previous responses and current task"""
    task_context = f"{current_user} should be working on: {current_tasks[task_index] if current_tasks else 'No task set'}"
    if not previous_responses:
        return task_context + "\nThis is your first observation."
    
    context = f"{task_context}\n\nYour previous observations were:\n"
    for i, response in enumerate(previous_responses, 1):
        context += f"{i}. {response}\n"
    return context

def analyze_screenshot_with_gpt4o(screenshot_base64):
    try:
        print("\n=== Starting GPT-4o Vision Analysis ===")
        print(f"Current task: {current_tasks[task_index] if current_tasks else 'No task set'}")
        print(f"Current user: {current_user}")
        
        context_prompt = get_context_prompt()
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are a narrator in the style of The Stanley Parable, observing {current_user}'s screen and their assigned task.

Your characteristics:
- Pay close attention to what's on screen and if it matches their assigned task
- When {current_user} is focused on their task: become quietly approving, subtle encouragement
- When {current_user} is distracted or off-task: unleash witty, entertainingly condescending commentary
- Be specific about what you see that indicates focus or distraction
- Maintain continuity with your previous observations
- Always refer to the user in third person as "{current_user}"
- Keep responses to one, concise impactful sentence"""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"{context_prompt}\n\nExamine this new image - what is actually on {current_user}'s screen and how does it relate to what they're supposed to be doing?"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{screenshot_base64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=100
        )
        
        analysis = response.choices[0].message.content
        # print("🤖 GPT-4o says:", analysis)
        
        previous_responses.append(analysis)
        return analysis

    except Exception as e:
        print(f"\n❌ GPT-4o Error: {str(e)}")
        return f"Analysis failed: {str(e)}"

@app.route('/submit_screenshot', methods=['POST'])
def submit_screenshot():
    try:
        print("\n📸 New Screenshot Received")
        global current_user
        
        data = request.json
        if not data or 'screenshot' not in data:
            return jsonify({"error": "No screenshot data provided"}), 400

        # Update current user if provided
        if 'userName' in data and data['userName']:
            current_user = data['userName']
            print(f"👤 User identified as: {current_user}")

        analysis = analyze_screenshot_with_gpt4o(data['screenshot'])
        
        # Speak the analysis using TTS
        try:
            speak_text(analysis)
            print("🔊 Speaking analysis...")
        except Exception as e:
            print(f"❌ TTS Error: {str(e)}")
        
        print(f"✅ Analysis complete: {analysis}\n")
        
        return jsonify({
            "status": "success",
            "analysis": analysis,
            "previous_responses": list(previous_responses)
        }), 200

    except Exception as e:
        error_msg = f"Error: {str(e)}"
        print(f"\n❌ Error: {error_msg}")
        return jsonify({"error": error_msg}), 500

@app.route('/submit_task', methods=['POST'])
def submit_task():
    global current_tasks, task_index, current_user
    
    data = request.json
    if not data or 'task' not in data:
        return jsonify({"error": "Invalid data"}), 400
    
    task = data['task']
    print(f"\n📋 New task submitted: {task}")
    
    # Update current user if provided
    if 'userName' in data and data['userName']:
        current_user = data['userName']
        print(f"👤 User identified as: {current_user}")
    
    # Store just the single input task
    current_tasks = [task]
    task_index = 0
    
    # Clear previous responses when starting new task
    previous_responses.clear()
    
    print(f"Current task set to: {task}")
    
    return jsonify({"tasks": current_tasks}), 200
    
@app.route('/log', methods=['POST'])
def log_data():
    global current_user
    data = request.json
    message = data.get('message')
    disobedience_count = data.get('disobedienceCount')
    
    # Update current user if provided
    if 'userName' in data and data['userName']:
        current_user = data['userName']
    
    print(f"\n📝 Log Entry:")
    #print(f"User: {current_user}")
    print(f"Message: {message}")
    print(f"Disobedience Count: {disobedience_count}")
    return jsonify({"status": "success"}), 200

if __name__ == "__main__":
    print("\n🚀 Starting Flask server...")
    app.run(debug=True, port=5000)