import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

const QUICK_QUESTIONS = [
  'What causes fever?',
  'Symptoms of flu?',
  'How to manage diabetes?',
  'What is hypertension?',
  'Headache remedies?',
]

export default function ChatInput({ onSend, isLoading }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = () => {
    const q = value.trim()
    if (!q || isLoading) return
    onSend(q)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e) => {
    setValue(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
    }
  }

  return (
    <div className="border-t border-[var(--glass-border)] bg-[var(--midnight)] p-4 space-y-3">
      {/* Quick questions */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => { setValue(q); textareaRef.current?.focus() }}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full glass-card glass-card-hover text-[var(--text-secondary)] hover:text-teal-300 transition-colors whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-3">
        <div className="flex-1 glass-card rounded-2xl px-4 py-3 flex items-end gap-3 focus-within:border-teal-500/40 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms or ask a medical question…"
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] leading-relaxed max-h-[140px] disabled:opacity-50"
          />
          <span className="text-xs text-[var(--text-muted)] self-center flex-shrink-0 hidden sm:block">
            {value.length}/1000
          </span>
        </div>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="w-12 h-12 rounded-xl btn-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all"
        >
          {isLoading ? (
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-[var(--text-muted)]">
        ⚕️ MediAssist AI is for informational purposes only. Always consult a licensed healthcare professional.
      </p>
    </div>
  )
}
