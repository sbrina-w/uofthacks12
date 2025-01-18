// Detect if the user is typing in a resume or job application form
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
  