// background.js
let disobedienceCounter = 0;
let taskIndex = 0;
let tasks = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);
  if (message.action === "updateTasks") {
    tasks = message.tasks;
    taskIndex = 0;
    startNextTask();
    sendResponse({ status: "tasksUpdated" });
  } else if (message.action === "sendToBackend") {
    sendToBackend(message.message);
  }
});

function startNextTask() {
  if (taskIndex < tasks.length) {
    const currentTask = tasks[taskIndex];
    console.log(`Starting task: ${currentTask}`);
    handleTask(currentTask);
  }
}

function handleTask(task) {
  if (task === "leetcode") {
    checkLeetCodeTask();
  } else if (task === "apply for job") {
    checkJobApplicationTask();
  }
}

function checkLeetCodeTask() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab.url && tab.url.includes("leetcode.com/problems/")) {
      disobedienceCounter = 0;
      sendToBackend("The user has obeyed the instruction. The user has opened the leetcode page.");
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          files: ["content.js"],
        },
        () => {
          chrome.tabs.sendMessage(tab.id, { action: "startTracking" }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
            } else {
              console.log("Response from content.js:", response?.status);
            }
          });
        }
      );
    } else {
      console.log("LeetCode tab not found, checking again in 10 seconds.");
      sendToBackend("The user has disobeyed the instruction. The user has not opened the leetcode tab.");
      setTimeout(() => checkLeetCodeTask(), 10000);
    }
  });
}

function sendToBackend(message) {
  if (message.includes("disobeyed")) disobedienceCounter++;
  fetch("http://127.0.0.1:5000/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, disobedienceCount: disobedienceCounter }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Data sent to backend:", data))
    .catch((error) => console.error("Error sending data to backend:", error));
}

function captureScreenshot() {
  console.log("📸 Taking screenshot...");
  chrome.tabs.captureVisibleTab(null, {format: 'jpeg', quality: 50}, function(dataUrl) {
      console.log("✅ Screenshot taken");
      const base64Image = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
      
      fetch('http://127.0.0.1:5000/submit_screenshot', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              screenshot: base64Image
          }),
      })
      .then(response => response.json())
      .then(data => {
          console.log("Gemini Analysis:", data.analysis);
          sendToBackend(`Gemini analyzed: ${data.analysis}`);
      })
      .catch(error => {
          console.error("Error:", error);
      });
  });
}

// Take screenshots every 5 seconds
console.log("🚀 Starting screenshot system...");
setInterval(captureScreenshot, 5000);