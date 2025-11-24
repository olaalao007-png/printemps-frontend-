// src/boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Créez votre instance axios
/*const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000/api', // Adaptez selon votre backend
  timeout: 10000
})
*/
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000
})


// Intercepteur de requête pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur de réponse pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/#/login'
    }
    return Promise.reject(error)
  }
)

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }