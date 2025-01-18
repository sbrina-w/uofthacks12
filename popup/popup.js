document.getElementById("submitTask").addEventListener("click", () => {
    const taskInput = document.getElementById("taskInput").value;
  
    if (taskInput.trim() === "") {
      alert("Please enter a task.");
      return;
    }
  
    fetch("http://127.0.0.1:5000/submit_task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task: taskInput }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to submit task");
        }
      })
      .catch((error) => {
        console.error("Error submitting task:", error);
      });
  
    document.getElementById("taskInput").value = "";
  });
  