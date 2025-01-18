document.getElementById("submitTask").addEventListener("click", () => {
    const taskInput = document.getElementById("taskInput").value;
  
    if (taskInput.trim() === "") {
      alert("Please enter a task.");
      return;
    }
  
    document.getElementById("taskInput").value = "";
  });
  