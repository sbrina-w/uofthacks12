from flask import Flask, request

app = Flask(__name__)

@app.route('/submit_task', methods=['POST'])
def submit_task():
    data = request.json
    if not data or 'task' not in data:
        return "Invalid data", 400
    
    task = data['task']
    print(task)
    return "Task received", 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
