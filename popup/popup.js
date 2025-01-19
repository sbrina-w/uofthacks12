// Initialize storage
let currentTask = '';
let taskHistory = [];
let userName = '';

// Load stored data when popup opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['currentTask', 'taskHistory', 'userName'], (result) => {
    if (result.userName) {
      userName = result.userName;
      updateNameDisplay(userName);
    }
    if (result.taskHistory) {
      taskHistory = result.taskHistory;
      displayTaskHistory();
      // Show the most recent task as current task
      if (taskHistory.length > 0) {
        updateCurrentTaskDisplay(taskHistory[taskHistory.length - 1].task);
      }
    }
  });

  // Set up name editing functionality
  const nameDisplay = document.getElementById('nameDisplay');
  const nameInputContainer = document.getElementById('nameInputContainer');
  const nameInput = document.getElementById('nameInput');
  const saveName = document.getElementById('saveName');
  const editButton = document.getElementById('editButton');

  editButton.addEventListener('click', () => {
    nameDisplay.style.display = 'none';
    nameInputContainer.style.display = 'flex';
    nameInputContainer.style.flexDirection = 'column';
    nameInputContainer.style.gap = '8px';
    nameInput.value = userName;
    nameInput.focus();
  });

  saveName.addEventListener('click', () => {
    const newName = nameInput.value.trim();
    if (newName) {
      userName = newName;
      chrome.storage.local.set({ userName: userName }, () => {
        updateNameDisplay(userName);
        nameDisplay.style.display = 'flex';
        nameInputContainer.style.display = 'none';
        chrome.runtime.sendMessage({ 
          action: "updateTasks",
          userName: userName,
          tasks: []
        });
      });
    }
  });

  nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveName.click();
    }
  });

  // Set up task input
  const taskInput = document.getElementById('taskInput');
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('submitTask').click();
    }
  });
});

function updateNameDisplay(name) {
  const nameText = document.querySelector('.name-text');
  if (nameText) {
    nameText.textContent = name || 'Name not set';
  }
}

function updateCurrentTaskDisplay(task) {
  const currentTaskDiv = document.getElementById('currentTask');
  const currentTaskText = document.getElementById('currentTaskText');
  if (task) {
    currentTaskText.textContent = task;
    currentTaskDiv.classList.remove('hidden');
  } else {
    currentTaskDiv.classList.add('hidden');
  }
}

// Add event listener to the document for delete buttons
document.addEventListener('click', function(e) {
  if (e.target.closest('.delete-button')) {
    const historyItem = e.target.closest('.history-item');
    const timestamp = historyItem.getAttribute('data-timestamp');
    deleteHistoryItem(timestamp);
  }
});

function deleteHistoryItem(timestamp) {
  taskHistory = taskHistory.filter(item => item.timestamp !== timestamp);
  chrome.storage.local.set({ taskHistory: taskHistory }, () => {
    displayTaskHistory();
    // Update current task display after deletion
    if (taskHistory.length > 0) {
      updateCurrentTaskDisplay(taskHistory[taskHistory.length - 1].task);
    } else {
      updateCurrentTaskDisplay(null);
    }
  });
}

document.getElementById("submitTask").addEventListener("click", () => {
  const taskInput = document.getElementById("taskInput");
  const taskValue = taskInput.value.trim();

  if (taskValue === "") {
    alert("Please enter a task.");
    return;
  }

  if (!userName) {
    alert("Please set your name first.");
    return;
  }

  fetch("http://127.0.0.1:5000/submit_task", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      task: taskValue,
      userName: userName
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to submit task");
      }
      return response.json();
    })
    .then(data => {
      if (data.status === "success") {
        const newTask = {
          task: taskValue,
          name: userName,
          timestamp: new Date().toISOString(),
          steps: data.steps  // Use the steps from GPT-4o
        };
        
        taskHistory.push(newTask);
        updateCurrentTaskDisplay(taskValue);

        // Update storage
        chrome.storage.local.set({
          taskHistory: taskHistory
        }, () => {
          taskInput.value = "";
          displayTaskHistory();
        });

        chrome.runtime.sendMessage({ 
          action: "updateTasks", 
          tasks: data.steps,
          userName: userName 
        });
      } else {
        console.error("Error:", data.message);
        alert("Failed to generate steps for task");
      }
    })
    .catch(error => {
      console.error("Error submitting task:", error);
      alert("Error submitting task");
    });
});

function displayTaskHistory() {
  const historyItemsDiv = document.querySelector('#taskHistory .history-items');
  
  if (taskHistory.length > 0) {
    const historyHTML = taskHistory
      .slice(-5) // Show last 5 tasks
      .reverse() // Show newest first
      .map(entry => {
        const date = new Date(entry.timestamp).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        // Add bullet points for steps
        const stepsHTML = entry.steps 
          ? `<div class="history-steps">
              ${entry.steps.map(step => `<li>${step}</li>`).join('')}
             </div>`
          : '';

          return `<div class="history-item" data-timestamp="${entry.timestamp}">
          <div class="history-content">
            <span>${entry.task}</span>
            ${stepsHTML}
            <div class="history-details">
              <small>${date}</small>
            </div>
          </div>
          <button class="delete-button" aria-label="Delete task">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>`;
      })
      .join('');
    
    historyItemsDiv.innerHTML = historyHTML;
  } else {
    historyItemsDiv.innerHTML = `
      <div style="text-align: center; color: #6c757d; padding: 20px 0;">
        No tasks yet
      </div>`;
  }
}

// Clear history button functionality
document.getElementById("clearHistory").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all history?")) {
    taskHistory = [];
    chrome.storage.local.set({ taskHistory: [] }, () => {
      displayTaskHistory();
      updateCurrentTaskDisplay(null);
    });
  }
});