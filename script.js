// API configuration
const API_BASE_URL = "http://localhost:3000";
const USE_MOCK_API = false;

// Auto-save config
const AUTO_SAVE_CONFIG = {
  debounceDelay: 1000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Mock storage to simulate a database
class MockStorage {
  constructor() {
    this.data = {
      tasks: JSON.parse(sessionStorage.getItem("mock_tasks") || "[]"),
      goals: JSON.parse(sessionStorage.getItem("mock_goals") || "[]"),
      schedules: JSON.parse(sessionStorage.getItem("mock_schedules") || "[]"),
      notes: JSON.parse(sessionStorage.getItem("mock_notes") || "[]"),
    };
    this.idCounter = {
      tasks: this.getMaxId("tasks") + 1,
      goals: this.getMaxId("goals") + 1,
      schedules: this.getMaxId("schedules") + 1,
      notes: this.getMaxId("notes") + 1,
    };
  }

  getMaxId(type) {
    return this.data[type].length > 0
      ? Math.max(...this.data[type].map((item) => item.id || 0))
      : 0;
  }

  save(type) {
    sessionStorage.setItem(`mock_${type}`, JSON.stringify(this.data[type]));
  }

  // GET /endpoint
  async get(type) {
    await this.simulateDelay();
    return [...this.data[type]];
  }

  // POST /endpoint
  async post(type, data) {
    await this.simulateDelay();
    const newItem = {
      ...data,
      id: this.idCounter[type]++,
    };
    this.data[type].push(newItem);
    this.save(type);
    return newItem;
  }

  // PUT /endpoint/:id
  async put(type, id, data) {
    await this.simulateDelay();
    const index = this.data[type].findIndex((item) => item.id == id);
    if (index !== -1) {
      this.data[type][index] = { ...this.data[type][index], ...data };
      this.save(type);
      return this.data[type][index];
    }
    throw new Error("Item not found");
  }

  // DELETE /endpoint/:id
  async delete(type, id) {
    await this.simulateDelay();
    const index = this.data[type].findIndex((item) => item.id == id);
    if (index !== -1) {
      const deleted = this.data[type].splice(index, 1)[0];
      this.save(type);
      return deleted;
    }
    throw new Error("Item not found");
  }

  simulateDelay() {
    return new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200)
    );
  }
}

// Global instance of mock storage
const mockStorage = new MockStorage();

// API request function with mock and retry support
const apiRequest = async (endpoint, options = {}, retryCount = 0) => {
  if (USE_MOCK_API) {
    return mockApiRequest(endpoint, options);
  }

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
    console.error(`API request failed (attempt ${retryCount + 1}):`, error);

    if (retryCount < AUTO_SAVE_CONFIG.retryAttempts) {
      await new Promise((resolve) =>
        setTimeout(resolve, AUTO_SAVE_CONFIG.retryDelay)
      );
      return apiRequest(endpoint, options, retryCount + 1);
    }

    throw error;
  }
};

// Mock API for testing
const mockApiRequest = async (endpoint, options = {}) => {
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : null;

  // Parse endpoint
  const parts = endpoint.split("/").filter((p) => p);
  const type = parts[0];
  const id = parts[1];

  console.log(`[MOCK API] ${method} ${endpoint}`, body);

  switch (method) {
    case "GET":
      return await mockStorage.get(type);
    case "POST":
      return await mockStorage.post(type, body);
    case "PUT":
      return await mockStorage.put(type, id, body);
    case "DELETE":
      return await mockStorage.delete(type, id);
    default:
      throw new Error(`Method ${method} not supported`);
  }
};

// Debounce utility to avoid too many API calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Status indicator for user
class StatusManager {
  constructor() {
    this.createStatusIndicator();
  }

