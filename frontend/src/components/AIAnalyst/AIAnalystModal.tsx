import React, { useState } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Satellite as SatelliteIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { AIAnalyzeResult, DisasterEvent, Satellite } from '../../types';

interface AIAnalystModalProps {
  onClose: () => void;
  onSelectEvent: (event: DisasterEvent) => void;
  onSelectSatellite: (sat: Satellite) => void;
  initialQuery?: string;
}

const PRESET_QUESTIONS = [
  "What disasters are currently being monitored?",
  "Which satellites are relevant to this wildfire?",
  "What is happening in Kerala?",
  "How does CelesTrak calculate orbital overpasses?",
  "Show me high-severity events.",
  "Which regions have multiple environmental events?"
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'analyst';
  text: string;
  result?: AIAnalyzeResult;
  timestamp: string;
}

export const AIAnalystModal: React.FC<AIAnalystModalProps> = ({
  onClose,
  onSelectEvent,
  onSelectSatellite,
  initialQuery,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const initialSentRef = React.useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'analyst',
      text: "Greetings. I am EarthWatch Analyst, an AI-powered Earth intelligence agent. I analyze verified global telemetry, orbital sensor coverage, and disaster occurrences in real time. How can I assist your mission?",
      timestamp: '00:00 UTC',
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await api.askAIAnalyst({ query: q });
      const analystMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'analyst',
        text: response.answer,
        result: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, analystMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'analyst',
        text: "Insufficient data available. The analytical subsystem is unable to verify observational feeds at this moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (initialQuery && !initialSentRef.current) {
      initialSentRef.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[650px] flex flex-col glass-panel rounded-2xl border border-purple-500/30 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-purple-500/20 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  EarthWatch Analyst
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                  REASONING ENGINE
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Verified Observational Grounding • Zero Hallucination Mode
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick query pills */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-mono text-purple-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Suggested:</span>
          </span>
          {PRESET_QUESTIONS.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(pq)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-purple-900/40 hover:text-purple-200 border border-slate-700/60 text-slate-300 whitespace-nowrap text-[11px] transition-all cursor-pointer"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-70 font-mono">
                  <span>{m.sender === 'user' ? 'OPERATOR' : 'EARTHWATCH ANALYST'}</span>
                  <span>{m.timestamp}</span>
                </div>

                <div className="whitespace-pre-line">{m.text}</div>

                {/* Analytical Metadata & Sources */}
                {m.result && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                    {/* Sources Badge */}
                    {m.result.sources && m.result.sources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono text-slate-400">
                        <span>VERIFIED SOURCES:</span>
                        {m.result.sources.map((s, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Relevant Disasters attached */}
                    {m.result.relevant_events && m.result.relevant_events.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase text-rose-400">
                          RELEVANT DETECTED HAZARDS:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {m.result.relevant_events.slice(0, 4).map((ev) => (
                            <div
                              key={ev.id}
                              onClick={() => {
                                onSelectEvent(ev);
                                onClose();
                              }}
                              className="p-2 rounded-lg bg-slate-950/60 border border-rose-500/20 hover:border-rose-400/50 cursor-pointer flex items-center justify-between text-[11px]"
                            >
                              <span className="font-semibold text-white truncate max-w-[160px]">
                                {ev.title}
                              </span>
                              <span className="text-[9px] font-mono uppercase text-rose-400">
                                {ev.severity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Relevant Satellites attached */}
                    {m.result.relevant_satellites && m.result.relevant_satellites.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase text-sky-400">
                          RELEVANT ORBITAL PLATFORMS:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {m.result.relevant_satellites.slice(0, 4).map((sat) => (
                            <div
                              key={sat.id}
                              onClick={() => {
                                onSelectSatellite(sat);
                                onClose();
                              }}
                              className="p-2 rounded-lg bg-slate-950/60 border border-sky-500/20 hover:border-sky-400/50 cursor-pointer flex items-center justify-between text-[11px]"
                            >
                              <span className="font-semibold text-white truncate max-w-[160px]">
                                🛰️ {sat.name}
                              </span>
                              <span className="text-[9px] font-mono text-emerald-400">
                                {sat.mission}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-400 font-mono">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Analyzing global telemetry and orbital paths...</span>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="p-3 border-t border-purple-500/20 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask EarthWatch Analyst (e.g., 'What is happening in Kerala?')..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
            >
              <span>SEND</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
