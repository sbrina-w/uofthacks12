let tasks = {
    "resume": false,
    "leetcode": false,
    "job_application": false,
  };
  
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab.url.includes("linkedin.com") || tab.url.includes("docs.google.com")) {
        tasks["resume"] = true;
        giveFeedback(activeInfo.tabId, "editing resume (placeholder for narration)");
      }
      else if (tab.url.includes("leetcode.com")) {
        tasks["leetcode"] = true;
        giveFeedback(activeInfo.tabId, "on leetcode page (placeholder for narration)");
      }
      // else if (tab.url.includes("jobportal.com")) {
      //   tasks["job_application"] = true;
      //   giveFeedback(activeInfo.tabId, "on job page");
      // }
      else {
        checkDistractions(tabId, tab.url);
      }
    });
  });
  
  //change to audio TTS later
  function giveFeedback(tabId, message) {
    chrome.scripting.executeScript({
      target: { tabId: tabId }, 
      func: (msg) => alert(msg),
      args: [message],
    });
  }
  
  function checkDistractions(tabId, url) {
    if (url.includes("youtube.com") || url.includes("twitter.com")) {
      giveFeedback(tabId, "offtask (placeholder for narration)");
    }
  }
  