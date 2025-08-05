# Daily Planner Frontend

<div align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/OpenWeatherMap-fff?style=for-the-badge&logo=openweathermap&logoColor=orange" alt="OpenWeatherMap">
</div>

## Description

A responsive web application for efficiently organizing your day: tasks, goals, weather, and schedule, all in a modern and aesthetic interface.

## Project Objective

This project aims to create a web application that allows users to:

- Plan their day hour by hour (from 6:00 AM to 9:00 PM)
- Record tasks, goals, and notes
- Check the day's weather
- Visualize a clear and aesthetic schedule to stay productive

## Technical Architecture

### Technologies Used

- **HTML5** - Semantic application structure
- **CSS3** - Styles and responsive design
- **JavaScript** - Client-side functional logic
- **OpenWeatherMap API** - Weather data

### File Structure

```
/daily-planner/
│
├── index.html          # Main HTML structure
├── style.css           # Stylesheet for design
├── script.js           # Functional logic (JavaScript)
└── assets/             # Images, weather icons, illustrations
    ├── icons/
    └── images/
```

## Architecture Diagrams

### Use Case Diagram
<img width="1227" height="215" alt="Use Case Diagram" src="https://github.com/user-attachments/assets/c0301eb6-d90d-4ac9-8ac1-c9876f5b3b57" />

### Class Diagram
<img width="945" height="289" alt="Class Diagram" src="https://github.com/user-attachments/assets/e96b0a8b-0c56-4fb2-8889-4f7969243e6d" />

## Installation

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- VS Code with Live Server extension (recommended)

### Local Installation

```bash
# Clone the project
git clone https://github.com/Yan739/daily-planner.git

# Navigate to the folder
cd daily-planner

# Open in VS Code
code .
```

Then use Live Server to launch the application (see "Development" section below).

## Configuration

### Environment Variables

To use the weather API, you must:

1. Create an account on [OpenWeatherMap](https://openweathermap.org/api)
2. Get a free API key
3. Replace `YOUR_API_KEY` in the `script.js` file

```javascript
const WEATHER_API_KEY = 'YOUR_API_KEY';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
```

## Features

### Current
- Responsive user interface
- Hourly schedule from 6:00 AM to 9:00 PM
- Task and goal management
- Note-taking
- Weather display

### Upcoming
- Automatic saving via LocalStorage
- Complete OpenWeatherMap API integration
- Light/dark theme
- Weekly view with day navigation
- Notifications and reminders
- PDF data export
- Backend API synchronization

## Usage

1. **Open the application** in your browser
2. **Plan your day** by adding time slots
3. **Add tasks** and goals for the day
4. **Check the weather** to adapt your activities
5. **Take notes** as you go

## Development

To develop and test the application, use VS Code's **Live Server** extension:

1. Open the project in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"
4. The application will automatically open in your browser with auto-reload

## Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile: iOS Safari, Chrome Mobile

## Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Author

**Yann NGATEU**

Project created as part of a personal project.

## Useful Links

- [OpenWeatherMap API](https://openweathermap.org/api)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Can I Use](https://caniuse.com/) - Web feature compatibility

---

<div align="center">
  Made with ❤️ by Yann NGATEU
</div>
