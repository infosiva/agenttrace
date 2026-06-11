'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FloatingChatWrapper() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: "I'm TraceBot. Ask me about agent monitoring, logs, trace analysis, or debugging AI agents!" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input
    setMsgs(m => [...m, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: userMsg }] }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'bot', text: data.text || 'Happy to help!' }])
    } catch {
      setMsgs(m => [...m, { role: 'bot', text: 'Try again in a moment!' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
        aria-label="Open AgentTrace AI chat"
        style={{ position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(14,165,233,0.35)', zIndex: 1000, fontSize: 20 }}
      >
        {open ? '✕' : '🔍'}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{ position: 'fixed', bottom: 88, right: 24, width: 320, height: 420,
              background: 'rgba(255,255,255,0.98)', border: '1px solid #e2e8f0',
              borderRadius: 16, display: 'flex', flexDirection: 'column', zIndex: 1000,
              overflow: 'hidden', boxShadow: '0 8px 40px rgba(14,165,233,0.15)' }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }} />
              TraceBot
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? '#0ea5e9' : '#f1f5f9',
                  color: m.role === 'user' ? '#fff' : '#0f172a',
                  padding: '8px 12px', borderRadius: 10, fontSize: 12.5, maxWidth: '85%', lineHeight: 1.5,
                }}>{m.text}</div>
              ))}
              {loading && <div style={{ alignSelf: 'flex-start', background: '#f1f5f9', padding: '8px 12px', borderRadius: 10, fontSize: 12, color: '#94a3b8' }}>…</div>}
            </div>
            <div style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask about agent traces, logs, debugging…"
                style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#0f172a', outline: 'none' }} />
              <button onClick={send} disabled={loading}
                style={{ background: '#0ea5e9', border: 'none', borderRadius: 8, padding: '7px 13px', fontSize: 13, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>→</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
