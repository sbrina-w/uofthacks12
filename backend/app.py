from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/submit_task', methods=['POST'])
def submit_task():
    data = request.json
    if not data or 'task' not in data:
        return jsonify({"error": "Invalid data"}), 400
    
    task = data['task']
    print(task)
    steps = get_steps(task)
    
    return jsonify({"steps": steps}), 200

def get_steps(task):
    return "placeholder for " + task

if __name__ == "__main__":
    app.run(debug=True, port=5000)
