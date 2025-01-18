if (!window.__contentScriptInitialized) {
  window.__contentScriptInitialized = true;
(() => {
  let inactivityTimer;
  let typedBuffer = "";
  let hasTyped = false;
  let visitedProblemPage = false;
  let currentUrl = window.location.href;
  let isTracking = false;

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
    "ass",
  ];

  if (!window.__observerInitialized) {
    window.__observerInitialized = true;
  
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        console.log("URL changed (via MutationObserver):", window.location.href);
        handleUrlChange(window.location.href);
      }
    });
  
    observer.observe(document, { subtree: true, childList: true });
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startTracking") {
      console.log("Tracking started on this page.");
      startTracking();
      sendResponse({ status: "trackingStarted" });
    }
  });

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    console.log("pushState detected:", window.location.href);
    handleUrlChange(window.location.href);
  };

  window.addEventListener("popstate", () => {
    console.log("popstate detected:", window.location.href);
    handleUrlChange(window.location.href);
  });

  function handleUrlChange(newUrl) {
    if (newUrl !== currentUrl) {
      console.log("URL changed from", currentUrl, "to", newUrl);
      currentUrl = newUrl;
      console.log(isLeetCodeSolutionsPage(), hasTyped)
      if (isLeetCodeSolutionsPage() && visitedProblemPage && !hasTyped) {
        console.log("User jumped straight to the solution without attempting the problem.");
        chrome.runtime.sendMessage({
          action: "sendToBackend",
          message:
            "The user has disobeyed the instruction. The user is attempting to cheat their way through the task by opening a LeetCode solution without attempting the problem!",
        });
      }
    }
  }

  function isLeetCodeProblemPage() {
    return (
      window.location.href.includes("leetcode.com/problems/") &&
      !window.location.href.includes("/solutions/")
    );
  }

  function isLeetCodeSolutionsPage() {
    return (
      window.location.href.includes("leetcode.com/problems/") &&
      window.location.href.includes("/solutions/")
    );
  }

  function startTracking() {
    if (isTracking) {
      console.log("Tracking already started, skipping duplicate call.");
      return;
    } else {
      isTracking = true;
      console.log("started tracking")
    }
    
    if (isLeetCodeProblemPage()) {
      visitedProblemPage = true;
      console.log('visitedPage set to true', visitedProblemPage);
    }
    document.addEventListener("mousemove", () => {
      resetInactivityTimer();
    });

    document.addEventListener("click", () => {
      console.log("Mouse clicked!");
      resetInactivityTimer();
    });

    document.addEventListener("keydown", (event) => {
      console.log("Key pressed:", event.key);
      resetInactivityTimer();

      typedBuffer += event.key;
      if (typedBuffer.length > 20) {
        typedBuffer = typedBuffer.slice(-20);
      }

      for (let word of profanities) {
        if (typedBuffer.toLowerCase().includes(word)) {
          console.log("Profanity detected.");
          chrome.runtime.sendMessage({
            action: "sendToBackend",
            message:
              "The user has disobeyed the instruction. The user is insulting the narrator with profanities. This behavior is unacceptable and the user must be reminded of their role to listen and finish their task.",
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
      }
    });
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      console.log("Inactive for 1 minute!");
      chrome.runtime.sendMessage({
        action: "sendToBackend",
        message:
          "The user has disobeyed the instruction. The user is dilly-dallying and should be reminded to get back on task.",
      });
    }, 60000); // 1 minute of inactivity
  }
})();
}