// Replace 'YOUR_API_KEY' with your actual API key
const API_KEY = 'b1a38a6e51e3e08fea5ce69762f30740';

// Select DOM elements
const searchButton = document.getElementById('search-button');
const cityInput = document.getElementById('city-input');
const weatherResult = document.getElementById('weather-result');
const currentLocationButton = document.getElementById('current-location-button');
const unitToggleButton = document.getElementById('unit-toggle-button');
const loader = document.getElementById('loader');
const forecastContainer = document.getElementById('forecast-container');

// State Variables
let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit

// Event Listeners
searchButton.addEventListener('click', () => {
    const cityName = cityInput.value.trim();
    if (cityName === '') {
        alert('Please enter a city name.');
        return;
    }
    getWeatherData(cityName);
});

currentLocationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherDataByCoords(latitude, longitude);
        }, () => {
            hideLoading();
            alert('Unable to retrieve your location.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

unitToggleButton.addEventListener('click', () => {
    // Toggle unit
    currentUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    unitToggleButton.textContent = currentUnit === 'metric' ? 'Switch to °F' : 'Switch to °C';
    
    // If weather data is currently displayed, refresh it with the new unit
    const cityName = cityInput.value.trim();
    if (cityName !== '') {
        getWeatherData(cityName);
    } else {
        // Optionally, handle cases where current location weather is displayed
        // For simplicity, you can choose to alert the user or implement logic to remember last location
    }
});

// Function to show loading spinner
function showLoading() {
    loader.style.display = 'block';
    weatherResult.innerHTML = '';
    forecastContainer.innerHTML = '';
}

// Function to hide loading spinner
function hideLoading() {
    loader.style.display = 'none';
}

// Function to fetch weather data by city name
async function getWeatherData(city) {
    showLoading();
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found');
            } else {
                throw new Error('Unable to fetch weather data');
            }
        }

        const data = await response.json();
        displayWeatherData(data);
        // Fetch forecast data
        getForecastDataByCity(city);
    } catch (error) {
        hideLoading();
        weatherResult.innerHTML = `<p>${error.message}</p>`;
    }
}

// Function to fetch weather data by coordinates
async function getWeatherDataByCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`);
        
        if (!response.ok) {
            throw new Error('Unable to fetch weather data');
        }

        const data = await response.json();
        displayWeatherData(data);
        // Fetch forecast data
        getForecastDataByCoords(lat, lon);
    } catch (error) {
        hideLoading();
        weatherResult.innerHTML = `<p>${error.message}</p>`;
    }
}

// Function to fetch 5-day forecast data by city name
async function getForecastDataByCity(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`);
        
        if (!response.ok) {
            throw new Error('Unable to fetch forecast data');
        }

        const data = await response.json();
        displayForecastData(data);
    } catch (error) {
        forecastContainer.innerHTML = `<p>${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

// Function to fetch 5-day forecast data by coordinates
async function getForecastDataByCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`);
        
        if (!response.ok) {
            throw new Error('Unable to fetch forecast data');
        }

        const data = await response.json();
        displayForecastData(data);
    } catch (error) {
        forecastContainer.innerHTML = `<p>${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

// Function to display current weather data
function displayWeatherData(data) {
    const { name, main, weather, wind } = data;
    const temperatureUnit = currentUnit === 'metric' ? '°C' : '°F';
    const windSpeedUnit = currentUnit === 'metric' ? 'm/s' : 'mph';

    weatherResult.innerHTML = `
        <h2>${name}</h2>
        <p><strong>Temperature:</strong> ${main.temp} ${temperatureUnit}</p>
        <p><strong>Condition:</strong> ${weather[0].description}</p>
        <p><strong>Humidity:</strong> ${main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${wind.speed} ${windSpeedUnit}</p>
    `;
}

// Function to display 5-day forecast data
function displayForecastData(data) {
    // Clear previous forecast
    forecastContainer.innerHTML = '';

    // Create a map to store one forecast per day
    const forecastMap = new Map();

    data.list.forEach(item => {
        const date = new Date(item.dt_txt);
        const day = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
        const hour = date.getHours();

        // Select forecast closest to 12:00 PM
        if (hour === 12 && !forecastMap.has(day)) {
            forecastMap.set(day, item);
        }
    });

    // If not enough data points at 12:00 PM, pick the closest hour
    if (forecastMap.size < 5) {
        data.list.forEach(item => {
            const date = new Date(item.dt_txt);
            const day = date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

            if (!forecastMap.has(day)) {
                forecastMap.set(day, item);
            }
        });
    }

    // Iterate over the forecastMap and create forecast cards
    forecastMap.forEach((item, day) => {
        const iconUrl = `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        const temperatureUnit = currentUnit === 'metric' ? '°C' : '°F';
        const windSpeedUnit = currentUnit === 'metric' ? 'm/s' : 'mph';

        // Create forecast card element
        const card = document.createElement('div');
        card.classList.add('forecast-card');

        card.innerHTML = `
            <h3>${day}</h3>
            <img src="${iconUrl}" alt="${item.weather[0].description}">
            <p><strong>Temp:</strong> ${item.main.temp} ${temperatureUnit}</p>
            <p><strong>Condition:</strong> ${item.weather[0].description}</p>
            <p><strong>Humidity:</strong> ${item.main.humidity}%</p>
            <p><strong>Wind:</strong> ${item.wind.speed} ${windSpeedUnit}</p>
        `;

        forecastContainer.appendChild(card);
    });

    // Ensure only 5 days are displayed
    if (forecastMap.size === 0) {
        forecastContainer.innerHTML = `<p>No forecast data available.</p>`;
    }
}
// Function to start auto-scrolling the forecast container
function startAutoScroll() {
    // Clear any existing intervals to prevent multiple intervals running
    clearAutoScroll();

    // Calculate the total scrollable width
    const scrollAmount = forecastContainer.scrollWidth - forecastContainer.clientWidth;

    if (scrollAmount <= 0) return; // No need to scroll if content fits

    // Define the scroll speed (pixels per interval)
    const scrollSpeed = 5; // Adjust for faster or slower scrolling

    // Define the interval time in milliseconds
    const intervalTime = 20; // Adjust for smoother or choppy scrolling

    // Initialize scroll position
    let currentScroll = 1;
    let direction = 1; // 1 for right, -1 for left

    autoScrollInterval = setInterval(() => {
        currentScroll += scrollSpeed * direction;
        forecastContainer.scrollLeft = currentScroll;

        // Reverse direction at the ends
        if (currentScroll >= scrollAmount) {
            direction = -1;
        } else if (currentScroll <= 0) {
            direction = 1;
        }
    }, intervalTime);
}

// Function to clear auto-scroll interval
function clearAutoScroll() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }
}

// Optional: Pause auto-scroll on hover and resume on mouse leave
forecastContainer.addEventListener('mouseenter', () => {
    clearAutoScroll();
});

forecastContainer.addEventListener('mouseleave', () => {
    startAutoScroll();
});