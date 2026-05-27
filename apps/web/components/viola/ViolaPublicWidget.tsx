"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ViolaPublicWidgetProps {
  hostName: string;
  eventTypes?: string[];
}

const PUBLIC_SUGGESTED_QUESTIONS = [
  "What is this meeting for?",
  "Can I reschedule after booking?",
  "How long is the meeting?",
  "What do I need to prepare?",
];

function WaveformIcon({ size = 20, color = "white" }: { size?: number; color?: string }) {
  const heights = [6, 12, 8, 16, 10, 14];
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={2 + i * 3}
          y={(20 - h) / 2}
          width={2}
          height={h}
          rx={1}
          fill={color}
          opacity={0.85 + (i % 2) * 0.15}
        />
      ))}
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="vp-msg-row vp-msg-viola">
      <div className="vp-bubble vp-bubble-viola vp-typing">
        <span className="vp-dot" style={{ animationDelay: "0ms" }} />
        <span className="vp-dot" style={{ animationDelay: "150ms" }} />
        <span className="vp-dot" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export function ViolaPublicWidget({ hostName, eventTypes = [] }: ViolaPublicWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDot, setShowDot] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openingMessage = `Hi! I'm Viola. I can help you book a meeting with ${hostName} or answer any questions.`;

  useEffect(() => {
    const t = setTimeout(() => setShowDot(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/viola/public-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          hostName,
          eventTypes,
        }),
      });
      const data = (await res.json()) as { message: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having a little trouble right now. Please scroll up and use the booking form directly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes vp-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes vp-fade-up { from{opacity:0;transform:translateY(16px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes vp-dot-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }

        .vp-fab {
          position: fixed; right: 28px; bottom: 28px; z-index: 9999;
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          box-shadow: 0 8px 28px rgba(99,102,241,0.5);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          animation: vp-bounce 3s ease-in-out infinite;
          transition: transform 0.2s;
        }
        .vp-fab:hover { transform: scale(1.08) translateY(-2px); }
        .vp-fab-dot {
          position: absolute; top: 2px; right: 2px;
          width: 12px; height: 12px; border-radius: 50%;
          background: #ef4444; border: 2px solid white;
        }
        .vp-panel {
          position: fixed; right: 24px; bottom: 100px; z-index: 9998;
          width: 360px; height: 520px;
          background: white; border-radius: 24px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18);
          display: flex; flex-direction: column; overflow: hidden;
          animation: vp-fade-up 0.22s ease-out;
        }
        @media (max-width: 480px) {
          .vp-panel { right:0;bottom:0;top:0;width:100vw;height:100vh;border-radius:0; }
          .vp-fab { right:16px;bottom:16px; }
        }
        .vp-header {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          padding: 14px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        }
        .vp-header-icon {
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .vp-header-name { font-weight: 700; font-size: 0.95rem; color: white; }
        .vp-header-sub { font-size: 0.72rem; color: rgba(255,255,255,0.7); margin-top: 1px; }
        .vp-header-close {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.15); border: none; cursor: pointer; color: white;
          display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
          transition: background 0.15s; margin-left: auto;
        }
        .vp-header-close:hover { background: rgba(255,255,255,0.25); }
        .vp-messages {
          flex:1; overflow-y:auto; padding:16px 14px;
          display:flex; flex-direction:column; gap:10px;
        }
        .vp-messages::-webkit-scrollbar{width:4px}
        .vp-messages::-webkit-scrollbar-thumb{background:#e0e7ff;border-radius:4px}
        .vp-msg-row { display:flex; }
        .vp-msg-viola { justify-content:flex-start; }
        .vp-msg-user { justify-content:flex-end; }
        .vp-bubble { max-width:82%;font-size:0.875rem;line-height:1.55;padding:10px 13px;word-break:break-word; }
        .vp-bubble-viola { background:#f0effe;color:#111827;border-radius:4px 16px 16px 16px; }
        .vp-bubble-user { background:linear-gradient(135deg,#6366f1,#818cf8);color:white;border-radius:16px 4px 16px 16px; }
        .vp-typing { display:flex;align-items:center;gap:5px;padding:12px 14px; }
        .vp-dot { width:7px;height:7px;border-radius:50%;background:#6366f1;animation:vp-dot-bounce 1.2s ease-in-out infinite;display:inline-block; }
        .vp-msg-group { display:flex;flex-direction:column;gap:6px;align-items:flex-start;max-width:82%; }
        .vp-suggestions { display:flex;flex-direction:column;gap:6px;margin-top:4px; }
        .vp-suggestion {
          background:white;border:1px solid #e5e7eb;border-radius:10px;
          padding:8px 12px;font-size:0.82rem;color:#374151;font-weight:500;
          cursor:pointer;text-align:left;transition:all 0.15s;
        }
        .vp-suggestion:hover { background:#f0effe;border-color:#c4b5fd;color:#6366f1; }
        .vp-input-area { border-top:1px solid #f1f5f9;padding:12px 14px;display:flex;gap:8px;align-items:center;flex-shrink:0; }
        .vp-input {
          flex:1;border:1.5px solid #e5e7eb;border-radius:12px;
          padding:9px 14px;font-size:0.875rem;outline:none;font-family:inherit;
          color:#111827;background:white;transition:border-color 0.15s;
        }
        .vp-input:focus{border-color:#c4b5fd;}
        .vp-input::placeholder{color:#9ca3af;}
        .vp-send {
          width:38px;height:38px;border-radius:50%;border:none;cursor:pointer;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;
        }
        .vp-send-active{background:linear-gradient(135deg,#6366f1,#818cf8);}
        .vp-send-inactive{background:#f1f5f9;}
      `}</style>

      <button
        className="vp-fab"
        onClick={() => {
          setOpen(!open);
          setShowDot(false);
        }}
        aria-label={open ? "Close Viola" : "Ask Viola"}>
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 4l12 12M16 4L4 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <WaveformIcon size={24} />
        )}
        {showDot && !open && <div className="vp-fab-dot" />}
      </button>

      {open && (
        <div className="vp-panel" role="dialog" aria-label="Viola booking assistant">
          <div className="vp-header">
            <div className="vp-header-icon">
              <WaveformIcon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="vp-header-name">Viola</div>
              <div className="vp-header-sub">Booking assistant</div>
            </div>
            <button className="vp-header-close" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="vp-messages">
            <div className="vp-msg-row vp-msg-viola">
              <div className="vp-msg-group">
                <div className="vp-bubble vp-bubble-viola">{openingMessage}</div>
                {messages.length === 0 && (
                  <div className="vp-suggestions">
                    {PUBLIC_SUGGESTED_QUESTIONS.map((q) => (
                      <button key={q} className="vp-suggestion" onClick={() => sendMessage(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`vp-msg-row ${msg.role === "user" ? "vp-msg-user" : "vp-msg-viola"}`}>
                <div className={`vp-bubble ${msg.role === "user" ? "vp-bubble-user" : "vp-bubble-viola"}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <div className="vp-input-area">
            <input
              ref={inputRef}
              className="vp-input"
              placeholder="Ask Viola anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              disabled={loading}
              aria-label="Message Viola"
            />
            <button
              className={`vp-send ${input.trim() ? "vp-send-active" : "vp-send-inactive"}`}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8l12-6-5 6 5 6-12-6z" fill={input.trim() ? "white" : "#9ca3af"} />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ViolaPublicWidget;
