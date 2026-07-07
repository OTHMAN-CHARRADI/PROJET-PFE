import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import { sendMessage } from '../service/Api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  BookOpen, ArrowLeft, Target, Dumbbell, MessageSquare,
  Loader2, RefreshCw, ChevronRight, Lightbulb, Copy, Check
} from 'lucide-react';

const MarkdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
        customStyle={{ borderRadius: '0.75rem', margin: '0.75rem 0', fontSize: '0.85rem' }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>{children}</code>
    );
  },
};

const Lecon = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || 'Python';
  const title = location.state?.title || `Introduction à ${topic}`;

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateLesson = async () => {
    setLoading(true);
    setError('');
    setContent('');
    try {
      const prompt = `Génère une leçon complète et pédagogique sur le sujet : "${topic}".

La leçon doit inclure :
1. **Introduction** — pourquoi ce sujet est important
2. **Concepts clés** — explications claires avec analogies
3. **Exemples de code** — au moins 2-3 exemples pratiques commentés
4. **Points importants** — résumé des choses à retenir
5. **Exercice pratique** — un petit exercice pour tester la compréhension

Utilise des exemples concrets et accessibles. La leçon est destinée à des étudiants en informatique.`;

      const response = await sendMessage(prompt);
      setContent(response.content || '');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la génération de la leçon.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateLesson();
  }, [topic]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 animate-fade-in">
          <button onClick={() => navigate('/chapters')} className="hover:text-indigo-400 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Chapitres
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-indigo-400">{topic}</span>
        </div>

        {}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 flex-shrink-0">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <span className="text-sm text-indigo-400 mt-0.5 block">{topic}</span>
              </div>
            </div>

            {}
            <div className="flex items-center gap-2">
              {!loading && content && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                >
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" />Copié</> : <><Copy className="w-3.5 h-3.5" />Copier</>}
                </button>
              )}
              <button
                onClick={generateLesson}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Régénérer
              </button>
            </div>
          </div>
        </div>

        {}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-gray-800 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-white font-semibold text-lg mb-1">Génération de la leçon...</p>
            <p className="text-gray-500 text-sm">L'IA prépare le cours sur <span className="text-indigo-400">{topic}</span></p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3 mb-6">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Content */}
        {content && !loading && (
          <div className="animate-fade-in-up">
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden mb-6">
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <div className="px-8 py-8 markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Next actions */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-semibold">Continuer votre apprentissage</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => navigate('/quiz', { state: { topic } })}
                  className="flex items-center gap-3 px-4 py-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all text-sm font-medium"
                >
                  <Target className="w-5 h-5" /> Quiz sur {topic}
                </button>
                <button
                  onClick={() => navigate('/exercises', { state: { topic } })}
                  className="flex items-center gap-3 px-4 py-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-sm font-medium"
                >
                  <Dumbbell className="w-5 h-5" /> Exercice pratique
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className="flex items-center gap-3 px-4 py-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all text-sm font-medium"
                >
                  <MessageSquare className="w-5 h-5" /> Poser une question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Lecon;
