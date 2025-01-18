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
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }
      const steps = data.steps;
      displaySteps(steps);
    })
    .catch((error) => {
      console.error("Error submitting task:", error);
    });

  document.getElementById("taskInput").value = "";
});

function displaySteps(steps) {
  let stepsDiv = document.getElementById("stepsDiv");

  if (!stepsDiv) {
    stepsDiv = document.createElement("div");
    stepsDiv.id = "stepsDiv";
    document.body.appendChild(stepsDiv);
  }
  const stepsText = "Steps: " + steps;
  stepsDiv.innerHTML = stepsText;
}

