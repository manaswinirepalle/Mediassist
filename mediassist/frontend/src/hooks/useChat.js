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
      const errMsg = {
        id: Date.now().toString() + '_err',
        role: 'error',
        content:
          err.response?.data?.detail ||
          'Failed to connect to MediAssist AI backend. Please make sure the server is running.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errMsg])
      setError(err.message)
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
