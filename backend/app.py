from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/submit_task', methods=['POST'])
def submit_task():
    data = request.json
    if not data or 'task' not in data:
        return "Invalid data", 400
    
    task = data['task']
    print(task)
    tasks = ["leetcode", "apply for job"] #placeholder
    return jsonify({"tasks": tasks}), 200
    
@app.route('/log', methods=['POST'])
def log_data():
    data = request.json
    message = data.get('message')
    disobedience_count = data.get('disobedienceCount')
    print(f"Received log: {message}, Disobedience Count: {disobedience_count}") #replace with GenAI calls for narration script later
    return jsonify({"status": "success"}), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
