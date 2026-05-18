import { useState, useCallback, useRef } from 'react'
import { askQuestion } from '../utils/api'

export function useChat() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || isLoading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    setError(null)
    scrollToBottom()

    try {
      const response = await askQuestion(question)
      const assistantMsg = {
        id: response.id,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        mode: response.mode,
        aiPowered: response.ai_powered,
        responseTimeMs: response.response_time_ms,
        timestamp: response.timestamp,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      // Determine error message
      let errorContent = 'Failed to connect to MediAssist AI backend. Please make sure the server is running.'
      
      if (err.code === 'ECONNABORTED') {
        errorContent = 'Request timeout. The backend server is slow or not responding. Please try again.'
      } else if (err.code === 'ECONNREFUSED') {
        errorContent = 'Connection refused. The backend server is not running. Check that Render deployment is active.'
      } else if (err.message?.includes('Network Error')) {
        errorContent = err.userMessage || 'Network error. Check your internet connection and backend URL.'
      } else if (err.response?.status === 400) {
        errorContent = err.response.data?.detail || 'Invalid request. Please check your input.'
      } else if (err.response?.status === 500) {
        errorContent = 'Backend server error. Please check the server logs.'
      } else if (err.userMessage) {
        errorContent = err.userMessage
      }

      const errMsg = {
        id: Date.now().toString() + '_err',
        role: 'error',
        content: errorContent,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errMsg])
      setError(err.message)
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }, [isLoading])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clearMessages, bottomRef }
}
