import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import { generateExercise, getProgress, getExerciseHistory } from '../service/Api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Loader2, Search, Dumbbell, Sparkles, Code, Globe, Database, Shield, Cpu,
  BookOpen, Gamepad2, Zap, ChevronDown, ChevronUp, RotateCcw, Copy, Check, Clock
} from 'lucide-react';




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




const ExercisePage = () => {
  const { user } = useAuth();

  const [topic, setTopic] = useState(ALL_TOPICS[0]);
  const [level, setLevel] = useState(user?.level || 'débutant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exercise, setExercise] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);
  const [levelLoading, setLevelLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [exerciseHistory, setExerciseHistory] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prog, hist] = await Promise.all([getProgress(), getExerciseHistory()]);
        setProgressData(prog);
        setExerciseHistory(hist);
      } catch (err) { console.error(err); }
      finally { setLevelLoading(false); }
    };
    fetchData();
  }, []);


  useEffect(() => {
    if (!progressData) return;
    const topicQuizzes = (progressData.quiz_history || []).filter(
      q => q.topic?.toLowerCase() === topic.toLowerCase()
    );
    if (topicQuizzes.length === 0) { setLevel('débutant'); return; }
    const avg = topicQuizzes.reduce((s, q) =>
      s + (q.total_questions > 0 ? (q.score / q.total_questions) * 100 : 0), 0
    ) / topicQuizzes.length;
    if (avg >= 80) setLevel('avancé');
    else if (avg >= 50) setLevel('intermédiaire');
    else setLevel('débutant');
  }, [topic, progressData]);

  const filteredCategories = TOPIC_CATEGORIES
    .map(cat => ({
      ...cat,
      topics: searchQuery.trim()
        ? cat.topics.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        : cat.topics,
    }))
    .filter(cat => cat.topics.length > 0);

  const handleGenerate = async () => {
    setError(''); setLoading(true); setExercise(null); setShowSolution(false);
    try {
      const data = await generateExercise(topic, level);
      if (data?.content) {
        setExercise({ topic, level, content: data.content });

        try { setExerciseHistory(await getExerciseHistory()); } catch (_) { }
      } else {
        setError("L'exercice généré est vide. Veuillez réessayer.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la génération de l'exercice.");
    } finally { setLoading(false); }
  };

  const handleCopy = async () => {
    if (!exercise?.content) return;
    await navigator.clipboard.writeText(exercise.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const levelColor = level === 'avancé' ? 'text-rose-400' : level === 'intermédiaire' ? 'text-amber-400' : 'text-emerald-400';
  const levelBg = level === 'avancé' ? 'bg-rose-500/10 border-rose-500/30' : level === 'intermédiaire' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30';


  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div"
          customStyle={{ borderRadius: '0.75rem', margin: '0.75rem 0', fontSize: '0.85rem' }} {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>{children}</code>
      );
    },
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {}
      <div className="absolute top-20 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />
      <div className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {}
        {!exercise && !loading && (
          <div className="animate-fade-in-up">
            {}
            <div className="text-center mb-10">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-3xl animate-pulse-slow" />
                <div className="absolute inset-1 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                  <Dumbbell className="w-9 h-9 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Exercices pratiques</h1>
              <p className="text-gray-400">Générez un exercice de programmation avec solution détaillée</p>
            </div>

            {}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
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
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Tapez pour filtrer les sujets"
                      className="w-full pl-11 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none transition-all text-sm" />
                  </div>
                </div>

                {}
                <div className="mb-6 max-h-64 overflow-y-auto pr-1 space-y-4 custom-scroll">
                  {filteredCategories.map(cat => {
                    const CatIcon = cat.icon;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center gap-2 mb-2">
                          <CatIcon className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{cat.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cat.topics.map(t => (
                            <button key={t} onClick={() => { setTopic(t); setSearchQuery(''); }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${topic === t
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/20'
                                : 'bg-gray-800/40 border-gray-700/40 text-gray-400 hover:border-emerald-500/30 hover:text-gray-300'
                                }`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <p className="text-gray-500 text-sm">Aucun sujet trouvé pour <span className="text-white font-medium">"{searchQuery}"</span></p>
                      <button
                        onClick={() => { setTopic(searchQuery.trim()); setSearchQuery(''); }}
                        className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Utiliser "{searchQuery}" comme sujet personnalisé
                      </button>
                    </div>
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
                        <span className={`text-sm font-bold capitalize ${levelColor}`}>{level}</span>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <button onClick={handleGenerate} disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 text-base">
                  <Dumbbell className="w-5 h-5" /> Générer l'exercice
                </button>
              </div>
            </div>

            {/* Exercise history */}
            {exerciseHistory.length > 0 && (
              <div className="mt-8 bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden animate-fade-in">
                <div className="h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-teal-500/15 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Historique des exercices</h3>
                      <p className="text-xs text-gray-500">{exerciseHistory.length} {exerciseHistory.length > 1 ? 'exercices générés' : 'exercice généré'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll pr-1">
                    {exerciseHistory.map((h) => {
                      const lvlColor = h.level === 'avancé' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : h.level === 'intermédiaire' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                      return (
                        <div key={h.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                              <Dumbbell className="w-4 h-4 text-emerald-400" />
                            </div>
                            <span className="text-sm text-white font-medium">{h.topic}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs capitalize px-2.5 py-1 rounded-full border ${lvlColor}`}>{h.level}</span>
                            <span className="text-xs text-gray-500">
                              {h.created_at ? new Date(h.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
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

        {/* ===== LOADING ===== */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-gray-800 border-t-emerald-500 animate-spin" />
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-b-teal-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-white font-semibold text-lg mb-1">Génération en cours...</p>
            <p className="text-gray-500 text-sm">L'IA prépare un exercice sur <span className="text-emerald-400">{topic}</span></p>
          </div>
        )}

        {}
        {exercise && !loading && (() => {

          const marker = '===SOLUTION===';
          const parts = exercise.content.split(marker);
          const enonce = parts[0]?.trim() || exercise.content;
          const solution = parts.length > 1 ? parts.slice(1).join(marker).trim() : null;

          return (
            <div className="animate-fade-in-up">
              {}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{exercise.topic}</h2>
                    <span className={`text-xs capitalize ${levelColor}`}>{exercise.level}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all">
                    {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" />Copié !</> : <><Copy className="w-3.5 h-3.5" />Copier</>}
                  </button>
                  <button onClick={handleGenerate}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-600 transition-all">
                    <RotateCcw className="w-3.5 h-3.5" /> Nouvel exercice
                  </button>
                </div>
              </div>

              {}
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden mb-4">
                <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                <div className="px-8 pt-6 pb-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-emerald-500/15 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Énoncé</h3>
                  </div>
                </div>
                <div className="px-8 pb-8 markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                    {enonce}
                  </ReactMarkdown>
                </div>
              </div>

              {}
              {solution && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${showSolution
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/15'
                      : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10'
                      }`}
                  >
                    {showSolution ? (
                      <><ChevronUp className="w-5 h-5" /> Masquer la solution</>
                    ) : (
                      <><ChevronDown className="w-5 h-5" /> 💡 Afficher la solution</>
                    )}
                  </button>
                </div>
              )}

              {}
              {solution && showSolution && (
                <div className="bg-gray-900/60 backdrop-blur-sm border border-amber-500/20 rounded-2xl overflow-hidden mb-6 animate-fade-in-up">
                  <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />
                  <div className="px-8 pt-6 pb-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 bg-amber-500/15 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Solution & Explication</h3>
                    </div>
                  </div>
                  <div className="px-8 pb-8 markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                      {solution}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {}
              {!solution && (
                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-4 mb-6">
                  <p className="text-xs text-gray-500 text-center italic">L'exercice n'a pas pu être séparé automatiquement. Tout le contenu est affiché ci-dessus.</p>
                </div>
              )}

              {}
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => { setExercise(null); setError(''); setShowSolution(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white font-medium hover:bg-gray-700/60 hover:border-gray-600/50 active:scale-95 transition-all">
                  <Sparkles className="w-5 h-5" /> Nouvel exercice
                </button>
                <button onClick={handleGenerate}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all">
                  <RotateCcw className="w-5 h-5" /> Même sujet, autre exercice
                </button>
              </div>
            </div>
          );
        })()}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default ExercisePage;