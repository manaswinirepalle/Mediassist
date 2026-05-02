import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'RAG-Powered AI',
    desc: 'Retrieval-Augmented Generation ensures answers are grounded in verified medical knowledge, not hallucinations.',
    color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/20',
    iconColor: 'text-teal-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant Responses',
    desc: 'Get medically-informed answers in seconds. No waiting rooms, no appointments required.',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Source-Cited Answers',
    desc: 'Every response comes with source citations from our curated medical knowledge base.',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    title: 'Works Offline',
    desc: 'Graceful fallback mode — context-based answers available even without an AI API key.',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/20',
    iconColor: 'text-amber-400',
  },
]

const conditions = [
  'Fever', 'Common Cold', 'Headache', 'Influenza', 'Diabetes',
  'Hypertension', 'Asthma', 'Allergies', 'Anxiety', 'Back Pain', 'COVID-19', 'Dehydration',
]

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen mesh-bg overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[var(--glass-border)] glass-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="font-semibold text-[var(--text-primary)] tracking-tight">MediAssist <span className="gradient-text-teal">AI</span></span>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/chat')}
          className="btn-primary text-white text-sm font-medium px-5 py-2 rounded-xl"
        >
          Start Consultation
        </motion.button>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20 text-center max-w-5xl mx-auto">
        {/* Decorative orb */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-card rounded-full text-xs text-teal-300 border border-teal-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-teal-400 pulse-ring" />
            Powered by RAG + AI · Always cite sources
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
            Your AI-powered
            <br />
            <span className="gradient-text">Medical Assistant</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
            Get instant, reliable medical insights using advanced Retrieval-Augmented Generation.
            Ask about symptoms, conditions, and treatments — backed by real medical knowledge.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chat')}
              className="btn-primary text-white font-semibold px-8 py-4 rounded-2xl text-base teal-glow w-full sm:w-auto"
            >
              Start Consultation →
            </motion.button>
            <a
              href="#features"
              className="text-[var(--text-secondary)] hover:text-teal-300 text-sm font-medium transition-colors underline-offset-4 hover:underline"
            >
              Learn more
            </a>
          </div>
        </motion.div>

        {/* Hero card preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 max-w-2xl mx-auto glass-card rounded-2xl p-5 text-left border border-[var(--glass-border)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/40" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/40" />
              <div className="w-3 h-3 rounded-full bg-green-400/40" />
            </div>
            <span className="text-xs text-[var(--text-muted)] ml-2">MediAssist AI Chat</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-teal-600/80 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[70%]">
                <p className="text-sm text-white">I have a high fever and body aches. What should I do?</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  High <mark className="keyword-highlight">fever</mark> with body aches are classic <mark className="keyword-highlight">symptoms</mark> of <mark className="keyword-highlight">flu</mark>. Rest, stay hydrated, and consider acetaminophen for comfort. Seek care if temperature exceeds 39.4°C…
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Conditions ticker */}
      <section className="py-6 border-y border-[var(--glass-border)] overflow-hidden">
        <motion.div
          animate={{ x: [0, -1200] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex gap-4 whitespace-nowrap"
        >
          {[...conditions, ...conditions].map((c, i) => (
            <span key={i} className="text-xs text-[var(--text-muted)] px-3 py-1 glass-card rounded-full border border-[var(--glass-border)]">
              {c}
            </span>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 variants={item} className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Why <span className="gradient-text-teal">MediAssist</span>?
          </motion.h2>
          <motion.p variants={item} className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Built with cutting-edge AI technology to provide reliable healthcare information when you need it most.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              whileHover={{ y: -4 }}
              className={`glass-card rounded-2xl p-6 border bg-gradient-to-br ${f.color} transition-all duration-300`}
            >
              <div className={`w-10 h-10 rounded-xl glass-card flex items-center justify-center mb-4 ${f.iconColor}`}>
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass-card rounded-3xl p-10 border border-teal-500/10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Ready to get <span className="gradient-text">medical clarity</span>?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8">
              Start your AI-powered medical consultation for free. No registration required.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chat')}
              className="btn-primary text-white font-semibold px-10 py-4 rounded-2xl text-base teal-glow"
            >
              Start Consultation →
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] px-6 py-6 text-center">
        <p className="text-xs text-[var(--text-muted)]">
          ⚕️ MediAssist AI is for informational purposes only and does not replace professional medical advice.
          Always consult a qualified healthcare provider for personal medical concerns.
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2">© 2024 MediAssist AI · Built with RAG + FastAPI + React</p>
      </footer>
    </div>
  )
}
