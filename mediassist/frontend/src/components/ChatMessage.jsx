import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { highlightKeywords } from '../utils/highlight'

function TypewriterText({ text, onComplete }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    setDone(false)

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(interval)
        setDone(true)
        onComplete?.()
      }
    }, 8)

    return () => clearInterval(interval)
  }, [text])

  const highlighted = highlightKeywords(displayed)

  return (
    <div
      className="prose-medical text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

function SourceBadge({ source }) {
  const categoryColors = {
    general: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    respiratory: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    neurological: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    endocrine: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    cardiovascular: 'bg-red-500/10 text-red-300 border-red-500/20',
    immunology: 'bg-green-500/10 text-green-300 border-green-500/20',
    musculoskeletal: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    mental_health: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
    infectious: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  }
  const color = categoryColors[source.category] || 'bg-gray-500/10 text-gray-300 border-gray-500/20'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${color}`}>
      <span className="w-1 h-1 rounded-full bg-current opacity-70" />
      {source.title.length > 30 ? source.title.slice(0, 28) + '…' : source.title}
    </span>
  )
}

export default function ChatMessage({ message, isNew = false }) {
  const [typed, setTyped] = useState(!isNew)
  const isUser = message.role === 'user'
  const isError = message.role === 'error'

  const timeStr = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end px-4 py-1.5"
      >
        <div className="max-w-[75%]">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg">
            <p className="text-white text-sm leading-relaxed">{message.content}</p>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-right mt-1 mr-1">{timeStr}</p>
        </div>
      </motion.div>
    )
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start gap-3 px-4 py-1.5"
      >
        <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="glass-card border-red-500/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
          <p className="text-red-300 text-sm">{message.content}</p>
        </div>
      </motion.div>
    )
  }

  // Assistant message
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 px-4 py-1.5"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
      </div>

      <div className="max-w-[80%] space-y-2">
        {/* Mode badge */}
        {message.mode && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium
              ${message.aiPowered
                ? 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${message.aiPowered ? 'bg-teal-400' : 'bg-amber-400'}`} />
              {message.aiPowered ? 'AI-Powered' : 'Context-Based (Offline)'}
            </span>
            {message.responseTimeMs && (
              <span className="text-xs text-[var(--text-muted)]">{message.responseTimeMs}ms</span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3">
          {isNew && !typed ? (
            <TypewriterText text={message.content} onComplete={() => setTyped(true)} />
          ) : (
            <div
              className="prose-medical text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightKeywords(message.content) }}
            />
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-1.5"
          >
            <span className="text-xs text-[var(--text-muted)] self-center">Sources:</span>
            {message.sources.map((src, i) => (
              <SourceBadge key={i} source={src} />
            ))}
          </motion.div>
        )}

        <p className="text-xs text-[var(--text-muted)]">{timeStr}</p>
      </div>
    </motion.div>
  )
}
