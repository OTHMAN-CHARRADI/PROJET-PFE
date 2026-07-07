import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuizCard from '../components/QuizCard';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import { generateQuiz, submitQuiz, getProgress, getQuizHistory } from '../service/Api';
import { Target, Loader2, ArrowRight, RotateCcw, BarChart3, Trophy, CheckCircle, XCircle, Search, Sparkles, Zap, BookOpen, Code, Globe, Database, Shield, Cpu, Gamepad2, Clock } from 'lucide-react';




const TOPIC_CATEGORIES = [
  {
    name: 'Fondamentaux', icon: Zap, color: 'from-indigo-500 to-violet-500',
    topics: ['Algorithmique', 'Structures de données', 'POO', 'Design Patterns', 'Architecture logicielle', 'API REST', 'UML', 'Compilation', 'Systèmes d\'exploitation', 'Théorie des graphes', 'Complexité algorithmique', 'Programmation concurrente', 'Programmation fonctionnelle', 'Génie logiciel', 'Tests unitaires', 'Méthodes agiles']
  },
  {
    name: 'Langages populaires', icon: Code, color: 'from-emerald-500 to-teal-500',
    topics: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Go', 'Rust', 'Kotlin', 'Swift', 'PHP', 'Ruby', 'Dart', 'Scala', 'Lua', 'Perl', 'R', 'MATLAB', 'COBOL', 'Fortran', 'Visual Basic', 'Delphi', 'Pascal', 'Objective-C', 'Groovy', 'Julia', 'Zig', 'Nim', 'Crystal', 'V', 'Hack', 'D']
  },
  {
    name: 'Web Frontend', icon: Globe, color: 'from-cyan-500 to-blue-500',
    topics: ['HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte', 'SvelteKit', 'Astro', 'Solid.js', 'Qwik', 'Ember.js', 'Backbone.js', 'Alpine.js', 'HTMX', 'jQuery', 'Tailwind CSS', 'Bootstrap', 'Sass', 'Less', 'Styled Components', 'Material UI', 'Ant Design', 'Webpack', 'Vite', 'Babel', 'ESLint', 'Storybook']
  },
  {
    name: 'Web Backend', icon: Code, color: 'from-violet-500 to-purple-500',
    topics: ['Node.js', 'Express.js', 'NestJS', 'Fastify', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Spring MVC', 'Laravel', 'Symfony', 'CodeIgniter', 'Ruby on Rails', 'Sinatra', 'ASP.NET', 'ASP.NET Core', 'Gin', 'Echo', 'Fiber', 'Actix', 'Rocket', 'Phoenix', 'Koa', 'Hapi', 'Strapi', 'GraphQL', 'gRPC', 'WebSocket', 'REST API', 'SOAP', 'Microservices']
  },
  {
    name: 'Bases de données', icon: Database, color: 'from-amber-500 to-orange-500',
    topics: ['SQL', 'PL/SQL', 'MySQL', 'PostgreSQL', 'SQLite', 'MongoDB', 'Redis', 'Firebase', 'Cassandra', 'Oracle', 'MariaDB', 'Neo4j', 'CouchDB', 'DynamoDB', 'Elasticsearch', 'InfluxDB', 'Supabase', 'PrismaORM', 'Sequelize', 'TypeORM', 'Mongoose', 'Hibernate', 'Entity Framework']
  },
  {
    name: 'Systèmes & DevOps', icon: Cpu, color: 'from-purple-500 to-fuchsia-500',
    topics: ['Bash', 'PowerShell', 'Shell', 'Git', 'GitHub Actions', 'GitLab CI', 'Docker', 'Docker Compose', 'Kubernetes', 'Linux', 'Windows Server', 'Nginx', 'Apache', 'Jenkins', 'Travis CI', 'CircleCI', 'Terraform', 'Ansible', 'Puppet', 'Chef', 'Vagrant', 'Prometheus', 'Grafana', 'AWS', 'Azure', 'GCP', 'Heroku', 'Vercel', 'Netlify', 'DigitalOcean']
  },
  {
    name: 'Sécurité & Réseaux', icon: Shield, color: 'from-rose-500 to-pink-500',
    topics: ['Cybersécurité', 'Réseaux', 'TCP/IP', 'HTTP/HTTPS', 'DNS', 'SSL/TLS', 'Cryptographie', 'Pentesting', 'OWASP', 'Pare-feu', 'VPN', 'Proxy', 'SSH', 'Wireshark', 'Metasploit', 'Nmap', 'Kali Linux', 'Sécurité Web', 'Injection SQL', 'XSS', 'CSRF', 'OAuth', 'JWT', 'LDAP']
  },
  {
    name: 'Intelligence Artificielle', icon: Zap, color: 'from-pink-500 to-rose-500',
    topics: ['Intelligence Artificielle', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Science', 'Big Data', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'OpenCV', 'Hugging Face', 'LangChain', 'Stable Diffusion', 'Reinforcement Learning', 'Réseaux de neurones', 'CNN', 'RNN', 'Transformers', 'GPT', 'BERT', 'Régression', 'Classification', 'Clustering']
  },
  {
    name: 'Fonctionnels & Académiques', icon: BookOpen, color: 'from-lime-500 to-green-500',
    topics: ['Haskell', 'F#', 'Erlang', 'Elixir', 'OCaml', 'Clojure', 'Scheme', 'Racket', 'Prolog', 'Lisp', 'Common Lisp', 'Smalltalk', 'Ada', 'Eiffel', 'Modula-2', 'Tcl', 'AWK', 'Sed', 'APL', 'J', 'K', 'Forth', 'Factor', 'Io', 'Self', 'Rebol', 'Red']
  },
  {
    name: 'Mobile', icon: Globe, color: 'from-teal-500 to-cyan-500',
    topics: ['React Native', 'Flutter', 'Android (Java/Kotlin)', 'iOS (Swift)', 'Xamarin', '.NET MAUI', 'Ionic', 'Capacitor', 'Cordova', 'SwiftUI', 'Jetpack Compose', 'Expo', 'Kotlin Multiplatform']
  },
  {
    name: 'Game Dev & Embarqué', icon: Gamepad2, color: 'from-orange-500 to-red-500',
    topics: ['Unity', 'Unreal Engine', 'Godot', 'GDScript', 'Pygame', 'Phaser', 'Three.js', 'WebGL', 'OpenGL', 'Vulkan', 'DirectX', 'LÖVE 2D', 'GameMaker', 'RPG Maker', 'Arduino', 'Raspberry Pi', 'ESP32', 'VHDL', 'Verilog', 'SystemVerilog', 'FPGA', 'IoT', 'Processing', 'MicroPython', 'CircuitPython']
  },
  {
    name: 'Scripting & Automatisation', icon: Code, color: 'from-sky-500 to-blue-500',
    topics: ['AutoHotkey', 'AppleScript', 'VBA', 'Batch', 'Make', 'CMake', 'Gradle', 'Maven', 'npm', 'yarn', 'pnpm', 'pip', 'Homebrew', 'Chocolatey', 'Regex', 'JSON', 'XML', 'YAML', 'TOML', 'Markdown', 'LaTeX']
  },
];

const ALL_TOPICS = TOPIC_CATEGORIES.flatMap(c => c.topics);

const QuizPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('config');
  const [topic, setTopic] = useState(ALL_TOPICS[0]);
  const [level, setLevel] = useState(user?.level || 'débutant');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [levelLoading, setLevelLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prog, hist] = await Promise.all([getProgress(), getQuizHistory()]);
        setProgressData(prog);
        setQuizHistory(hist);
      } catch (err) { console.error('Erreur chargement données:', err); }
      finally { setLevelLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!progressData) return;
    const topicQuizzes = (progressData.quiz_history || []).filter(q => q.topic?.toLowerCase() === topic.toLowerCase());
    if (topicQuizzes.length === 0) { setLevel('débutant'); return; }
    const avg = topicQuizzes.reduce((s, q) => s + (q.total_questions > 0 ? (q.score / q.total_questions) * 100 : 0), 0) / topicQuizzes.length;
    if (avg >= 80) setLevel('avancé');
    else if (avg >= 50) setLevel('intermédiaire');
    else setLevel('débutant');
  }, [topic, progressData]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return TOPIC_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return TOPIC_CATEGORIES.map(cat => ({
      ...cat,
      topics: cat.topics.filter(t => t.toLowerCase().includes(q)),
    })).filter(cat => cat.topics.length > 0);
  }, [searchQuery]);

  const handleGenerate = async () => {
    setError(''); setLoading(true);
    try {
      const data = await generateQuiz(topic, level, 20);
      if (data.questions?.length > 0) {
        setQuestions(data.questions); setAnswers([]); setCurrentQ(0);
        setSelectedAnswer(null); setShowResult(false); setStep('quiz');
      } else { setError('Erreur lors de la génération du quiz.'); }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la génération du quiz.');
    } finally { setLoading(false); }
  };

  const handleSelect = (option) => {
    if (showResult) return;
    setSelectedAnswer(option); setShowResult(true);
    const q = questions[currentQ];
    setAnswers(prev => [...prev, { question: q.question, user_answer: option, correct_answer: q.correct_answer, explanation: q.explanation || '' }]);
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1); setSelectedAnswer(null); setShowResult(false);
    } else {
      setLoading(true);
      try {
        setQuizResult(await submitQuiz(topic, level, answers));
        setStep('results');

        try { setQuizHistory(await getQuizHistory()); } catch (_) { }
      }
      catch (err) { setError(err.response?.data?.detail || 'Erreur lors de la soumission du quiz.'); }
      finally { setLoading(false); }
    }
  };

  const handleRestart = () => {
    setStep('config'); setQuestions([]); setAnswers([]); setCurrentQ(0);
    setSelectedAnswer(null); setShowResult(false); setQuizResult(null); setError(''); setSearchQuery('');
  };

  const getScoreMessage = (pct) => {
    if (pct >= 80) return { text: 'Excellent !', emoji: '🎉', color: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-400' };
    if (pct >= 50) return { text: 'Bien !', emoji: '👍', color: 'text-amber-400', gradient: 'from-amber-500 to-orange-400' };
    return { text: 'À travailler !', emoji: '💪', color: 'text-rose-400', gradient: 'from-rose-500 to-pink-400' };
  };

  const levelColor = level === 'avancé' ? 'text-rose-400' : level === 'intermédiaire' ? 'text-amber-400' : 'text-emerald-400';
  const levelBg = level === 'avancé' ? 'bg-rose-500/10 border-rose-500/30' : level === 'intermédiaire' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30';

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {}
      <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />
      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {}
        {step === 'config' && (
          <div className="animate-fade-in-up">
            {}
            <div className="text-center mb-10">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-3xl animate-pulse-slow" />
                <div className="absolute inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                  <Sparkles className="w-9 h-9 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Lancer un Quiz</h1>
              <p className="text-gray-400">Choisissez un sujet et testez vos connaissances</p>
            </div>

            {}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden">
              {}
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              <div className="p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
                    <span>⚠️</span>{error}
                  </div>
                )}

                {}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rechercher un sujet</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tapez pour filtrer les sujets"
                      className="w-full pl-11 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {}
                <div className="mb-6 max-h-72 overflow-y-auto pr-1 space-y-4 custom-scroll">
                  {filteredCategories.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center gap-2 mb-2">
                          <CatIcon className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{cat.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cat.topics.map(t => (
                            <button
                              key={t}
                              onClick={() => { setTopic(t); setSearchQuery(''); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${topic === t
                                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 ring-1 ring-indigo-500/20'
                                  : 'bg-gray-800/40 border-gray-700/40 text-gray-400 hover:border-indigo-500/30 hover:text-gray-300'
                                }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-6">Aucun sujet trouvé pour "{searchQuery}"</p>
                  )}
                </div>

                {}
                <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Sujet sélectionné</p>
                      <p className="text-white font-semibold">{topic}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Niveau (auto)</p>
                      {levelLoading ? (
                        <Loader2 className="w-4 h-4 text-gray-500 animate-spin ml-auto" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold capitalize ${levelColor}`}>{level}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${levelBg}`}>
                            {(() => {
                              const count = (progressData?.quiz_history || []).filter(q => q.topic?.toLowerCase() === topic.toLowerCase()).length;
                              return count === 0 ? 'Nouveau' : `${count} quiz`;
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <button onClick={handleGenerate} disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 text-base">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Génération en cours...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" />Générer le quiz — 20 questions</>
                  )}
                </button>
              </div>
            </div>

            {}
            {quizHistory.length > 0 && (
              <div className="mt-8 bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Historique des quiz</h3>
                      <p className="text-xs text-gray-500">{quizHistory.length} {quizHistory.length > 1 ? 'quiz enregistrés' : 'quiz enregistré'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto custom-scroll pr-1">
                    {quizHistory.map((q) => {
                      const pct = q.total_questions ? Math.round((q.score / q.total_questions) * 100) : 0;
                      const lvlColor = q.level === 'avancé' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : q.level === 'intermédiaire' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                      const scoreColor = pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400';
                      const scoreBg = pct >= 80 ? 'from-emerald-500 to-teal-400' : pct >= 50 ? 'from-amber-500 to-orange-400' : 'from-rose-500 to-pink-400';
                      const scoreBadge = pct >= 80 ? { label: 'Excellent', icon: '🏆', bg: 'bg-emerald-500/15 text-emerald-400' } : pct >= 50 ? { label: 'Bien', icon: '👍', bg: 'bg-amber-500/15 text-amber-400' } : { label: 'À revoir', icon: '📖', bg: 'bg-rose-500/15 text-rose-400' };
                      return (
                        <div key={q.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Target className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm text-white font-medium block truncate">{q.topic}</span>
                              <span className="text-xs text-gray-500">
                                {q.taken_at ? new Date(q.taken_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-xs capitalize px-2.5 py-1 rounded-full border ${lvlColor}`}>{q.level || '—'}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${scoreColor}`}>{q.score}/{q.total_questions}</span>
                              <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full bg-gradient-to-r ${scoreBg}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${scoreBadge.bg}`}>
                              <span>{scoreBadge.icon}</span> {scoreBadge.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {}
        {step === 'quiz' && questions[currentQ] && (
          <div>
            {}
            <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
              <span className="text-xs font-medium text-gray-500 bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-700/40">{topic}</span>
              <span className={`text-xs font-medium capitalize px-3 py-1.5 rounded-lg border ${levelBg} ${levelColor}`}>{level}</span>
            </div>

            <QuizCard
              question={questions[currentQ].question}
              options={questions[currentQ].options}
              selectedAnswer={selectedAnswer}
              correctAnswer={questions[currentQ].correct_answer}
              onSelect={handleSelect}
              showResult={showResult}
              explanation={questions[currentQ].explanation}
              questionNumber={currentQ + 1}
              totalQuestions={questions.length}
            />

            {showResult && (
              <div className="flex justify-end animate-fade-in">
                <button onClick={handleNext} disabled={loading}
                  className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    currentQ < questions.length - 1
                      ? <><span>Question suivante</span><ArrowRight className="w-5 h-5" /></>
                      : <><span>Terminer le quiz</span><Trophy className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {}
        {step === 'results' && quizResult && (
          <div className="animate-fade-in-up">
            {}
            <div className="text-center mb-12">
              <div className="relative w-44 h-44 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" stroke="#1f2937" strokeWidth="8" fill="none" />
                  <circle cx="60" cy="60" r="52" stroke="url(#scoreGrad)" strokeWidth="8" fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${quizResult.percentage * 3.27} 327`}
                    className="transition-all duration-1000 ease-out" />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">{Math.round(quizResult.percentage)}%</span>
                  <span className="text-sm text-gray-400 font-medium">{quizResult.score}/{quizResult.total_questions}</span>
                </div>
              </div>

              <p className="text-3xl font-bold mb-1">
                <span className={getScoreMessage(quizResult.percentage).color}>{getScoreMessage(quizResult.percentage).emoji} {getScoreMessage(quizResult.percentage).text}</span>
              </p>
              <p className="text-gray-500">{quizResult.topic} — <span className="capitalize">{quizResult.level}</span></p>

              {}
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">{quizResult.score} Correct !</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-semibold">{quizResult.total_questions - quizResult.score} Incorrect</span>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-3 mb-10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-500" /> Détail des réponses
              </h3>
              {quizResult.details?.map((d, i) => (
                <div key={i} className={`p-5 rounded-xl border transition-all hover:scale-[1.01] ${d.is_correct
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${d.is_correct ? 'bg-emerald-500/15' : 'bg-red-500/15'
                      }`}>
                      {d.is_correct
                        ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                        : <XCircle className="w-4 h-4 text-red-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium mb-2">{d.question}</p>
                      <p className="text-xs text-gray-400">
                        Votre réponse : <span className={d.is_correct ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>{d.user_answer}</span>
                      </p>
                      {!d.is_correct && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Réponse correcte : <span className="text-emerald-400 font-medium">{d.correct_answer}</span>
                        </p>
                      )}
                      {d.explanation && (
                        <p className="text-xs text-gray-500 mt-2 italic leading-relaxed">{d.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {}
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white font-medium hover:bg-gray-700/60 hover:border-gray-600/50 active:scale-95 transition-all">
                <RotateCcw className="w-5 h-5" /> Nouveau quiz
              </button>
              <button onClick={() => navigate('/progress')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all">
                <BarChart3 className="w-5 h-5" /> Ma Progression
              </button>
            </div>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default QuizPage;
