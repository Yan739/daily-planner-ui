// API configuration
const API_BASE_URL = "http://localhost:3000";

// API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Function to show the current time
const showTime = () => {
  const now = new Date();
  let hours = String(now.getHours()).padStart(2, "0");
  let minutes = String(now.getMinutes()).padStart(2, "0");
  let secondes = String(now.getSeconds()).padStart(2, "0");

  const currentTime = `Hour : ${hours}:${minutes}:${secondes}`;
  document.getElementById("time").textContent = currentTime;
};

const createCalendar = (elem, year, month) => {
  let mon = month - 1;
  let d = new Date(year, mon);

  let table =
    "<table><tr><th>MO</th><th>TU</th><th>WE</th><th>TH</th><th>FR</th><th>SA</th><th>SU</th></tr><tr>";

  for (let i = 0; i < getDay(d); i++) {
    table += "<td></td>";
  }

  const today = new Date();
  while (d.getMonth() == mon) {
    let isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    if (isToday) {
      table += `<td class="today">${d.getDate()}</td>`;
    } else {
      table += `<td>${d.getDate()}</td>`;
    }

    if (getDay(d) % 7 == 6) {
      table += "</tr><tr>";
    }

    d.setDate(d.getDate() + 1);
  }

  if (getDay(d) != 0) {
    for (let i = getDay(d); i < 7; i++) {
      table += "<td></td>";
    }
  }

  table += "</tr></table>";
  elem.innerHTML = table;
};

const getDay = (date) => {
  let day = date.getDay();
  if (day == 0) day = 7;
  return day - 1;
};

