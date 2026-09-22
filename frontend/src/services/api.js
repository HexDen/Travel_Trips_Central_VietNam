import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 90_000,
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('travel_token')
  if(token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default instance
