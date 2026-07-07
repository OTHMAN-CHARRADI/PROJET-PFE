import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../service/Api';
import { Bot, X, Send, Loader2, Minimize2, Maximize2, Sparkles, ChevronRight, RotateCcw } from 'lucide-react';

const CONTEXTS = {
  course: {
    label: 'Assistant Cours',
    color: 'from-indigo-500 to-purple-600',
    shadow: 'shadow-indigo-500/30',
    ring: 'ring-indigo-500/25',
    btnColor: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    suggestions: (s) => [
      `Explique-moi "${s}" simplement`,
      `Donne un exemple concret`,
      'Quelles sont les erreurs courantes ?',
      'Résume ce cours en 5 points',
    ],
    systemPrompt: (s, e) =>
      `Tu es Infobot, assistant pédagogique dans un cours sur "${s}". Contexte: ${e || ''}. Réponds en français, sois concis, utilise le markdown et des exemples de code.`,
  },
  quiz: {
    label: 'Assistant Quiz',
    color: 'from-purple-500 to-pink-600',
    shadow: 'shadow-purple-500/30',
    ring: 'ring-purple-500/25',
    btnColor: 'bg-gradient-to-br from-purple-500 to-pink-600',
    suggestions: (s) => [
      `Explique le concept "${s}"`,
      'Donne-moi un indice sans révéler la réponse',
      'Comment raisonner sur cette question ?',
      'Quels pièges éviter ?',
    ],
    systemPrompt: (s, e) =>
      `Tu es Infobot, assistant dans un quiz sur "${s}". Question: ${e || ''}. NE DONNE JAMAIS directement la réponse. Guide l'étudiant à raisonner par lui-même. Réponds en français, markdown.`,
  },
  exercise: {
    label: 'Assistant Exercice',
    color: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/30',
    ring: 'ring-emerald-500/25',
    btnColor: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    suggestions: (s) => [
      `Comment approcher cet exercice ?`,
      'Donne-moi un indice pour commencer',
      'Explique la logique sans coder',
      'Aide-moi à déboguer mon code',
    ],
    systemPrompt: (s, e) =>
      `Tu es Infobot, assistant dans un exercice sur "${s}". Énoncé: ${e || ''}. Guide étape par étape sans donner la solution complète. Réponds en français, markdown avec blocs de code.`,
  },
};

const renderMd = (text) => {
  if (!text) return '';
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="bg-gray-900 rounded-lg p-3 my-2 overflow-x-auto text-xs text-emerald-300 border border-gray-700/50"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-700/60 text-emerald-300 px-1 py-0.5 rounded text-xs">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-300">$1</em>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-white mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-bold text-white mt-3 mb-1">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="text-gray-300 ml-3 text-xs list-disc">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};

const AiAssistant = ({ context = 'course', subject = '', extra = '' }) => {
  const ctx = CONTEXTS[context] || CONTEXTS.course;

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, minimized]);

  useEffect(() => {
    setMessages([]);
    setConvId(null);
  }, [subject, context]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const payload =
      messages.length === 0
        ? `[SYSTEM: ${ctx.systemPrompt(subject, extra)}]\n\n${msg}`
        : msg;

    try {
      const res = await sendMessage(payload, convId, null);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.content }]);
      if (!convId && res.conversation_id) setConvId(res.conversation_id);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Erreur de connexion. Réessayez.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // ─── Floating Button ───
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 ${ctx.btnColor} rounded-2xl flex items-center justify-center shadow-2xl ${ctx.shadow} hover:scale-110 active:scale-95 transition-all duration-200 group`}
        title={ctx.label}
      >
        <Bot className="w-7 h-7 text-white" />
        <span className="absolute right-16 bg-gray-900 border border-gray-700/50 text-white text-xs font-medium px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
          {ctx.label}
        </span>
      </button>
    );
  }

  // ─── Chat Panel ───
  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] w-96 bg-gray-900/97 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl ring-2 ${ctx.ring} flex flex-col overflow-hidden transition-all duration-300 ${minimized ? 'h-14' : 'h-[500px]'}`}
      style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}
    >
      {/* Header */}
      <div className={`flex items-center gap-2.5 px-4 h-14 bg-gradient-to-r ${ctx.color} flex-shrink-0`}>
        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-none">{ctx.label}</p>
          {subject && (
            <p className="text-[11px] text-white/60 truncate mt-0.5">{subject}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => { setMessages([]); setConvId(null); }}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/15 transition-all"
              title="Réinitialiser"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setMinimized((m) => !m)}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/15 transition-all"
          >
            {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/15 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="flex gap-2.5">
                  <div className={`w-7 h-7 bg-gradient-to-br ${ctx.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div
                    className="bg-gray-800/70 border border-gray-700/40 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: `Bonjour ! Je suis votre assistant${subject ? ` pour <strong class="text-white">${subject}</strong>` : ''}. Comment puis-je vous aider ?`,
                    }}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Suggestions rapides
                  </p>
                  <div className="space-y-1.5">
                    {ctx.suggestions(subject || 'ce sujet').map((s, i) => (
                      <button
                        key={i}
                        onClick={() => send(s)}
                        className="w-full text-left px-3 py-2.5 bg-gray-800/50 hover:bg-gray-700/60 border border-gray-700/30 hover:border-gray-600/50 rounded-xl text-xs text-gray-400 hover:text-gray-200 transition-all flex items-center gap-2 group"
                      >
                        <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {m.role === 'assistant' && (
                      <div className={`w-7 h-7 bg-gradient-to-br ${ctx.color} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        m.role === 'user'
                          ? `bg-gradient-to-r ${ctx.color} text-white rounded-tr-sm shadow-md`
                          : 'bg-gray-800/70 border border-gray-700/40 text-gray-200 rounded-tl-sm'
                      }`}
                    >
                      {m.role === 'assistant' ? (
                        <div dangerouslySetInnerHTML={{ __html: renderMd(m.content) }} />
                      ) : (
                        m.content
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className={`w-7 h-7 bg-gradient-to-br ${ctx.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-gray-800/70 border border-gray-700/40 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${d * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-800/40 flex-shrink-0">
            <div
              className={`flex items-end gap-2 bg-gray-800/60 border rounded-xl transition-all ${
                input ? 'border-indigo-500/40 ring-1 ring-indigo-500/10' : 'border-gray-700/40'
              }`}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px';
                }}
                onKeyDown={handleKey}
                placeholder="Posez votre question..."
                rows={1}
                className="flex-1 px-3 py-2.5 bg-transparent text-white placeholder-gray-600 outline-none resize-none text-xs leading-relaxed"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className={`w-8 h-8 mr-1.5 mb-1.5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  input.trim() && !loading
                    ? `bg-gradient-to-r ${ctx.color} text-white shadow-md hover:scale-105 active:scale-95`
                    : 'bg-gray-700/60 text-gray-600 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-center text-[9px] text-gray-700 mt-1.5">
              Entrée pour envoyer · Shift+Entrée pour sauter une ligne
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AiAssistant;