const loadTasks = async () => {
  try {
    const tasks = await apiRequest("/tasks");
    const taskInputs = document.querySelectorAll(
      '.to-do-list input[type="text"]'
    );
    const taskCheckboxes = document.querySelectorAll(
      '.to-do-list input[type="checkbox"]'
    );

    tasks.forEach((task, index) => {
      if (index < taskInputs.length) {
        taskInputs[index].value = task.title || "";
        taskInputs[index].dataset.id = task.id;
        taskCheckboxes[index].checked = task.completed || false;
        taskCheckboxes[index].dataset.id = task.id;
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des tâches:", error);
  }
};

const loadGoals = async () => {
  try {
    const goals = await apiRequest("/goals");
    const goalInputs = document.querySelectorAll(
      '.goals-list input[type="text"]'
    );
    const goalRadios = document.querySelectorAll(
      '.goals-list input[type="radio"]'
    );

    goals.forEach((goal, index) => {
      if (index < goalInputs.length) {
        goalInputs[index].value = goal.title || "";
        goalInputs[index].dataset.id = goal.id;
        goalRadios[index].checked = goal.completed || false;
        goalRadios[index].dataset.id = goal.id;
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement des objectifs:", error);
  }
};

const loadSchedules = async () => {
  try {
    const schedules = await apiRequest("/schedules");
    const scheduleInputs = document.querySelectorAll(
      '.schedule-table input[type="text"]'
    );

    schedules.forEach((schedule) => {
      const timeSlot = schedule.time;
      const input = Array.from(scheduleInputs).find((input) => {
        const row = input.closest("tr");
        const timeCell = row.querySelector("td:first-child");
        return timeCell && timeCell.textContent === timeSlot;
      });

      if (input) {
        input.value = schedule.activity || "";
        input.dataset.id = schedule.id;
      }
    });
  } catch (error) {
    console.error("Erreur lors du chargement du planning:", error);
  }
};

const loadNotes = async () => {
  try {
    const notes = await apiRequest("/notes");
    const noteArea = document.querySelector(".note-area");

    if (notes.length > 0 && noteArea) {
      noteArea.value = notes[0].content || "";
      noteArea.dataset.id = notes[0].id;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des notes:", error);
  }
};

const saveTasks = async () => {
  const today = new Date().toISOString().split("T")[0];
  const taskInputs = document.querySelectorAll(
    '.to-do-list input[type="text"]'
  );
  const taskCheckboxes = document.querySelectorAll(
    '.to-do-list input[type="checkbox"]'
  );

  for (let i = 0; i < taskInputs.length; i++) {
    const input = taskInputs[i];
    const checkbox = taskCheckboxes[i];
    const title = input.value.trim();

    if (title) {
      const taskData = {
        title: title,
        date: today,
        isCompleted: checkbox.checked,
      };

      try {
        if (input.dataset.id) {
          // Mise à jour
          await apiRequest(`/tasks/${input.dataset.id}`, {
            method: "PUT",
            body: JSON.stringify(taskData),
          });
        } else {
          // Création
          const newTask = await apiRequest("/tasks", {
            method: "POST",
            body: JSON.stringify(taskData),
          });
          input.dataset.id = newTask.id;
          checkbox.dataset.id = newTask.id;
        }
      } catch (error) {
        console.error("Error saving task:", error);
      }
    }
  }
};

const saveGoals = async () => {
  const today = new Date().toISOString().split("T")[0];
  const goalInputs = document.querySelectorAll(
    '.goals-list input[type="text"]'
  );
  const goalRadios = document.querySelectorAll(
    '.goals-list input[type="radio"]'
  );

  for (let i = 0; i < goalInputs.length; i++) {
    const input = goalInputs[i];
    const radio = goalRadios[i];
    const title = input.value.trim();

    if (title) {
      const goalData = {
        title: title,
        date: today,
        isCompleted: radio.checked,
      };

      try {
        if (input.dataset.id) {
          // Mise à jour
          await apiRequest(`/goals/${input.dataset.id}`, {
            method: "PUT",
            body: JSON.stringify(goalData),
          });
        } else {
          // Création
          const newGoal = await apiRequest("/goals", {
            method: "POST",
            body: JSON.stringify(goalData),
          });
          input.dataset.id = newGoal.id;
          radio.dataset.id = newGoal.id;
        }
      } catch (error) {
        console.error("Error saving goal:", error);
      }
    }
  }
};

const saveSchedules = async () => {
  const scheduleInputs = document.querySelectorAll(
    '.schedule-table input[type="text"]'
  );

  for (const input of scheduleInputs) {
    const activity = input.value.trim();
    const row = input.closest("tr");
    const timeCell = row.querySelector("td:first-child");
    const time = timeCell.textContent;

    if (activity) {
      const scheduleData = {
        time: time,
        activity: activity,
      };

      try {
        if (input.dataset.id) {
          // Mise à jour
          await apiRequest(`/schedules/${input.dataset.id}`, {
            method: "PUT",
            body: JSON.stringify(scheduleData),
          });
        } else {
          // Création
          const newSchedule = await apiRequest("/schedules", {
            method: "POST",
            body: JSON.stringify(scheduleData),
          });
          input.dataset.id = newSchedule.id;
        }
      } catch (error) {
        console.error("Error saving schedule:", error);
      }
    }
  }
};

const saveNotes = async () => {
  const noteArea = document.querySelector(".note-area");
  const content = noteArea.value.trim();

  if (content) {
    const noteData = {
      content: content,
    };

    try {
      if (noteArea.dataset.id) {
        // Mise à jour
        await apiRequest(`/notes/${noteArea.dataset.id}`, {
          method: "PUT",
          body: JSON.stringify(noteData),
        });
      } else {
        // Création
        const newNote = await apiRequest("/notes", {
          method: "POST",
          body: JSON.stringify(noteData),
        });
        noteArea.dataset.id = newNote.id;
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  }
};

// Fonction principale de sauvegarde
const saveAllData = async () => {
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true;

  try {
    await Promise.all([saveTasks(), saveGoals(), saveSchedules(), saveNotes()]);

    saveBtn.textContent = "Saved ✓";
    setTimeout(() => {
      saveBtn.textContent = "Save";
      saveBtn.disabled = false;
    }, 2000);
  } catch (error) {
    console.error("Error saving data:", error);
    saveBtn.textContent = "Error";
    setTimeout(() => {
      saveBtn.textContent = "Save";
      saveBtn.disabled = false;
    }, 2000);
  }
};

// Fonction de chargement initial
const loadAllData = async () => {
  try {
    await Promise.all([loadTasks(), loadGoals(), loadSchedules(), loadNotes()]);
    console.log("Data loaded successfully");
  } catch (error) {
    console.error("Error loading data:", error);
  }
};

// Gestion de la météo (inchangée)
const loadWeather = () => {
  const apiKey = "99584a46ac5b619b26340817447b555e";
  const city = "Mons";
  const weatherDiv = document.getElementById("weather");

  if (weatherDiv && apiKey) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.weather) {
          const weatherType = data.weather[0].main.toLowerCase();
          let icon = "assets/weather.png";
          if (weatherType.includes("cloud")) icon = "assets/cloud.png";
          else if (weatherType.includes("rain")) icon = "assets/rain.png";
          else if (weatherType.includes("thunder"))
            icon = "assets/thunderstorm.png";
          else if (weatherType.includes("sun") || weatherType.includes("clear"))
            icon = "assets/sun.png";
          else if (weatherType.includes("hail")) icon = "assets/hail.png";

          weatherDiv.innerHTML = ` Weather in ${city}: ${data.weather[0].main} , ${data.main.temp}°C <img src="${icon}" alt="${data.weather[0].main}" style="height:26px;vertical-align:middle;">`;
        } else {
          weatherDiv.textContent = "Weather data not available.";
        }
      })
      .catch((error) => {
        weatherDiv.textContent = "Error fetching weather.";
        console.error(error);
      });
  }
};

function movePapillon(container) {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const maxX = screenWidth - containerWidth - 20;
  const maxY = screenHeight - containerHeight - 20;
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  container.style.transform = `translate(${x}px, ${y}px)`;
}

function startFlight(container, interval) {
  movePapillon(container);
  setInterval(() => movePapillon(container), interval);
}

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
  // Démarrer l'horloge
  showTime();
  setInterval(showTime, 1000);

  // Créer le calendrier
  const calendarElem = document.getElementById("calendar");
  if (calendarElem) {
    const now = new Date();
    createCalendar(calendarElem, now.getFullYear(), now.getMonth() + 1);
  }

  // Charger la météo
  loadWeather();

  // Configurer les papillons
  const container1 = document.getElementById("papillon1");
  const container2 = document.getElementById("papillon2");
  const container3 = document.getElementById("papillon3");

  if (container1 && container2 && container3) {
    container1.querySelector(".papillon").style.animationDuration = "0.7s";
    container2.querySelector(".papillon").style.animationDuration = "0.5s";
    container3.querySelector(".papillon").style.animationDuration = "0.6s";

    startFlight(container1, 12000);
    startFlight(container2, 14000);
    startFlight(container3, 16000);
  }

  // Charger les données depuis l'API
  await loadAllData();

  // Configurer le bouton de sauvegarde
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveAllData);
  }

  // Définir la date actuelle dans l'input date
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    dateInput.value = dateString;
  }
});
