(() => {
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
    "ass",
  ];

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startTracking") {
      console.log("Tracking started on this page.");
      startTracking();
      sendResponse({ status: "trackingStarted" });
    }
  });

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
    // Track user activity
    console.log("started tracking")
    document.addEventListener("mousemove", () => {
      resetInactivityTimer();
    });

    document.addEventListener("click", () => {
      console.log("Mouse clicked!");
      if (isLeetCodeSolutionsPage() && visitedProblemPage && !hasTyped) {
        console.log("User jumped straight to the solution without attempting the problem.");
        chrome.runtime.sendMessage({
          action: "sendToBackend",
          message:
            "The user has disobeyed the instruction. The user is attempting to cheat their way through the task by opening a LeetCode solution without attempting the problem!",
        });
      }
      resetInactivityTimer();
    });

    document.addEventListener("keydown", (event) => {
      console.log("Key pressed:", event.key);
      resetInactivityTimer();

      typedBuffer += event.key;
      if (typedBuffer.length > 20) {
        typedBuffer = typedBuffer.slice(-20);
      }

      // Check for profanity
      for (let word of profanities) {
        if (typedBuffer.toLowerCase().includes(word)) {
          console.log("Profanity detected.");
          chrome.runtime.sendMessage({
            action: "sendToBackend",
            message:
              "The user has disobeyed the instruction. The user is insulting the narrator with profanities. This behavior is unacceptable and the user must be reminded of their role to listen and finish their task.",
          });
          typedBuffer = ""; // Clear the buffer
          break;
        }
      }

      if (isLeetCodeProblemPage()) {
        if (typedBuffer.trim() === "") {
          hasTyped = false; // User hasn't typed anything yet, did not attempt the problem
        } else {
          hasTyped = true; // User has typed something, indicating an attempt
        }
        visitedProblemPage = true;
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
