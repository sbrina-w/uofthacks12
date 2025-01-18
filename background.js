// background.js
let disobedienceCounter = 0;
let taskIndex = 0;
let tasks = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);
  if (message.action === "updateTasks") {
    console.log('received tasks', message.tasks);
    tasks = message.tasks;
    taskIndex = 0;
    startNextTask();
    sendResponse({ status: "tasksUpdated"});
    return true;
  } else if (message.action === "sendToBackend") {
    sendToBackend(message.data);
    return true;
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
    const tab = tabs[0]; // Get the active tab
    if (tab.url && tab.url.includes("leetcode.com/problems/")) {
      sendToBackend("The user has obeyed the instruction. The user has opened the leetcode page.");
      chrome.runtime.sendMessage({ action: "startTracking" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError.message);
        } else {
          console.log("Response from listener:", response.status); // Logs "trackingStarted"
        }
      });
    } else {
      console.log("Disobedience detected: LeetCode URL not found.");
      sendToBackend("The user has disobeyed the instruction. The user has not opened the leetcode tab.");
      setTimeout(() => {
        checkLeetCodeTask();
      }, 10000);
    }
    if (tab.url && tab.url.includes("leetcode.com/problems/") && tab.url.includes("/submissions/")) {
      const statusElement = document.querySelector('.submission-result');
      // check if the submitted leetcode solution was accepted
      if (statusElement && statusElement.textContent.includes('Accepted')) {
        console.log("Submission Accepted!");
        sendToBackend("The user has obeyed the instruction. The user has successfully solved the leetcode problem and will move onto the next task.")
        // finished task, reset disobedience and move onto the next one
        disobedienceCounter = 0;
        taskIndex++;
        startNextTask();
      } else {
        console.log("Submission Not Accepted.");
        sendToBackend("The user has obeyed the instruction. The user has not successfully solved the problem and will need to keep trying until they solve it. The user deserves some motivation and encouragement for trying.")
      }
      setTimeout(() => {
        checkLeetCodeTask();
      }, 10000);
    }
  });
}

function checkJobApplicationTask() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tab.url && tab.url.includes("jobportal.com")) {
      console.log("Job application task is in progress.");
      disobedienceCounter = 0;
      taskIndex++;
      startNextTask();
    } else {
      disobedienceCounter++;
      console.log("Disobedience detected: Job portal URL not found.");
      sendToBackend("Job application task disobeyed.");
      setTimeout(() => {
        checkJobApplicationTask();
      }, 10000);
    }
  });
}

function sendToBackend(message) {
  if (message.includes("disobeyed")) {
    disobedienceCounter++;
  }
  fetch('http://127.0.0.1:5000/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      disobedienceCount: disobedienceCounter,
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log("Data sent to backend:", data);
    })
    .catch(error => {
      console.error("Error sending data to backend:", error);
    });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    checkDistractions(tab.url);
  });
});

function checkDistractions(url) {
  if (url.includes("youtube.com") || url.includes("twitter.com")) {
    sendToBackend("The user has disobeyed the instruction. The user has chosen to indulge in worthless brainrot entertainment.");
  }
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