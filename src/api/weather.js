import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_WEATHER_API_URL,
})

export function getWeatherByCity(city) {
  return client.get('weather', {
    params: {
      q: city,
      appid: import.meta.env.VITE_WEATHER_API_KEY,
      units: 'metric',
    },
  })
}