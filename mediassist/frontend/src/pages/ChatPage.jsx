import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import Sidebar from '../components/Sidebar'
import TypingIndicator from '../components/TypingIndicator'
import { getHealth } from '../utils/api'

function WelcomeScreen({ onQuickAsk }) {
  const quickTopics = [
    { label: 'I have a fever', icon: '🌡️' },
    { label: 'Cold and flu symptoms', icon: '🤧' },
    { label: 'Managing diabetes', icon: '💉' },
    { label: 'Severe headache', icon: '🧠' },
    { label: 'High blood pressure', icon: '❤️' },
    { label: 'Asthma symptoms', icon: '🫁' },
  ]
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center mx-auto mb-5 shadow-2xl pulse-ring">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">How can I help you today?</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-8 max-w-sm">
          Describe your symptoms or ask a medical question. I'll provide RAG-powered, source-cited answers.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg mx-auto">
          {quickTopics.map((t) => (
            <motion.button
              key={t.label}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onQuickAsk(t.label)}
              className="glass-card glass-card-hover rounded-xl px-3 py-3 text-left transition-all"
            >
              <span className="text-lg block mb-1">{t.icon}</span>
              <span className="text-xs text-[var(--text-secondary)]">{t.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default function ChatPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [health, setHealth] = useState(null)
  const { messages, isLoading, sendMessage, clearMessages, bottomRef } = useChat()
  const lastMsgIndex = messages.length - 1

  useEffect(() => {
    getHealth().then(setHealth).catch(() => {})
  }, [])

  return (
    <div className="flex h-screen bg-[var(--midnight)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        messages={messages}
        onClear={clearMessages}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)] glass-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors lg:hidden"
            >
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-semibold text-sm text-[var(--text-primary)] hidden sm:block">
                MediAssist <span className="gradient-text-teal">AI</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Health status */}
            {health && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span className={`w-2 h-2 rounded-full ${health.ai_enabled ? 'bg-teal-400' : 'bg-amber-400'}`} />
                {health.ai_enabled ? 'AI Online' : 'Context Mode'} · {health.knowledge_base_size} docs
              </div>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                title="New conversation"
              >
                <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          <AnimatePresence>
            {messages.length === 0 ? (
              <WelcomeScreen onQuickAsk={sendMessage} />
            ) : (
              messages.map((msg, i) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isNew={i === lastMsgIndex && msg.role === 'assistant'}
                />
              ))
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isLoading && <TypingIndicator />}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
