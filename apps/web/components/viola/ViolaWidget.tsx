"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  action?: { type: string; path: string; label: string } | null;
}

interface ViolaWidgetProps {
  userId: string;
  userName: string;
  currentPage: string;
}

const SUGGESTED_QUESTIONS = [
  "How do I share my booking link?",
  "Connect my calendar",
  "I need help with a booking",
  "Talk to support",
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
    <div className="viola-msg-row viola-msg-viola">
      <div className="viola-bubble viola-bubble-viola viola-typing">
        <span className="viola-dot" style={{ animationDelay: "0ms" }} />
        <span className="viola-dot" style={{ animationDelay: "150ms" }} />
        <span className="viola-dot" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export function ViolaWidget({ userId, userName, currentPage }: ViolaWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDot, setShowDot] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const firstName = userName.split(" ")[0] || "there";
  const openingMessage = `Hi ${firstName}! 👋 I'm Viola, your PagerSchedule assistant. What can I help you with?`;

  // Show notification dot after 3s
  useEffect(() => {
    const t = setTimeout(() => setShowDot(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/viola/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          currentPage,
        }),
      });
      const data = (await res.json()) as { message: string; action?: Message["action"] };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, action: data.action ?? null },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having a little trouble right now. Please email support@pagerschedule.com if you need help.",
          action: { type: "email", path: "mailto:support@pagerschedule.com", label: "Email support →" },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleAction(action: NonNullable<Message["action"]>) {
    if (action.type === "email") {
      window.location.href = action.path;
    } else {
      window.location.href = action.path;
    }
  }

  return (
    <>
      <style>{`
        /* ── Viola Widget Styles ── */
        @keyframes viola-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes viola-fade-up { from{opacity:0;transform:translateY(16px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes viola-dot-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }

        .viola-fab {
          position: fixed; right: 28px; bottom: 28px; z-index: 9999;
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          box-shadow: 0 8px 28px rgba(99,102,241,0.5);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          animation: viola-bounce 3s ease-in-out infinite;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .viola-fab:hover { transform: scale(1.08) translateY(-2px); box-shadow: 0 12px 36px rgba(99,102,241,0.6); }
        .viola-fab-dot {
          position: absolute; top: 2px; right: 2px;
          width: 12px; height: 12px; border-radius: 50%;
          background: #ef4444; border: 2px solid white;
        }

        .viola-panel {
          position: fixed; right: 24px; bottom: 100px; z-index: 9998;
          width: 360px; height: 520px;
          background: white; border-radius: 24px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.18);
          display: flex; flex-direction: column; overflow: hidden;
          animation: viola-fade-up 0.22s ease-out;
        }
        @media (max-width: 480px) {
          .viola-panel {
            right: 0; bottom: 0; top: 0;
            width: 100vw; height: 100vh;
            border-radius: 0;
          }
          .viola-fab { right: 16px; bottom: 16px; }
        }

        .viola-header {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          padding: 14px 16px;
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0;
        }
        .viola-header-icon {
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .viola-header-info { flex: 1; }
        .viola-header-name { font-weight: 700; font-size: 0.95rem; color: white; }
        .viola-header-sub { font-size: 0.72rem; color: rgba(255,255,255,0.7); margin-top: 1px; }
        .viola-header-close {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: none; cursor: pointer; color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; transition: background 0.15s;
        }
        .viola-header-close:hover { background: rgba(255,255,255,0.25); }

        .viola-messages {
          flex: 1; overflow-y: auto; padding: 16px 14px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .viola-messages::-webkit-scrollbar { width: 4px; }
        .viola-messages::-webkit-scrollbar-thumb { background: #e0e7ff; border-radius: 4px; }

        .viola-msg-row { display: flex; }
        .viola-msg-viola { justify-content: flex-start; }
        .viola-msg-user { justify-content: flex-end; }

        .viola-bubble {
          max-width: 82%; font-size: 0.875rem; line-height: 1.55;
          padding: 10px 13px; word-break: break-word;
        }
        .viola-bubble-viola {
          background: #f0effe; color: #111827;
          border-radius: 4px 16px 16px 16px;
        }
        .viola-bubble-user {
          background: linear-gradient(135deg, #6366f1, #818cf8); color: white;
          border-radius: 16px 4px 16px 16px;
        }

        .viola-typing { display: flex; align-items: center; gap: 5px; padding: 12px 14px; }
        .viola-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #6366f1;
          animation: viola-dot-bounce 1.2s ease-in-out infinite;
          display: inline-block;
        }

        .viola-msg-group { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; max-width: 82%; }

        .viola-action-btn {
          background: #f0effe; border: 1px solid #c4b5fd;
          color: #6366f1; border-radius: 10px;
          padding: 7px 12px; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .viola-action-btn:hover { background: #6366f1; color: white; border-color: #6366f1; }

        .viola-suggestions { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
        .viola-suggestion {
          background: white; border: 1px solid #e5e7eb;
          border-radius: 10px; padding: 8px 12px;
          font-size: 0.82rem; color: #374151; font-weight: 500;
          cursor: pointer; text-align: left; transition: all 0.15s;
        }
        .viola-suggestion:hover { background: #f0effe; border-color: #c4b5fd; color: #6366f1; }

        .viola-input-area {
          border-top: 1px solid #f1f5f9; padding: 12px 14px;
          display: flex; gap: 8px; align-items: center; flex-shrink: 0;
        }
        .viola-input {
          flex: 1; border: 1.5px solid #e5e7eb; border-radius: 12px;
          padding: 9px 14px; font-size: 0.875rem; outline: none;
          font-family: inherit; color: #111827; background: white;
          transition: border-color 0.15s;
        }
        .viola-input:focus { border-color: #c4b5fd; }
        .viola-input::placeholder { color: #9ca3af; }

        .viola-send {
          width: 38px; height: 38px; border-radius: 50%;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .viola-send-active { background: linear-gradient(135deg, #6366f1, #818cf8); }
        .viola-send-inactive { background: #f1f5f9; }
      `}</style>

      {/* Floating action button */}
      <button
        className="viola-fab"
        onClick={() => {
          setOpen(!open);
          setShowDot(false);
        }}
        aria-label={open ? "Close Viola" : "Open Viola assistant"}>
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 4l12 12M16 4L4 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <WaveformIcon size={24} />
        )}
        {showDot && !open && <div className="viola-fab-dot" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="viola-panel" role="dialog" aria-label="Viola assistant">
          {/* Header */}
          <div className="viola-header">
            <div className="viola-header-icon">
              <WaveformIcon size={20} />
            </div>
            <div className="viola-header-info">
              <div className="viola-header-name">Viola</div>
              <div className="viola-header-sub">Your PagerSchedule assistant</div>
            </div>
            <button className="viola-header-close" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="viola-messages">
            {/* Opening message */}
            <div className="viola-msg-row viola-msg-viola">
              <div className="viola-msg-group">
                <div className="viola-bubble viola-bubble-viola">{openingMessage}</div>
                {messages.length === 0 && (
                  <div className="viola-suggestions">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button key={q} className="viola-suggestion" onClick={() => sendMessage(q)}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Conversation messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`viola-msg-row ${msg.role === "user" ? "viola-msg-user" : "viola-msg-viola"}`}>
                {msg.role === "assistant" ? (
                  <div className="viola-msg-group">
                    <div className="viola-bubble viola-bubble-viola">{msg.content}</div>
                    {msg.action && (
                      <button className="viola-action-btn" onClick={() => handleAction(msg.action!)}>
                        {msg.action.label}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="viola-bubble viola-bubble-user">{msg.content}</div>
                )}
              </div>
            ))}

            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="viola-input-area">
            <input
              ref={inputRef}
              className="viola-input"
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
              className={`viola-send ${input.trim() ? "viola-send-active" : "viola-send-inactive"}`}
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

export default ViolaWidget;
