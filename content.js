if (!window.__contentScriptInitialized) {
  window.__contentScriptInitialized = true;
  (() => {
    let inactivityTimer;
    let typedBuffer = "";
    let hasTyped = false;
    let visitedProblemPage = false;
    let currentUrl = window.location.href;
    let isTracking = false;
  let currentAudio = null;

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

    const port = chrome.runtime.connect({ name: "counterMonitor" });
    let currentCounter = 0;

    port.onMessage.addListener((message) => {
      if (message.type === "counterUpdate") {
        const previousCounter = currentCounter;
        currentCounter = message.value;

        // Handle counter change
        handleCounterChange(previousCounter, currentCounter);
      }
    });

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
    } else if (message.action === "playAudio") {  // Add this block
      playAudio(message.audioPath);
      sendResponse({ status: "audio playing" });
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

  function playAudio(audioPath) {
    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        const timestamp = new Date().getTime();
        // Use chrome.runtime.getURL to get the correct path within the extension
        const audioUrl = chrome.runtime.getURL('public/speech.mp3') + `?t=${timestamp}`;
        
        currentAudio = new Audio(audioUrl);
        
        currentAudio.onerror = (e) => {
            console.error("Audio error:", e);
            console.error("Audio source:", currentAudio.src);
        };

        currentAudio.onloadeddata = () => {
            console.log("Audio loaded successfully");
        };

        currentAudio.play()
            .catch(e => console.error("Error playing audio:", e));
    } catch (e) {
        console.error("Error in playAudio:", e);
    }
}
    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        
        const timestamp = new Date().getTime();
        // Use chrome.runtime.getURL to get the correct path within the extension
        const audioUrl = chrome.runtime.getURL('public/speech.mp3') + `?t=${timestamp}`;
        
        currentAudio = new Audio(audioUrl);
        
        currentAudio.onerror = (e) => {
            console.error("Audio error:", e);
            console.error("Audio source:", currentAudio.src);
        };

        currentAudio.onloadeddata = () => {
            console.log("Audio loaded successfully");
        };

        currentAudio.play()
            .catch(e => console.error("Error playing audio:", e));
    } catch (e) {
        console.error("Error in playAudio:", e);
    }
}

  function handleUrlChange(newUrl) {
    if (newUrl !== currentUrl) {
      console.log("URL changed from", currentUrl, "to", newUrl);
      currentUrl = newUrl;
      console.log(isLeetCodeSolutionsPage(), hasTyped)
      if (currentUrl.includes("job-application") && currentUrl.includes("/submitted")) {
        console.log("User submitted job application - Demo complete");
        chrome.runtime.sendMessage({
            action: "demoComplete",
            message: "The user has obeyed the instruction. The user has successfully submitted a job application, they completed their task."
        });
        // Stop all tracking and event listeners
        isTracking = false;
        document.removeEventListener("mousemove", resetInactivityTimer);
        document.removeEventListener("click", resetInactivityTimer);
        document.removeEventListener("keydown", resetInactivityTimer);
        return; // Exit the handler
    }
      if (isLeetCodeSolutionsPage() && visitedProblemPage && !hasTyped) {
        console.log("User jumped straight to the solution without attempting the problem.");
        chrome.runtime.sendMessage({
          action: "sendToBackend",
          message:
            "The user has disobeyed the instruction. The user is attempting to cheat their way through the task by opening a LeetCode solution without attempting the problem!",
        });
      } else if (isLeetCodeSubmissionsPage()) {
        console.log("Submission page");
        function checkSubmissionResult() {
          // poll for the result element since it might not be immediately available
          const intervalId = setInterval(() => {
            const resultElement = document.querySelector('[data-e2e-locator="submission-result"]');
      
            if (resultElement) {
              clearInterval(intervalId); // stop checking once the element is found
      
              const resultText = resultElement.textContent.trim();
              console.log("Submission Result Detected:", resultText);
      
              if (resultText === "Accepted") {
                console.log("Submission was successful!");
                chrome.runtime.sendMessage({
                  action: "submissionResult",
                  result: true,
                  message: "The submission was successful. The user can move onto the next task.",
                });
              } else {
                console.log("Submission failed with status:", resultText);
                chrome.runtime.sendMessage({
                  action: "submissionResult",
                  result: false,
                  message: "The submission did not pass successfully. The user should try again.",
                });
              }
            } else {
              console.log("Waiting for the submission result to appear...");
            }
          }, 500); 
        }
      
        checkSubmissionResult();
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

    function isLeetCodeSubmissionsPage() {
      return (
        window.location.href.includes("leetcode.com/problems/") &&
        window.location.href.includes("/submissions/")
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

    function handleCounterChange(oldValue, newValue) {
      console.log(`Disobedience counter changed from ${oldValue} to ${newValue}`);

      // Update mascot based on new counter value
      updateMascot(newValue);

      // You can add other reactions to counter changes here
      if (newValue > oldValue) {
        console.log("User disobedience increased!");
        // Add any additional reactions to increased disobedience
      }
    }

    function updateMascot(counter) {
      const mascotImage = document.getElementById('floatingMascot');
      if (mascotImage) {
        let mascotFolder = "mascot-neutral";

        if (counter > 4) {
          mascotFolder = "mascot-angry";
        } else if (counter === 0) {
          mascotFolder = "mascot-happy";
        }

        const mascotImages = [
          `${mascotFolder}/1.png`,
          `${mascotFolder}/2.png`,
          `${mascotFolder}/3.png`
        ];

        const randomMascot = mascotImages[Math.floor(Math.random() * mascotImages.length)];
        const mascotUrl = chrome.runtime.getURL(`assets/${randomMascot}`);
        mascotImage.src = mascotUrl;
      }
    }

    function injectMascot(counter) {
      if (!window.__mascotInjected) {
        window.__mascotInjected = true;

        let mascotFolder = "mascot-neutral";
        if (counter > 4) {
          mascotFolder = "mascot-angry";
        } else if (counter == 0) {
          mascotFolder = "mascot-happy";
        }
        const mascotImages = [
          `${mascotFolder}/1.png`,
          `${mascotFolder}/2.png`,
          `${mascotFolder}/3.png`
        ];

        const randomMascot = mascotImages[Math.floor(Math.random() * mascotImages.length)];
        const mascotUrl = chrome.runtime.getURL(`assets/${randomMascot}`);
        const mascotImage = document.createElement("img");
        mascotImage.src = mascotUrl;
        mascotImage.alt = "Mascot";
        mascotImage.id = "floatingMascot";

        mascotImage.style.position = "fixed";
        mascotImage.style.bottom = "20px";
        mascotImage.style.right = "20px";
        mascotImage.style.width = "150px";
        mascotImage.style.height = "150px";
        mascotImage.style.zIndex = "9999999";
        mascotImage.style.pointerEvents = "none";
        mascotImage.style.userSelect = "none";
        mascotImage.style.transition = "transform 0.3s ease";

        document.body.appendChild(mascotImage);
      }

if (!window.__mascotAnimated) {
  window.__mascotAnimated = true;

  let mascotFrame = 1;
  setInterval(() => {
    const mascotElement = document.getElementById("floatingMascot");
    if (mascotElement) {
      mascotFrame = mascotFrame === 1 ? 2 : 1;
      mascotElement.src = chrome.runtime.getURL(
        `assets/mascot-neutral-talk/neutral${mascotFrame + 4}.png`
      );
    }
  }, 400);
}
    }
    injectMascot(currentCounter);
  })();
}