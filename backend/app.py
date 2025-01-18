from flask import Flask, request, jsonify
import base64
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("⚠️ WARNING: GEMINI_API_KEY not found in .env file!")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def analyze_screenshot_with_gemini(screenshot_base64):
    try:
        print("\n=== Starting Gemini Analysis ===")
        image_data = base64.b64decode(screenshot_base64)
        
        response = model.generate_content([
            "What is shown in this screenshot? Is the user working on LeetCode, job applications, or something else?",
            {"mime_type": "image/jpeg", "data": image_data}
        ])
        
        print("🤖 Gemini says:", response.text)
        return response.text

    except Exception as e:
        print(f"\n❌ Gemini Error: {str(e)}")
        return f"Analysis failed: {str(e)}"

@app.route('/submit_screenshot', methods=['POST'])
def submit_screenshot():
    try:
        print("\n📸 New Screenshot Received")
        
        data = request.json
        if not data or 'screenshot' not in data:
            return jsonify({"error": "No screenshot data provided"}), 400

        analysis = analyze_screenshot_with_gemini(data['screenshot'])
        print(f"✅ Analysis complete: {analysis}\n")
        
        return jsonify({
            "status": "success",
            "analysis": analysis
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
    print(f"\n📋 New task submitted: {task}")
    tasks = ["leetcode", "apply for job"]
    return jsonify({"tasks": tasks}), 200
    
@app.route('/log', methods=['POST'])
def log_data():
    data = request.json
    message = data.get('message')
    disobedience_count = data.get('disobedienceCount')
    print(f"\n📝 Log Entry:")
    print(f"Message: {message}")
    print(f"Disobedience Count: {disobedience_count}")
    return jsonify({"status": "success"}), 200

if __name__ == "__main__":
    print("\n🚀 Starting Flask server...")
    app.run(debug=True, port=10000)