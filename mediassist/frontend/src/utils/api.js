import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Log the API URL being used (for debugging)
console.log('MediAssist API URL:', BASE_URL)

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.status} from ${response.config.url}`)
    return response
  },
  (error) => {
    if (!error.response) {
      // Network error
      console.error('[API] Network Error:', {
        message: error.message,
        code: error.code,
        url: error.config?.url,
      })
      error.userMessage = `Network error: ${error.message}. Make sure the backend server is running at ${BASE_URL}`
    } else {
      // Server responded with error
      console.error('[API] Server Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      })
      error.userMessage = error.response.data?.detail || `Server error: ${error.response.status}`
    }
    return Promise.reject(error)
  }
)

export const askQuestion = async (question) => {
  try {
    const { data } = await api.post('/ask', { question })
    return data
  } catch (error) {
    console.error('[askQuestion] Failed:', error.userMessage)
    throw error
  }
}

export const getHistory = async (limit = 20) => {
  try {
    const { data } = await api.get(`/history?limit=${limit}`)
    return data
  } catch (error) {
    console.error('[getHistory] Failed:', error.userMessage)
    throw error
  }
}

export const clearHistory = async () => {
  try {
    const { data } = await api.delete('/history')
    return data
  } catch (error) {
    console.error('[clearHistory] Failed:', error.userMessage)
    throw error
  }
}

export const getHealth = async () => {
  try {
    const { data } = await api.get('/health')
    return data
  } catch (error) {
    console.error('[getHealth] Failed:', error.userMessage)
    throw error
  }
}

export default api
