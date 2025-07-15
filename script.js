const showTime = () => {
  const now = new Date();
  let hours = String(now.getHours()).padStart(2, "0");
  let minutes = String(now.getMinutes()).padStart(2, "0");
  let secondes = String(now.getSeconds()).padStart(2, "0");

  const currentTime = `Hour : ${hours}:${minutes}:${secondes}`;

  document.getElementById("time").textContent = currentTime;
};
showTime();
setInterval(showTime, 1000);

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

const calendarElem = document.getElementById("calendar");
if (calendarElem) {
  const now = new Date();
  createCalendar(calendarElem, now.getFullYear(), now.getMonth() + 1);
} else {
  console.error("Calendar element not found");
}

const apiKey = "YOUR_API_KEY";
const city = "Mons";
if (!apiKey) {
  console.error("Weather API key is not set.");
}
const weatherDiv = document.getElementById("weather");

if (weatherDiv) {
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

const container1 = document.getElementById("papillon1");
const container2 = document.getElementById("papillon2");
const container3 = document.getElementById("papillon3");

container1.querySelector(".papillon").style.animationDuration = "0.7s";
container2.querySelector(".papillon").style.animationDuration = "0.5s";
container3.querySelector(".papillon").style.animationDuration = "0.6s";

startFlight(container1, 12000);
startFlight(container2, 14000);
startFlight(container3, 16000);
