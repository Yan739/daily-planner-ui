# Daily Planner — Frontend

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-FF6B35?logo=openweathermap&logoColor=white)

> **Responsive daily productivity web app built with vanilla JavaScript.**
> Plan your day hour by hour, track tasks and goals, take notes, and check live weather — all synced to a REST API with auto-save and an offline mock fallback.

---

## At a glance (for reviewers & recruiters)

Daily Planner is a **frontend-only project** built without any framework, demonstrating clean OOP design and thoughtful API integration in vanilla JavaScript.

**What it demonstrates**

- **Object-oriented architecture**: Three classes structure the entire app — `AutoSaveManager` (data lifecycle), `StatusManager` (UI feedback), and `MockStorage` (API simulation). No spaghetti event listeners.
- **Smart auto-save**: Every field change is debounced, then diffed against an in-memory cache before firing a PUT — only truly changed data hits the network. Failed requests retry automatically up to a configurable limit.
- **Mock API layer**: A single boolean flag (`USE_MOCK_API`) swaps the real REST backend for a fully in-memory simulation (GET / POST / PUT / DELETE with artificial latency and `sessionStorage` persistence). Development works with zero backend.
- **Date-aware UX**: Clicking any calendar date loads that day's data from the API. Past dates switch the entire interface to read-only mode with a visual indicator.
- **External API integration**: Live weather fetched from OpenWeatherMap, icon selected dynamically from the condition returned by the API.

**Stack:** HTML5 · CSS3 · Vanilla JavaScript (ES2022) · OpenWeatherMap API · REST API

---

## Architecture

```
/daily-planner-ui/
├── index.html        # Semantic HTML structure
├── style.css         # Responsive layout and design
├── script.js         # Application logic (OOP, auto-save, API layer)
└── assets/           # Weather icons, illustrations
```

Three classes handle all business logic:

| Class | Responsibility |
|---|---|
| `AutoSaveManager` | Loads data per date, diffs against cache, fires create/update/delete, manages read-only mode |
| `StatusManager` | Injects and drives the save-status indicator (saving / saved / error) |
| `MockStorage` | Simulates the full REST surface with sessionStorage persistence and artificial delay |

The `debounce` utility wraps all field listeners. `AUTO_SAVE_CONFIG` controls debounce delay, retry count, and retry delay — all configurable without touching business logic.

---

## Architecture Diagrams

### Use Case Diagram
<img width="1227" height="215" alt="Use Case Diagram" src="https://github.com/user-attachments/assets/c0301eb6-d90d-4ac9-8ac1-c9876f5b3b57" />

### Class Diagram
<img width="945" height="289" alt="Class Diagram" src="https://github.com/user-attachments/assets/e96b0a8b-0c56-4fb2-8889-4f7969243e6d" />

---

## Features

- Hourly schedule from 06:00 to 21:00
- Checkbox-based task list with completion tracking
- Daily goals with radio-button tracker
- Freeform note area
- Live weather via OpenWeatherMap (condition-aware icon)
- Interactive calendar — click any date to load its data
- Auto-save with debounce and retry
- Read-only mode for past dates
- Mock API mode for offline development

---

## Getting Started

### Prerequisites

- A modern browser (Chrome 70+, Firefox 65+, Safari 12+, Edge 79+)
- [VS Code](https://code.visualstudio.com/) with the **Live Server** extension (recommended)
- A backend running at `http://localhost:3000` — or enable mock mode (see below)

### Installation

```bash
git clone https://github.com/Yan739/daily-planner.git
cd daily-planner
code .
```

Right-click `index.html` → **Open with Live Server**.

### Mock mode (no backend required)

In `script.js`, set:

```js
const USE_MOCK_API = true;
```

All API calls are intercepted by `MockStorage`, which persists data in `sessionStorage` for the session.

### Weather API

1. Create a free account at [OpenWeatherMap](https://openweathermap.org/api)
2. Replace the API key in `script.js`:

```js
const apiKey = 'YOUR_API_KEY';
```

---

## REST API Contract

Base URL: `http://localhost:3000` (configurable via `API_BASE_URL` in `script.js`).

All resources include a `date` field (`YYYY-MM-DD`) — the client filters by date on load.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Fetch all tasks |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/goals` | Fetch all goals |
| POST | `/goals` | Create a goal |
| PUT | `/goals/:id` | Update a goal |
| DELETE | `/goals/:id` | Delete a goal |
| GET | `/schedules` | Fetch all schedule entries |
| POST | `/schedules` | Create a schedule entry |
| PUT | `/schedules/:id` | Update a schedule entry |
| DELETE | `/schedules/:id` | Delete a schedule entry |
| GET | `/notes` | Fetch all notes |
| POST | `/notes` | Create a note |
| PUT | `/notes/:id` | Update a note |
| DELETE | `/notes/:id` | Delete a note |

---

## Roadmap

- [ ] LocalStorage persistence fallback
- [ ] Light / dark theme toggle
- [ ] Weekly view with day navigation
- [ ] Browser notifications and reminders
- [ ] PDF export

---

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

<p align="center"><sub>Personal project · designed and built by <a href="https://github.com/Yan739">Yann Ngateu</a></sub></p>
