<script setup>
import { ref } from 'vue'
import { getWeatherByCity } from './api/weather.js'

const city = ref('')
const weather = ref(null)
const error = ref('')
const loading = ref(false)

async function fetchWeather() {
  if (!city.value.trim()) return
  loading.value = true
  error.value = ''
  weather.value = null
  try {
    const response = await getWeatherByCity(city.value.trim())
    weather.value = response.data
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
</style>