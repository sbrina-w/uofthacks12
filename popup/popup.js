// Initialize storage
let currentTask = '';
let taskHistory = [];
let userName = '';

// Load stored data when popup opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['currentTask', 'taskHistory', 'userName'], (result) => {
    if (result.currentTask) {
      currentTask = result.currentTask;
      document.getElementById('taskInput').value = currentTask;
    }
    if (result.taskHistory) {
      taskHistory = result.taskHistory;
      displayTaskHistory();
    }
    if (result.userName) {
      userName = result.userName;
      document.getElementById('nameInput').value = userName;
    }
  });
});

// Save name when it changes
document.getElementById('nameInput').addEventListener('input', (e) => {
  userName = e.target.value.trim();
  chrome.storage.local.set({ userName: userName });
});

document.getElementById("submitTask").addEventListener("click", () => {
  const taskInput = document.getElementById("taskInput").value;
  const name = document.getElementById("nameInput").value.trim();

  if (taskInput.trim() === "") {
    alert("Please enter a task.");
    return;
  }

  // Save to storage before sending to backend
  currentTask = taskInput;
  taskHistory.push({
    task: taskInput,
    name: name,
    timestamp: new Date().toISOString()
  });

  // Update storage
  chrome.storage.local.set({
    currentTask: currentTask,
    taskHistory: taskHistory,
    userName: name
  });

  fetch("http://127.0.0.1:5000/submit_task", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      task: taskInput,
      userName: name 
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to submit task");
      }
      return response.json();
    })
    .then((data) => {
      const tasks = data.tasks;
      displaySteps(tasks);
      chrome.runtime.sendMessage({ action: "updateTasks", tasks: tasks });
    })
    .catch((error) => {
      console.error("Error submitting task:", error);
    });

  document.getElementById("taskInput").value = "";
});

function displaySteps(steps) {
  let stepsDiv = document.getElementById("stepsDiv");
  if (!stepsDiv) {
    stepsDiv = document.createElement("div");
    stepsDiv.id = "stepsDiv";
    document.body.appendChild(stepsDiv);
  }
  const stepsText = "Steps: " + steps;
  stepsDiv.innerHTML = stepsText;
}

function displayTaskHistory() {
  const historyDiv = document.getElementById("taskHistory");
  
  if (taskHistory.length > 0) {
    const historyHTML = taskHistory
      .slice(-5) // Show last 5 tasks
      .map(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        return `<div class="history-item">
          <span>${entry.task}</span>
          <small>${entry.name ? `By: ${entry.name} - ` : ''}${date}</small>
        </div>`;
      })
      .join('');
    
    historyDiv.innerHTML = `
      <h3>Recent Tasks:</h3>
      ${historyHTML}
    `;
  } else {
    historyDiv.innerHTML = '';
  }
}

// Clear history button functionality
document.getElementById("clearHistory").addEventListener("click", () => {
  taskHistory = [];
  chrome.storage.local.set({ taskHistory: [] }, () => {
    displayTaskHistory();
  });
});