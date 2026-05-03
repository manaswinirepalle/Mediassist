import axios from 'axios'

const BASE_URL ='https://mediassist-9ibf.onrender.com'
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export const askQuestion = async (question) => {
  const { data } = await api.post('/ask', { question })
  return data
}

export const getHistory = async (limit = 20) => {
  const { data } = await api.get(`/history?limit=${limit}`)
  return data
}

export const clearHistory = async () => {
  const { data } = await api.delete('/history')
  return data
}

export const getHealth = async () => {
  const { data } = await api.get('/health')
  return data
}

export default api
