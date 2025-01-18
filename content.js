let inactivityTimer;
let typedBuffer = "";
let hasTyped = false;
let visitedProblemPage = false; 
const profanities = [
  "shut up",
  "damn",
  "stupid",
  "idiot",
  "fool",
  "moron",
  "fuck",
  "shit",
  "bitch",
  "ass"
];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTracking") {
    startTracking();
    sendResponse({ status: "trackingStarted" });
    return true;
  }
});

// detect if the user is typing in a resume or job application form
// document.addEventListener('input', (event) => {
//     if (document.URL.includes("docs.google.com")) {
//       if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
//         chrome.runtime.sendMessage({ task: "editing_resume" });
//       }
//     }
//     if (document.URL.includes("jobportal.com")) {
//       if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
//         chrome.runtime.sendMessage({ task: "filling_out_application" });
//       }
//     }
//   });

// narration trigger for inactivity
// function resetInactivityTimer() {
//   clearTimeout(inactivityTimer);
//   inactivityTimer = setTimeout(() => {
//     console.log("Inactive for 1 minute!");
//     try {
//       chrome.runtime.sendMessage({
//         action: "sendToBackend",
//         message: "The user has disobeyed the instruction. The user is dilly dallying and should be reminded to get back on task."
//       });
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   }, 60000);
// }


function isLeetCodeProblemPage() {
  console.log('tried to determine if it is a leetcode page')
  return window.location.href.includes("leetcode.com/problems/") && !window.location.href.includes("/solutions/");
}

function isLeetCodeSolutionsPage() {
  console.log('tried to determine if it is a leetcode solutions page')
  return window.location.href.includes("leetcode.com/problems/") && window.location.href.includes("/solutions/");
}

function startTracking() {
  document.addEventListener("mousemove", () => {
    // resetInactivityTimer();
  });
  
  document.addEventListener("click", () => {
    console.log("Mouse clicked!");
    if (isLeetCodeSolutionsPage() && visitedProblemPage && !hasTyped) {
      console.log("jumping straight to solution");
      chrome.runtime.sendMessage({
        action: "sendToBackend",
        message: "The user has disobeyed the instruction. The user is attempting to cheat their way through the task by opening a leetcode solutions without attempting the problem!"
      });
    }
    // resetInactivityTimer();
  });
  
  document.addEventListener("keydown", (event) => {
    console.log("Key pressed:", event.key);
    // resetInactivityTimer();
  
    typedBuffer += event.key;
    if (typedBuffer.length > 20) {
      typedBuffer = typedBuffer.slice(-20); 
    }
  
    for (let word of profanities) {
      if (typedBuffer.toLowerCase().includes(word)) {
        console.log("Detected profanities");
        // trigger to narration here for profanity/insults towards narrator
        chrome.runtime.sendMessage({
          action: "sendToBackend",
          message: "The user has disobeyed the instruction. The user is getting bold and insulting the narrator with profanities. This behaviour is unacceptable and the user must be reminded of their role to listen and finish their task."
        });
        typedBuffer = "";
        break;
      }
    }

    if (isLeetCodeProblemPage()) {
      if (typedBuffer.trim() === "") {
        hasTyped = false; // user hasn't typed anything yet, did not attempt the problem
      } else {
        hasTyped = true; // user has typed something, indicating an attempt
      }
      visitedProblemPage = true;
    }
  });
}


  