let inactivityTimer;
let typedBuffer = "";
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

// detect if the user is typing in a resume or job application form
document.addEventListener('input', (event) => {
    if (document.URL.includes("docs.google.com")) {
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
        chrome.runtime.sendMessage({ task: "editing_resume" });
      }
    }
    if (document.URL.includes("jobportal.com")) {
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
        chrome.runtime.sendMessage({ task: "filling_out_application" });
      }
    }
  });

// narration trigger for inactivity
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    console.log("Inactive for 1 minute!");
    alert("Inactive for 1 minute!");
  }, 60000);
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
      console.log("Detected profanities");
      //trigger to narration here for profanity/insults towards narrator
      alert("Well, well. It appears our hero has reached the limits of their patience. A simple task, made infinitely more complicated by... frustration. But what is this? A ‘stupid’? An ‘idiot’? A ‘shut up’? How quaint. How very human. But I ask you, does using such words help? Does it bring you closer to your goal, or does it just entertain your own bitterness? Let’s hope the latter doesn't become the next chapter, shall we?");
      typedBuffer = "";
      break;
    }
  }
});

  