  createStatusIndicator() {
    if (!document.getElementById("auto-save-status")) {
      const statusDiv = document.createElement("div");
      statusDiv.id = "auto-save-status";
      statusDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        transition: all 0.3s ease;
        display: none;
      `;
      document.body.appendChild(statusDiv);
    }
  }

  showStatus(message, type = "info") {
    const statusDiv = document.getElementById("auto-save-status");
    const colors = {
      info: "#2196F3",
      success: "#4CAF50",
      error: "#f44336",
      warning: "#FF9800",
    };

    statusDiv.textContent = message;
    statusDiv.style.backgroundColor = colors[type];
    statusDiv.style.color = "white";
    statusDiv.style.display = "block";

    if (type === "success") {
      setTimeout(() => {
        statusDiv.style.display = "none";
      }, 2000);
    }
  }

  hideStatus() {
    const statusDiv = document.getElementById("auto-save-status");
    statusDiv.style.display = "none";
  }
}

// Main auto-save manager
class AutoSaveManager {
  constructor() {
    this.statusManager = new StatusManager();
    this.pendingOperations = new Map();
    this.loadedData = {
      tasks: new Map(),
      goals: new Map(),
      schedules: new Map(),
      notes: new Map(),
    };
    this.currentDate = this.getTodayString();
    this.isPastDate = false;
  }

  getTodayString() {
    return new Date().toISOString().split("T")[0];
  }

  // Nouvelle méthode pour vérifier si une date est dans le passé
  isDateInPast(dateString) {
    const today = new Date();
    const selectedDate = new Date(dateString);

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate.getTime() < today.getTime();
  }

  // Nouvelle méthode pour définir la date actuelle
  setCurrentDate(dateString) {
    this.currentDate = dateString;
    this.isPastDate = this.isDateInPast(dateString);
    console.log(
      `Date sélectionnée: ${dateString}, Dans le passé: ${this.isPastDate}`
    );

    // Afficher/masquer l'indicateur de date passée
    this.togglePastDateIndicator();
  }

  // Nouvelle méthode pour afficher un indicateur visuel pour les dates passées
  togglePastDateIndicator() {
    let indicator = document.getElementById("past-date-indicator");

    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "past-date-indicator";
      indicator.className = "past-date-indicator";
      indicator.textContent = "Mode consultation - Date passée (lecture seule)";
      document.body.appendChild(indicator);
    }

    if (this.isPastDate) {
      indicator.classList.add("show");
    } else {
      indicator.classList.remove("show");
    }
  }

  // Nouvelle méthode pour nettoyer l'interface
  clearInterface() {
    // Nettoyer les tâches
    const taskInputs = document.querySelectorAll(
      '.to-do-list input[type="text"]'
    );
    const taskCheckboxes = document.querySelectorAll(
      '.to-do-list input[type="checkbox"]'
    );
    taskInputs.forEach((input, index) => {
      input.value = "";
      input.dataset.id = "";
      taskCheckboxes[index].checked = false;
      taskCheckboxes[index].dataset.id = "";
    });

    // Nettoyer les objectifs
    const goalInputs = document.querySelectorAll(
      '.goals-list input[type="text"]'
    );
    const goalRadios = document.querySelectorAll(
      '.goals-list input[type="radio"]'
    );
    goalInputs.forEach((input, index) => {
      input.value = "";
      input.dataset.id = "";
      goalRadios[index].checked = false;
      goalRadios[index].dataset.id = "";
    });

    // Nettoyer les horaires
    const scheduleInputs = document.querySelectorAll(
      '.schedule-table input[type="text"]'
    );
    scheduleInputs.forEach((input) => {
      input.value = "";
      input.dataset.id = "";
    });

    // Nettoyer les notes
    const noteArea = document.querySelector(".note-area");
    if (noteArea) {
      noteArea.value = "";
      noteArea.dataset.id = "";
    }

    // Vider les données en mémoire
    this.loadedData.tasks.clear();
    this.loadedData.goals.clear();
    this.loadedData.schedules.clear();
    this.loadedData.notes.clear();
  }

  // Nouvelle méthode pour activer/désactiver les champs selon la date
  toggleFieldsBasedOnDate() {
    const isReadOnly = this.isPastDate;

    // Désactiver/activer les tâches
    const taskInputs = document.querySelectorAll(
      '.to-do-list input[type="text"]'
    );
    const taskCheckboxes = document.querySelectorAll(
      '.to-do-list input[type="checkbox"]'
    );
    taskInputs.forEach((input) => {
      input.readOnly = isReadOnly;
      input.style.opacity = isReadOnly ? "0.6" : "1";
    });
    taskCheckboxes.forEach((checkbox) => {
      checkbox.disabled = isReadOnly;
      checkbox.style.opacity = isReadOnly ? "0.6" : "1";
    });

    // Désactiver/activer les objectifs
    const goalInputs = document.querySelectorAll(
      '.goals-list input[type="text"]'
    );
    const goalRadios = document.querySelectorAll(
      '.goals-list input[type="radio"]'
    );
    goalInputs.forEach((input) => {
      input.readOnly = isReadOnly;
      input.style.opacity = isReadOnly ? "0.6" : "1";
    });
    goalRadios.forEach((radio) => {
      radio.disabled = isReadOnly;
      radio.style.opacity = isReadOnly ? "0.6" : "1";
    });

    // Désactiver/activer les horaires
    const scheduleInputs = document.querySelectorAll(
      '.schedule-table input[type="text"]'
    );
    scheduleInputs.forEach((input) => {
      input.readOnly = isReadOnly;
      input.style.opacity = isReadOnly ? "0.6" : "1";
    });

    // Désactiver/activer les notes
    const noteArea = document.querySelector(".note-area");
    if (noteArea) {
      noteArea.readOnly = isReadOnly;
      noteArea.style.opacity = isReadOnly ? "0.6" : "1";
    }
  }

  // Load all data (tasks, goals, schedules, notes) pour une date spécifique
  async loadAllDataForDate(date = null) {
    const targetDate = date || this.currentDate;
    this.setCurrentDate(targetDate);

    try {
      this.statusManager.showStatus("Loading data...", "info");
      this.clearInterface();

      await Promise.all([
        this.loadTasks(targetDate),
        this.loadGoals(targetDate),
        this.loadSchedules(targetDate),
        this.loadNotes(targetDate),
      ]);

      this.toggleFieldsBasedOnDate();
      this.statusManager.showStatus("Data loaded successfully", "success");
      console.log(`All data loaded successfully for ${targetDate}`);
    } catch (error) {
      console.error("Error loading data:", error);
      this.statusManager.showStatus("Load error", "error");
      // Even on error, set up listeners so user can still type
      this.setupAllListeners();
    }
  }

  // Load all data (méthode originale pour la compatibilité)
  async loadAllData() {
    await this.loadAllDataForDate(this.currentDate);
  }

  // Set up all listeners
  setupAllListeners() {
    this.setupTaskListeners();
    this.setupGoalListeners();
    this.setupScheduleListeners();
    this.setupNoteListeners();
  }

  // Load tasks pour une date spécifique
  async loadTasks(date = null) {
    const targetDate = date || this.currentDate;
    try {
      const allTasks = await apiRequest("/tasks");
      // Filtrer les tâches pour la date spécifique
      const tasks = allTasks.filter((task) => task.date === targetDate);

      const taskInputs = document.querySelectorAll(
        '.to-do-list input[type="text"]'
      );
      const taskCheckboxes = document.querySelectorAll(
        '.to-do-list input[type="checkbox"]'
      );
      this.loadedData.tasks.clear();

      tasks.forEach((task, index) => {
        if (index < taskInputs.length) {
          taskInputs[index].value = task.title || "";
          taskInputs[index].dataset.id = task.id;
          taskCheckboxes[index].checked = task.isCompleted || false;
          taskCheckboxes[index].dataset.id = task.id;
          // Store in memory for comparison
          this.loadedData.tasks.set(task.id.toString(), {
            title: task.title || "",
            completed: task.isCompleted || false,
          });
        }
      });
      this.setupTaskListeners();
    } catch (error) {
      console.error("Error loading tasks:", error);
      this.setupTaskListeners();
    }
  }

  // Load goals pour une date spécifique
  async loadGoals(date = null) {
    const targetDate = date || this.currentDate;
    try {
      const allGoals = await apiRequest("/goals");
      // Filtrer les objectifs pour la date spécifique
      const goals = allGoals.filter((goal) => goal.date === targetDate);

      const goalInputs = document.querySelectorAll(
        '.goals-list input[type="text"]'
      );
      const goalRadios = document.querySelectorAll(
        '.goals-list input[type="radio"]'
      );
      this.loadedData.goals.clear();

      goals.forEach((goal, index) => {
        if (index < goalInputs.length) {
          goalInputs[index].value = goal.title || "";
          goalInputs[index].dataset.id = goal.id;
          goalRadios[index].checked = goal.isCompleted || false;
          goalRadios[index].dataset.id = goal.id;
          this.loadedData.goals.set(goal.id.toString(), {
            title: goal.title || "",
            completed: goal.isCompleted || false,
          });
        }
      });
      this.setupGoalListeners();
    } catch (error) {
      console.error("Error loading goals:", error);
      this.setupGoalListeners();
    }
  }

  // Load schedules pour une date spécifique
  async loadSchedules(date = null) {
    const targetDate = date || this.currentDate;
    try {
      const allSchedules = await apiRequest("/schedules");
      // Filtrer les horaires pour la date spécifique
      const schedules = allSchedules.filter(
        (schedule) => schedule.date === targetDate
      );

      console.log(schedules);
      const scheduleInputs = document.querySelectorAll(
        '.schedule-table input[type="text"]'
      );
      this.loadedData.schedules.clear();

      schedules.forEach((schedule) => {
        const input = Array.from(scheduleInputs).find((input) => {
          const row = input.closest("tr");
          const timeCell = row ? row.querySelector("td:first-child") : null;
          return (
            timeCell &&
            timeCell.textContent.trim() === schedule.startTime.slice(0, 5)
          );
        });
        if (input) {
          input.value = schedule.title || "";
          input.dataset.id = schedule.id;
          this.loadedData.schedules.set(schedule.id.toString(), {
            time: schedule.startTime.slice(0, 5),
            activity: schedule.title || "",
          });
        }
      });
      this.setupScheduleListeners();
    } catch (error) {
      console.error("Error loading schedules:", error);
      this.setupScheduleListeners();
    }
  }

  // Load notes pour une date spécifique
  async loadNotes(date = null) {
    const targetDate = date || this.currentDate;
    try {
      const allNotes = await apiRequest("/notes");
      // Filtrer les notes pour la date spécifique
      const notes = allNotes.filter((note) => note.date === targetDate);

      const noteArea = document.querySelector(".note-area");
      this.loadedData.notes.clear();

      if (notes.length > 0 && noteArea) {
        noteArea.value = notes[0].content || "";
        noteArea.dataset.id = notes[0].id;
        this.loadedData.notes.set(notes[0].id.toString(), {
          content: notes[0].content || "",
        });
      }
      this.setupNoteListeners();
    } catch (error) {
      console.error("Error loading notes:", error);
      this.setupNoteListeners();
    }
  }

  // Set up task listeners
  setupTaskListeners() {
    const taskInputs = document.querySelectorAll(
      '.to-do-list input[type="text"]'
    );
    const taskCheckboxes = document.querySelectorAll(
      '.to-do-list input[type="checkbox"]'
    );

    taskInputs.forEach((input, index) => {
      const checkbox = taskCheckboxes[index];

      // Supprimer les anciens listeners
      input.removeEventListener("input", input._debouncedSave);
      input.removeEventListener("blur", input._blurHandler);
      checkbox.removeEventListener("change", checkbox._changeHandler);

      // Ne pas ajouter de listeners si c'est une date passée
      if (this.isPastDate) return;

      // Créer les nouveaux handlers
      const debouncedSave = debounce(() => {
        this.handleTaskChange(input, checkbox);
      }, AUTO_SAVE_CONFIG.debounceDelay);

      const blurHandler = () => this.handleTaskChange(input, checkbox);
      const changeHandler = () => this.handleTaskChange(input, checkbox);

      // Stocker les références pour pouvoir les supprimer plus tard
      input._debouncedSave = debouncedSave;
      input._blurHandler = blurHandler;
      checkbox._changeHandler = changeHandler;

      // Ajouter les listeners
      input.addEventListener("input", debouncedSave);
      input.addEventListener("blur", blurHandler);
      checkbox.addEventListener("change", changeHandler);
    });
  }

  // Set up goal listeners
  setupGoalListeners() {
    const goalInputs = document.querySelectorAll(
      '.goals-list input[type="text"]'
    );
    const goalRadios = document.querySelectorAll(
      '.goals-list input[type="radio"]'
    );

    goalInputs.forEach((input, index) => {
      const radio = goalRadios[index];

      // Supprimer les anciens listeners
      input.removeEventListener("input", input._debouncedSave);
      input.removeEventListener("blur", input._blurHandler);
      radio.removeEventListener("change", radio._changeHandler);

      // Ne pas ajouter de listeners si c'est une date passée
      if (this.isPastDate) return;

      const debouncedSave = debounce(() => {
        this.handleGoalChange(input, radio);
      }, AUTO_SAVE_CONFIG.debounceDelay);

      const blurHandler = () => this.handleGoalChange(input, radio);
      const changeHandler = () => this.handleGoalChange(input, radio);

      // Stocker les références
      input._debouncedSave = debouncedSave;
      input._blurHandler = blurHandler;
      radio._changeHandler = changeHandler;

      input.addEventListener("input", debouncedSave);
      input.addEventListener("blur", blurHandler);
      radio.addEventListener("change", changeHandler);
    });
  }

  // Set up schedule listeners
  setupScheduleListeners() {
    const scheduleInputs = document.querySelectorAll(
      '.schedule-table input[type="text"]'
    );

    scheduleInputs.forEach((input) => {
      // Supprimer les anciens listeners
      input.removeEventListener("input", input._debouncedSave);
      input.removeEventListener("blur", input._blurHandler);

      // Ne pas ajouter de listeners si c'est une date passée
      if (this.isPastDate) return;

      const debouncedSave = debounce(() => {
        this.handleScheduleChange(input);
      }, AUTO_SAVE_CONFIG.debounceDelay);

      const blurHandler = () => this.handleScheduleChange(input);

      // Stocker les références
      input._debouncedSave = debouncedSave;
      input._blurHandler = blurHandler;

      input.addEventListener("input", debouncedSave);
      input.addEventListener("blur", blurHandler);
    });
  }

  // Set up note listeners
  setupNoteListeners() {
    const noteArea = document.querySelector(".note-area");

    if (noteArea) {
      // Supprimer les anciens listeners
      noteArea.removeEventListener("input", noteArea._debouncedSave);
      noteArea.removeEventListener("blur", noteArea._blurHandler);

      // Ne pas ajouter de listeners si c'est une date passée
      if (this.isPastDate) return;

      const debouncedSave = debounce(() => {
        this.handleNoteChange(noteArea);
      }, AUTO_SAVE_CONFIG.debounceDelay);

      const blurHandler = () => this.handleNoteChange(noteArea);

      // Stocker les références
      noteArea._debouncedSave = debouncedSave;
      noteArea._blurHandler = blurHandler;

      noteArea.addEventListener("input", debouncedSave);
      noteArea.addEventListener("blur", blurHandler);
    }
  }

  // Handle task changes (utilise la date actuelle)
  async handleTaskChange(input, checkbox) {
    if (this.isPastDate) return; // Empêcher les modifications sur les dates passées

    const title = input.value.trim();
    const completed = checkbox.checked;
    const id = input.dataset.id;

    try {
      //Delete if field is empty
      if (!title && id) {
        await this.deleteTask(id);
        input.dataset.id = "";
        checkbox.dataset.id = "";
        this.loadedData.tasks.delete(id);
        this.statusManager.showStatus("Task deleted", "success");
        return;
      }

      //No content, do nothing
      if (!title) return;

      const taskData = {
        title: title,
        date: this.currentDate, // Utiliser la date actuelle au lieu d'aujourd'hui
        isCompleted: completed,
      };

      //Update existing task
      if (id) {
        const existing = this.loadedData.tasks.get(id);
        if (
          !existing ||
          existing.title !== title ||
          existing.completed !== completed
        ) {
          await apiRequest(`/tasks/${id}`, {
            method: "PUT",
            body: JSON.stringify(taskData),
          });
          this.loadedData.tasks.set(id, { title, completed });
          this.statusManager.showStatus("Task updated", "success");
        }
      }
      //Create new task
      else {
        const newTask = await apiRequest("/tasks", {
          method: "POST",
          body: JSON.stringify(taskData),
        });
        input.dataset.id = newTask.id;
        checkbox.dataset.id = newTask.id;
        this.loadedData.tasks.set(newTask.id.toString(), { title, completed });
        this.statusManager.showStatus("New task created", "success");
      }
    } catch (error) {
      console.error("Error handling task change:", error);
      this.statusManager.showStatus("Save error", "error");
    }
  }

  // Handle goal changes (utilise la date actuelle)
  async handleGoalChange(input, radio) {
    if (this.isPastDate) return; // Empêcher les modifications sur les dates passées

    const title = input.value.trim();
    const completed = radio.checked;
    const id = input.dataset.id;

    try {
      if (!title && id) {
        await this.deleteGoal(id);
        input.dataset.id = "";
        radio.dataset.id = "";
        this.loadedData.goals.delete(id);
        this.statusManager.showStatus("Goal deleted", "success");
        return;
      }

      if (!title) return;

      const goalData = {
        title: title,
        date: this.currentDate, // Utiliser la date actuelle au lieu d'aujourd'hui
        isCompleted: completed,
      };

      if (id) {
        const existing = this.loadedData.goals.get(id);
        if (
          !existing ||
          existing.title !== title ||
          existing.completed !== completed
        ) {
          await apiRequest(`/goals/${id}`, {
            method: "PUT",
            body: JSON.stringify(goalData),
          });
          this.loadedData.goals.set(id, { title, completed });
          this.statusManager.showStatus("Goal updated", "success");
        }
      } else {
        const newGoal = await apiRequest("/goals", {
          method: "POST",
          body: JSON.stringify(goalData),
        });
        input.dataset.id = newGoal.id;
        radio.dataset.id = newGoal.id;
        this.loadedData.goals.set(newGoal.id.toString(), { title, completed });
        this.statusManager.showStatus("New goal created", "success");
      }
    } catch (error) {
      console.error("Error handling goal change:", error);
      this.statusManager.showStatus("Save error", "error");
    }
  }

  // Handle schedule changes (utilise la date actuelle)
  async handleScheduleChange(input) {
    if (this.isPastDate) return; // Empêcher les modifications sur les dates passées

    const activity = input.value.trim();
    const id = input.dataset.id;
    const row = input.closest("tr");
    const timeCell = row ? row.querySelector("td:first-child") : null;

    if (!timeCell) {
      console.error("Could not find time cell for schedule");
      return;
    }

    const time = timeCell.textContent.trim();

    try {
      //Delete if field is empty
      if (!activity && id) {
        await this.deleteSchedule(id);
        input.dataset.id = "";
        this.loadedData.schedules.delete(id);
        this.statusManager.showStatus("Schedule deleted", "success");
        return;
      }

      //No content, do nothing
      if (!activity) return;

      const scheduleData = {
        title: activity,
        date: this.currentDate, // Utiliser la date actuelle au lieu d'aujourd'hui
        startTime: time, // assume time is in HH:mm format
      };

      //Update existing schedule
      if (id) {
        const existing = this.loadedData.schedules.get(id);
        if (!existing || existing.activity !== activity) {
          await apiRequest(`/schedules/${id}`, {
            method: "PUT",
            body: JSON.stringify(scheduleData),
          });
          this.loadedData.schedules.set(id, { time, activity });
          this.statusManager.showStatus("Schedule updated", "success");
        }
      }
      //Create new schedule
      else {
        const newSchedule = await apiRequest("/schedules", {
          method: "POST",
          body: JSON.stringify(scheduleData),
        });
        input.dataset.id = newSchedule.id;
        this.loadedData.schedules.set(newSchedule.id.toString(), {
          time,
          activity,
        });
        this.statusManager.showStatus("New schedule created", "success");
      }
    } catch (error) {
      console.error("Error handling schedule change:", error);
      this.statusManager.showStatus("Save error", "error");
    }
  }

  // Handle note changes (utilise la date actuelle)
  async handleNoteChange(noteArea) {
    if (this.isPastDate) return; // Empêcher les modifications sur les dates passées

    const content = noteArea.value.trim();
    const id = noteArea.dataset.id;

    try {
      //Delete if field is empty
      if (!content && id) {
        await this.deleteNote(id);
        noteArea.dataset.id = "";
        this.loadedData.notes.delete(id);
        this.statusManager.showStatus("Note deleted", "success");
        return;
      }

      //No content, do nothing
      if (!content) return;

      const noteData = {
        title: "Daily note",
        content: content,
        date: this.currentDate, // Utiliser la date actuelle au lieu d'aujourd'hui
      };

      // Update existing note
      if (id) {
        const existing = this.loadedData.notes.get(id);
        if (!existing || existing.content !== content) {
          await apiRequest(`/notes/${id}`, {
            method: "PUT",
            body: JSON.stringify(noteData),
          });
          this.loadedData.notes.set(id, { content });
          this.statusManager.showStatus("Note updated", "success");
        }
      }
      //Create new note
      else {
        const newNote = await apiRequest("/notes", {
          method: "POST",
          body: JSON.stringify(noteData),
        });
        noteArea.dataset.id = newNote.id;
        this.loadedData.notes.set(newNote.id.toString(), { content });
        this.statusManager.showStatus("New note created", "success");
      }
    } catch (error) {
      console.error("Error handling note change:", error);
      this.statusManager.showStatus("Save error", "error");
    }
  }

  // Delete methods
  async deleteTask(id) {
    await apiRequest(`/tasks/${id}`, { method: "DELETE" });
  }

  async deleteGoal(id) {
    await apiRequest(`/goals/${id}`, { method: "DELETE" });
  }

  async deleteSchedule(id) {
    await apiRequest(`/schedules/${id}`, { method: "DELETE" });
  }

  async deleteNote(id) {
    await apiRequest(`/notes/${id}`, { method: "DELETE" });
  }
}

// Fonctions utilitaires existantes (inchangées)
const showTime = () => {
  const now = new Date();
  let hours = String(now.getHours()).padStart(2, "0");
  let minutes = String(now.getMinutes()).padStart(2, "0");
  let secondes = String(now.getSeconds()).padStart(2, "0");

  const currentTime = `Hour : ${hours}:${minutes}:${secondes}`;
  const timeElement = document.getElementById("time");
  if (timeElement) {
    timeElement.textContent = currentTime;
  }
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

    // Créer une date cliquable avec data-date
    // Dans la boucle while
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;

    if (isToday) {
      table += `<td class="today calendar-date" data-date="${dateString}" style="cursor: pointer;">${d.getDate()}</td>`;
    } else {
      table += `<td class="calendar-date" data-date="${dateString}" style="cursor: pointer;">${d.getDate()}</td>`;
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

  // Ajouter les event listeners pour les dates cliquables
  const dateElements = elem.querySelectorAll(".calendar-date");
  dateElements.forEach((dateElement) => {
    dateElement.addEventListener("click", async (e) => {
      const selectedDate = e.target.dataset.date;
      console.log(`Date sélectionnée depuis le calendrier: ${selectedDate}`);

      // Mettre à jour l'input date
      const dateInput = document.getElementById("date");
      if (dateInput) {
        dateInput.value = selectedDate;
      }

      // Charger les données pour cette date
      if (autoSaveManager) {
        await autoSaveManager.loadAllDataForDate(selectedDate);
      }

      // Retirer la classe 'today' de tous les éléments et l'ajouter au sélectionné
      dateElements.forEach((el) => el.classList.remove("selected-date"));
      e.target.classList.add("selected-date");
    });
  });
};

const getDay = (date) => {
  let day = date.getDay();
  if (day == 0) day = 7;
  return day - 1;
};

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
  if (!container) return;
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
  if (!container) return;
  movePapillon(container);
  setInterval(() => movePapillon(container), interval);
}

// Initialisation globale
let autoSaveManager;

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initialisation de l'application...");

  // Initialiser le gestionnaire de sauvegarde automatique
  autoSaveManager = new AutoSaveManager();

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
    const papillon1 = container1.querySelector(".papillon");
    const papillon2 = container2.querySelector(".papillon");
    const papillon3 = container3.querySelector(".papillon");

    if (papillon1) papillon1.style.animationDuration = "0.7s";
    if (papillon2) papillon2.style.animationDuration = "0.5s";
    if (papillon3) papillon3.style.animationDuration = "0.6s";

    startFlight(container1, 12000);
    startFlight(container2, 14000);
    startFlight(container3, 16000);
  }

  // Définir la date actuelle dans l'input date
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    dateInput.value = dateString;

    // Ajouter un event listener pour l'input date
    dateInput.addEventListener("change", async (e) => {
      const selectedDate = e.target.value;
      console.log(`Date sélectionnée depuis l'input: ${selectedDate}`);

      // Charger les données pour cette date
      if (autoSaveManager) {
        await autoSaveManager.loadAllDataForDate(selectedDate);
      }

      // Mettre à jour la sélection visuelle dans le calendrier
      const calendarDates = document.querySelectorAll(".calendar-date");
      calendarDates.forEach((dateElement) => {
        dateElement.classList.remove("selected-date");
        if (dateElement.dataset.date === selectedDate) {
          dateElement.classList.add("selected-date");
        }
      });
    });
  }

  // Charger toutes les données pour aujourd'hui et configurer les listeners automatiques
  await autoSaveManager.loadAllData();

  // Supprimer l'ancien bouton de sauvegarde s'il existe
  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.style.display = "none";
  }

  console.log("Application initialisée avec succès!");
});
