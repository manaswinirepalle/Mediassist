import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Sidebar({ messages, onClear, onClose, isOpen }) {
  const [confirmClear, setConfirmClear] = useState(false)

  const historyItems = messages.filter((m) => m.role === 'user')

  return (
    <>
      {/* Overlay (mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:relative lg:translate-x-0 top-0 left-0 h-full w-72 glass-card border-r border-[var(--glass-border)] flex flex-col z-30 lg:z-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">Chat History</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          <AnimatePresence>
            {historyItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-xs text-[var(--text-muted)]">No questions yet.<br />Start a consultation!</p>
              </motion.div>
            ) : (
              historyItems.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card glass-card-hover rounded-xl px-3 py-2.5 cursor-default"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--text-secondary)] leading-snug line-clamp-2">
                        {msg.content}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {historyItems.length > 0 && (
          <div className="px-3 py-3 border-t border-[var(--glass-border)]">
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full text-xs text-[var(--text-muted)] hover:text-red-400 py-2 rounded-lg hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear History
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { onClear(); setConfirmClear(false) }}
                  className="flex-1 text-xs bg-red-500/20 text-red-300 border border-red-500/30 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 text-xs glass-card text-[var(--text-secondary)] py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Brand */}
        <div className="px-4 pb-4 pt-2 border-t border-[var(--glass-border)]">
          <p className="text-xs text-[var(--text-muted)] text-center">
            MediAssist AI v1.0 · RAG-Powered
          </p>
        </div>
      </motion.aside>
    </>
  )
}
