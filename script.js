const STORAGE_KEY = "syncsa-app-state";

const defaultTasks = [
  { id: 1, text: "Review project goals", done: false },
  { id: 2, text: "Plan the afternoon focus block", done: true },
  { id: 3, text: "Send wellness check-in", done: false }
];

const state = {
  tasks: defaultTasks,
  settings: {
    reminders: true,
    sound: true,
    sync: true
  },
  theme: "light",
  mood: "Calm"
};

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const upcomingTasks = document.getElementById("upcomingTasks");
const completedCount = document.getElementById("completedCount");
const progressPercent = document.getElementById("progressPercent");
const activityBars = document.getElementById("activityBars");
const themeToggle = document.getElementById("themeToggle");
const reminders = document.getElementById("reminders");
const sound = document.getElementById("sound");
const sync = document.getElementById("sync");
const moodMessage = document.getElementById("moodMessage");
const moodBadge = document.getElementById("moodBadge");
const summaryText = document.getElementById("summaryText");
const progressTrackFill = document.getElementById("progressTrackFill");

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    Object.assign(state, parsed);
  } catch (err) {
    console.warn("Could not parse saved state", err);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activateTab(targetId) {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.target === targetId);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active-panel", panel.id === targetId);
  });
}

function renderTabs() {
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.target));
  });
}

function addTask(text) {
  state.tasks.unshift({ id: Date.now(), text, done: false });
  saveState();
  renderTasks();
  renderSummary();
}

function renderSummary() {
  const completed = state.tasks.filter((task) => task.done).length;
  const pending = state.tasks.filter((task) => !task.done).length;
  const percent = state.tasks.length ? Math.round((completed / state.tasks.length) * 100) : 0;
  const moodCopy = {
    Calm: "You are in a calm, steady rhythm.",
    Focused: "Your attention is locked in and your momentum is strong.",
    Energized: "Your energy is high and ready for a bold next step."
  };

  moodMessage.textContent = moodCopy[state.mood] || "You are creating a beautifully balanced day.";
  moodBadge.textContent = state.mood;
  summaryText.textContent = pending > 0
    ? `${pending} open items remain and your pace is ${percent}% complete.`
    : "Everything is clear for today — you are in a relaxed flow.";
  progressTrackFill.style.width = `${percent}%`;
}

function renderTasks() {
  taskList.innerHTML = "";
  upcomingTasks.innerHTML = "";

  state.tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.done ? "done" : ""}`;
    li.innerHTML = `
      <span class="task-text">${task.text}</span>
      <div class="task-actions">
        <button data-action="toggle" data-id="${task.id}">${task.done ? "↺" : "✓"}</button>
        <button data-action="delete" data-id="${task.id}">✕</button>
      </div>
    `;
    taskList.appendChild(li);
  });

  const pendingTasks = state.tasks.filter((task) => !task.done).slice(0, 3);
  pendingTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `<span>${task.text}</span><span>⏱</span>`;
    upcomingTasks.appendChild(li);
  });

  if (!pendingTasks.length) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `<span>All caught up. Nice work.</span>`;
    upcomingTasks.appendChild(li);
  }

  const completed = state.tasks.filter((task) => task.done).length;
  const percent = state.tasks.length ? Math.round((completed / state.tasks.length) * 100) : 0;

  completedCount.textContent = `${completed}/${state.tasks.length}`;
  progressPercent.textContent = `${percent}%`;
  document.querySelector(".progress-ring").style.background = `conic-gradient(var(--accent) ${percent}%, var(--border) 0)`;
  document.getElementById("upcomingCount").textContent = `${pendingTasks.length} upcoming`;
}

function renderInsights() {
  const values = [74, 90, 86, 64, 92, 88, 76];
  activityBars.innerHTML = "";
  values.forEach((value, index) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${value}px`;
    bar.innerHTML = `<span>${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span>`;
    activityBars.appendChild(bar);
  });
}

function renderSettings() {
  reminders.checked = state.settings.reminders;
  sound.checked = state.settings.sound;
  sync.checked = state.settings.sync;
}

function applyTheme() {
  document.body.classList.toggle("dark", state.theme === "dark");
  themeToggle.textContent = state.theme === "dark" ? "☀️" : "🌙";
}

function handleTaskSubmit(event) {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  addTask(text);
  taskInput.value = "";
}

function handleTaskActions(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "toggle") {
    state.tasks = state.tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
  }

  if (action === "delete") {
    state.tasks = state.tasks.filter((task) => task.id !== id);
  }

  saveState();
  renderTasks();
  renderSummary();
}

function bindSettings() {
  reminders.addEventListener("change", (event) => {
    state.settings.reminders = event.target.checked;
    saveState();
  });

  sound.addEventListener("change", (event) => {
    state.settings.sound = event.target.checked;
    saveState();
  });

  sync.addEventListener("change", (event) => {
    state.settings.sync = event.target.checked;
    saveState();
  });
}

function bindQuickActions() {
  document.querySelector(".quick-actions").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    if (action === "add") {
      activateTab("tasks");
      taskInput.focus();
      return;
    }

    if (action === "journal") {
      addTask("Write 3 lines in your journal");
      return;
    }

    if (action === "focus") {
      state.mood = "Focused";
      addTask("Protect 25 minutes for deep work");
      renderSummary();
      saveState();
      document.querySelector('[data-mood="Focused"]').classList.add("active");
      document.querySelectorAll(".mood-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.mood === state.mood);
      });
    }
  });
}

function bindMoodChips() {
  document.querySelector(".mood-row").addEventListener("click", (event) => {
    const chip = event.target.closest(".mood-chip");
    if (!chip) return;

    state.mood = chip.dataset.mood;
    document.querySelectorAll(".mood-chip").forEach((item) => {
      item.classList.toggle("active", item.dataset.mood === state.mood);
    });
    renderSummary();
    saveState();
  });
}

function init() {
  loadState();
  renderTabs();
  renderTasks();
  renderInsights();
  renderSettings();
  renderSummary();
  applyTheme();
  bindSettings();
  bindQuickActions();
  bindMoodChips();

  taskForm.addEventListener("submit", handleTaskSubmit);
  taskList.addEventListener("click", handleTaskActions);
  upcomingTasks.addEventListener("click", handleTaskActions);

  themeToggle.addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
    saveState();
  });
}

init();
