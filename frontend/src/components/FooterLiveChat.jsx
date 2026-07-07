import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, Sparkles, ChevronRight, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';


const PYTHON_AI_URL = 'http://localhost:8000/api/chat';

const SYSTEM_PROMPT = `Tu es InfoBot, l'assistant officiel de la plateforme InfoAcademy.
Tu réponds UNIQUEMENT aux questions liées à la plateforme InfoAcademy : fonctionnalités, cours disponibles, inscription, connexion, quiz, exercices, progression, problèmes techniques courants, et toute autre question sur l'utilisation de la plateforme.

Si une question ne concerne pas InfoAcademy, réponds poliment : "Je suis spécialisé dans les questions liées à InfoAcademy. Pour toute autre question, je vous invite à consulter notre équipe via le formulaire de contact."

Réponds toujours en français, de façon concise, claire et amicale. Utilise des emojis avec modération.

Informations clés sur la plateforme :
- InfoAcademy est une plateforme d'apprentissage en informatique, programmation et structures de données
- Elle propose des cours vidéo, des quiz interactifs et des exercices pratiques
- Un assistant IA (Infobot) est disponible dans chaque cours pour aider les étudiants
- La progression est suivie automatiquement
- Il existe des plans gratuit et premium
- L'inscription est simple et rapide via /register
- Support disponible via le formulaire de contact dans le footer`;

const SUGGESTIONS = [
  'Comment créer un compte ?',
  'Quels cours sont disponibles ?',
  'Comment fonctionne le quiz ?',
  'Comment suivre ma progression ?',
  "J'ai un problème de connexion",
];

const renderMd = (text) => {
  if (!text) return '';
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="bg-gray-950 rounded-lg p-3 my-2 overflow-x-auto text-xs text-emerald-300 border border-gray-700/50"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-700/60 text-emerald-300 px-1 py-0.5 rounded text-xs">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-300">$1</em>')
    .replace(/^- (.+)$/gm, '<li class="text-gray-300 ml-3 text-xs list-disc">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};

const FooterLiveChat = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!minimized) setTimeout(() => inputRef.current?.focus(), 150);
  }, [minimized]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    // Historique de conversation (sans le message actuel)
    const conversationHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      // ✅ system_prompt envoyé en champ dédié → le service Python l'utilise directement
      const response = await fetch(PYTHON_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          level: 'débutant',
          system_prompt: SYSTEM_PROMPT,
          conversation_history: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data?.response || "Je n'ai pas pu traiter votre demande.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('[FooterLiveChat] Erreur:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '❌ Le service IA est temporairement indisponible. Vérifiez que le service Python tourne sur le port 8000.',
        },
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

  return (
    <div
      className="fixed bottom-6 right-6 z-[9998] flex flex-col"
      style={{ width: '380px' }}
    >
      <div
        className={`bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col ring-2 ring-violet-500/20 transition-all duration-300 ${minimized ? 'h-14' : 'h-[520px]'}`}
        style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 h-14 bg-gradient-to-r from-violet-600 to-indigo-600 flex-shrink-0">
          <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center ring-1 ring-white/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-none">Assistant InfoAcademy</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-white/60">En ligne · Répond en quelques secondes</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/15 transition-all"
                title="Réinitialiser"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setMinimized((m) => !m)}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/15 transition-all"
            >
              {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/15 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
            >
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-gray-800/70 border border-gray-700/40 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-gray-300 leading-relaxed max-w-[85%]">
                      Bonjour ! 👋 Je suis <strong className="text-white">InfoBot</strong>, votre assistant dédié à la plateforme InfoAcademy. Je peux répondre à toutes vos questions sur nos cours, votre compte, et bien plus encore.
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Questions fréquentes
                    </p>
                    <div className="space-y-1.5">
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => send(s)}
                          className="w-full text-left px-3 py-2.5 bg-gray-800/50 hover:bg-gray-700/60 border border-gray-700/30 hover:border-violet-500/30 rounded-xl text-xs text-gray-400 hover:text-gray-200 transition-all flex items-center gap-2 group"
                        >
                          <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-violet-400 flex-shrink-0 transition-colors" />
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
                        <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${m.role === 'user'
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-violet-500/20'
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
                      <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-gray-800/70 border border-gray-700/40 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
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
            <div className="px-3 pb-3 pt-2 border-t border-gray-800/50 flex-shrink-0">
              <div
                className={`flex items-end gap-2 bg-gray-800/60 border rounded-xl transition-all ${input ? 'border-violet-500/40 ring-1 ring-violet-500/10' : 'border-gray-700/40'
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
                  placeholder="Posez votre question sur la plateforme…"
                  rows={1}
                  className="flex-1 px-3 py-2.5 bg-transparent text-white placeholder-gray-600 outline-none resize-none text-xs leading-relaxed"
                  style={{ maxHeight: '80px' }}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className={`w-8 h-8 mr-1.5 mb-1.5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${input.trim() && !loading
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:scale-105 active:scale-95'
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
                Spécialisé pour InfoAcademy · Entrée pour envoyer
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FooterLiveChat;