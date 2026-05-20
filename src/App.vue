<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { getWeatherByCity } from './api/weather.js'

const city = ref('')
const weather = ref(null)
const forecast = ref([])
const error = ref('')
const loading = ref(false)

function extractDailyForecast(list) {
  const seen = new Set()
  return list
    .filter(item => {
      const date = item.dt_txt.split(' ')[0]
      if (seen.has(date)) return false
      seen.add(date)
      return true
    })
    .slice(0, 5)
}

async function fetchWeather() {
  if (!city.value.trim()) return
  loading.value = true
  error.value = ''
  weather.value = null
  forecast.value = []
  try {
    const [currentRes, forecastRes] = await Promise.all([
      getWeatherByCity(city.value.trim()),
      axios.get(`${import.meta.env.VITE_WEATHER_API_URL}forecast`, {
        params: {
          q: city.value.trim(),
          appid: import.meta.env.VITE_WEATHER_API_KEY,
          units: 'metric',
        },
      }),
    ])
    weather.value = currentRes.data
    forecast.value = extractDailyForecast(forecastRes.data.list)
  } catch (err) {
    if (err.response?.status === 404) {
      error.value = 'City not found. Please try again.'
    } else {
      error.value = 'Something went wrong. Check your connection.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <h1>WeatherApp 2026</h1>

    <div class="search">
      <input
        v-model="city"
        type="text"
        placeholder="Enter city name..."
        @keyup.enter="fetchWeather"
      />
      <button @click="fetchWeather" :disabled="loading">
        {{ loading ? 'Loading...' : 'Get Weather' }}
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="weather" class="card">
      <h2>{{ weather.name }}, {{ weather.sys.country }}</h2>
      <img
        :src="`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`"
        :alt="weather.weather[0].description"
      />
      <p class="temp">{{ Math.round(weather.main.temp) }}°C</p>
      <p class="desc">{{ weather.weather[0].description }}</p>
      <div class="details">
        <span>Humidity: {{ weather.main.humidity }}%</span>
        <span>Wind: {{ weather.wind.speed }} m/s</span>
        <span>Feels like: {{ Math.round(weather.main.feels_like) }}°C</span>
      </div>
    </div>

    <div v-if="forecast.length" class="forecast">
      <h3>5-Day Forecast</h3>
      <div class="forecast-grid">
        <div v-for="day in forecast" :key="day.dt" class="forecast-day">
          <p class="forecast-date">{{ new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}</p>
          <img
            :src="`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`"
            :alt="day.weather[0].description"
          />
          <p class="forecast-temp">{{ Math.round(day.main.temp) }}°C</p>
          <p class="forecast-desc">{{ day.weather[0].description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 480px;
  margin: 60px auto;
  font-family: sans-serif;
  text-align: center;
}
.search {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}
input {
  padding: 10px;
  font-size: 1rem;
  width: 280px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
button {
  padding: 10px 16px;
  font-size: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #ef4444;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.temp {
  font-size: 3rem;
  font-weight: bold;
  margin: 0;
}
.desc {
  text-transform: capitalize;
  color: #6b7280;
  margin-bottom: 16px;
}
.details {
  display: flex;
  justify-content: space-around;
  font-size: 0.9rem;
  color: #374151;
}
.forecast {
  margin-top: 24px;
}
.forecast h3 {
  margin-bottom: 12px;
  font-size: 1rem;
  color: #374151;
}
.forecast-grid {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
.forecast-day {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 10px;
  min-width: 80px;
  flex: 1;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.forecast-date {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 4px;
}
.forecast-temp {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
}
.forecast-desc {
  font-size: 0.7rem;
  text-transform: capitalize;
  color: #6b7280;
  margin: 4px 0 0;
}
</style>