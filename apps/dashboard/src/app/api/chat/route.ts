import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { CHATBOT_LIMITER } from '@/lib/rateLimit'

let _groq: Groq | null = null
function getGroq() { if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! }); return _groq }

export const runtime = 'nodejs'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const SCOPE_LINE = `If asked anything outside AgentLogs/agent observability topics, respond: "I'm trained for AgentLogs. For that, try Google or ChatGPT!"`

const DEFAULT_SYSTEM_PROMPT = `You are TraceBot, the AI assistant for AgentLogs.
Help developers understand trace data, debug AI pipelines, interpret agent logs, set up monitoring, and follow observability best practices.
Be technical, precise, and practical. Focus on actionable advice for AI/ML engineers.
Keep responses concise but thorough. Use code examples when relevant.
${SCOPE_LINE}`

export async function POST(req: NextRequest) {
  const limited = await CHATBOT_LIMITER.check(req); if (limited) return limited
  try {
    const body = await req.json()
    const messages: Message[] = body.messages
    const systemPrompt: string = body.systemPrompt ?? DEFAULT_SYSTEM_PROMPT

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const chatMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6).map((m: Message) => ({ role: m.role, content: m.content })),
    ]

    const reply = await getChatReply(chatMessages)
    if (reply === null) {
      return NextResponse.json({ text: "Chat is resting — try again in a moment." })
    }

    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(reply))
        controller.close()
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[/api/chat]', err)
    return NextResponse.json({ text: "Chat is resting — try again in a moment." })
  }
}

// Groq -> Gemini -> Cerebras fallback (per portfolio §Y). Missing key = skip provider, never crash.
async function getChatReply(messages: Message[]): Promise<string | null> {
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await getGroq().chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      })
      const text = res.choices[0]?.message?.content
      if (text) return text
    } catch (err) {
      console.error('[chat] groq failed', err)
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: messages.filter(m => m.role !== 'system').map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
            systemInstruction: { parts: [{ text: messages.find(m => m.role === 'system')?.content ?? '' }] },
            generationConfig: { maxOutputTokens: 300 },
          }),
        }
      )
      if (res.ok) {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) return text
      }
    } catch (err) {
      console.error('[chat] gemini failed', err)
    }
  }

  if (process.env.CEREBRAS_API_KEY) {
    try {
      const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3.1-70b',
          messages,
          max_tokens: 300,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const text = data.choices?.[0]?.message?.content
        if (text) return text
      }
    } catch (err) {
      console.error('[chat] cerebras failed', err)
    }
  }

  return null
}
