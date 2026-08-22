const express = require('express')
const axios = require('axios')

const router = express.Router()

router.get('/', async (req, res) => {
  const destination = String(req.query.destination || '').trim()
  if(!destination) return res.status(400).json({ error: 'Điểm đến là bắt buộc' })

  try {
    const geocodeResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: destination, count: 1, language: 'vi', format: 'json' },
      timeout: 10_000
    })
    const location = geocodeResponse.data.results?.[0]
    if(!location) return res.status(404).json({ error: `Không tìm thấy vị trí ${destination}` })

    const forecastResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        forecast_days: 5,
        timezone: 'auto'
      },
      timeout: 10_000
    })

    const forecast = forecastResponse.data
    res.json({
      location: { name: location.name, country: location.country, latitude: location.latitude, longitude: location.longitude },
      current: {
        temperature: forecast.current.temperature_2m,
        feelsLike: forecast.current.apparent_temperature,
        windSpeed: forecast.current.wind_speed_10m,
        weatherCode: forecast.current.weather_code
      },
      daily: forecast.daily.time.map((date, index) => ({
        date,
        max: forecast.daily.temperature_2m_max[index],
        min: forecast.daily.temperature_2m_min[index],
        rainChance: forecast.daily.precipitation_probability_max[index],
        weatherCode: forecast.daily.weather_code[index]
      }))
    })
  } catch(err) {
    console.error('Weather request failed:', err.message)
    res.status(502).json({ error: 'Không thể lấy dữ liệu thời tiết lúc này' })
  }
})

module.exports = router
