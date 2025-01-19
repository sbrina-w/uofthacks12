// background.js
let disobedienceCounter = 0;
let taskIndex = 0;
let tasks = [];
let userName = '';

let connectedPorts = [];

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "counterMonitor") {
    connectedPorts.push(port);
    
    port.postMessage({ 
      type: "counterUpdate", 
      value: disobedienceCounter 
    });

    port.onDisconnect.addListener(() => {
      connectedPorts = connectedPorts.filter(p => p !== port);
    });
  }
});

// Load userName from storage
chrome.storage.local.get(['userName'], (result) => {
  if (result.userName) {
    userName = result.userName;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);
  if (message.action === "updateTasks") {
    tasks = message.tasks;
    if (message.userName) {
      userName = message.userName;
    }
    taskIndex = 0;
    startNextTask();
    sendResponse({ status: "tasksUpdated" });
  } else if (message.action === "sendToBackend") {
    sendToBackend(message.message);
  } else if (message.action === "submissionResult") {
    console.log("Submission result received by background:", message.result);
    if (message.result) {
      taskIndex++;
      disobedienceCounter = 0;
      notifyCounterChange();
      sendToBackend(message.message);
      startNextTask();
    }
  } else if (message.action === "getDisobeyCounter") {
    sendResponse({ counter: disobedienceCounter });
  } else if (message.action === "demoComplete") {
    sendToBackend(message.message);
    // Clear any ongoing tasks or checks
    tasks = [];
    taskIndex = 0;
    disobedienceCounter = 0;
    // Stop screenshot capture or any other ongoing processes
    clearInterval(screenshotInterval);
}
});

function startNextTask() {
  console.log("Starting next task called...");
  if (taskIndex < tasks.length) {
    const currentTask = tasks[taskIndex];
    console.log(`Starting task: ${currentTask}`);
    sendToBackend(`The user has now started the task ${currentTask}`);
    handleTask(currentTask);
  }
}

function handleTask(task) {
  if (task === "leetcode") {
    checkLeetCodeTask();
  } else if (task === "job application") {
    checkJobApplicationTask();
  }
}

function checkLeetCodeTask() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      console.log("[Error] No active tab found");
      setTimeout(checkLeetCodeTask, 3000);
      return;
    }

    const tab = tabs[0];
    if (!tab) {
      console.log("[Error] First tab is undefined");
      setTimeout(checkLeetCodeTask, 3000);
      return;
    }

    if (!tab.url) {
      console.log("[Error] Tab URL is undefined");
      setTimeout(checkLeetCodeTask, 3000);
      return;
    }
    if (tab.url && tab.url.includes("leetcode.com/problems/")) {
      console.log("LeetCode problems tab found, starting tracking.");
      disobedienceCounter = 0;
      notifyCounterChange();
      sendToBackend(`${userName} has obeyed the instruction. ${userName} has opened the leetcode page.`);
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
      console.log("LeetCode tab not found, checking again in 3 seconds.");
      // sendToBackend(`${userName} has disobeyed the instruction. ${userName} has not opened the leetcode tab.`);
      setTimeout(() => checkLeetCodeTask(), 3000);
    }
  });
}

function checkJobApplicationTask() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      console.log("[Error] No active tab found");
      setTimeout(checkJobApplicationTask, 3000);
      return;
    }

    const tab = tabs[0];
    if (!tab) {
      console.log("[Error] First tab is undefined");
      setTimeout(checkJobApplicationTask, 3000);
      return;
    }

    if (!tab.url) {
      console.log("[Error] Tab URL is undefined");
      setTimeout(checkJobApplicationTask, 3000);
      return;
    }
    if (tab.url && tab.url.includes("job-application")) {
      disobedienceCounter = 0;
      notifyCounterChange();
      taskIndex++;
      startNextTask();
      sendToBackend(`${userName} has obeyed the instruction. ${userName} has opened the job application page.`);
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
      console.log("Job application tab not found, checking again in 10 seconds.");
      //sendToBackend(`${userName} has disobeyed the instruction. ${userName} has not opened the job application tab.`);
      setTimeout(() => checkLeetCodeTask(), 5000);
    }
  });
}

// Old sendToBackend function

// function sendToBackend(message) {
//   if (message.includes("disobeyed")) disobedienceCounter++;
//   fetch("http://127.0.0.1:5000/log", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ 
//       message, 
//       disobedienceCount: disobedienceCounter,
//       userName: userName 
//     }),
//   })
//     .then((response) => response.json())
//     .then((data) => console.log("Data sent to backend:", data))
//     .catch((error) => console.error("Error sending data to backend:", error));
// }

function sendToBackend(message) {
  if (message.includes("disobeyed")) disobedienceCounter++;
  notifyCounterChange();
  fetch("http://127.0.0.1:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      message,
      screenshot: currentScreenshot,
      disobedienceCount: disobedienceCounter,
      userName: userName 
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Chatbot response:", data.analysis);
    })
    .catch((error) => console.error("Error:", error));
}

let currentScreenshot = null;

function captureScreenshot() {
  console.log("📸 Taking screenshot...");
  chrome.tabs.captureVisibleTab(null, {format: 'jpeg', quality: 50}, function(dataUrl) {
    console.log("✅ Screenshot taken");
    currentScreenshot = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
  });
}

function notifyCounterChange() {
  connectedPorts.forEach(port => {
    port.postMessage({ 
      type: "counterUpdate", 
      value: disobedienceCounter 
    });
  });
}

// Take screenshots every 10 seconds
console.log("🚀 Starting screenshot system...");
setInterval(captureScreenshot, 100000);

// Old capturseScreenshot function

// function captureScreenshot() {
//   console.log("📸 Taking screenshot...");
//   chrome.tabs.captureVisibleTab(null, {format: 'jpeg', quality: 50}, function(dataUrl) {
//       console.log("✅ Screenshot taken");
//       const base64Image = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
      
//       fetch('http://127.0.0.1:5000/submit_screenshot', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//               screenshot: base64Image,
//               userName: userName
//           }),
//       })
//       .then(response => response.json())
//       .then(data => {
//           console.log("gpt Analysis:", data.analysis);
//           sendToBackend(`gpt analyzed: ${data.analysis}`);
//       })
//       .catch(error => {
//           console.error("Error:", error);
//       });
//   });
// }



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