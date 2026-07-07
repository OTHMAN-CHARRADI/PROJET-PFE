import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import {
  BookOpen, Code, Globe, Database, Shield, Cpu, Gamepad2, Zap,
  ChevronRight, Lock, CheckCircle, Search, ArrowRight, Layers, Server
} from 'lucide-react';

const CHAPTERS = [
  {
    id: 1,
    title: 'Fondamentaux',
    icon: Zap,
    gradient: 'from-indigo-500 to-violet-500',
    description: 'Algorithmique, POO, Design Patterns, Architecture logicielle',
    lessons: [
      { title: 'Introduction à l\'algorithmique', topic: 'Algorithmique', done: false },
      { title: 'Structures de données essentielles', topic: 'Structures de données', done: false },
      { title: 'Programmation Orientée Objet', topic: 'POO', done: false },
      { title: 'Design Patterns courants', topic: 'Design Patterns', done: false },
      { title: 'Architecture logicielle', topic: 'Architecture logicielle', done: false },
    ],
  },
  {
    id: 2,
    title: 'Langages populaires',
    icon: Code,
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Python, Java, JavaScript, TypeScript, C/C++',
    lessons: [
      { title: 'Python — bases et bonnes pratiques', topic: 'Python', done: false },
      { title: 'Java — POO avancée', topic: 'Java', done: false },
      { title: 'JavaScript moderne (ES2023)', topic: 'JavaScript', done: false },
      { title: 'TypeScript — typage statique', topic: 'TypeScript', done: false },
      { title: 'C/C++ — gestion mémoire', topic: 'C++', done: false },
    ],
  },
  {
    id: 3,
    title: 'Web Frontend',
    icon: Globe,
    gradient: 'from-cyan-500 to-blue-500',
    description: 'HTML, CSS, React, Vue.js, Tailwind CSS',
    lessons: [
      { title: 'HTML5 sémantique', topic: 'HTML', done: false },
      { title: 'CSS moderne et Flexbox/Grid', topic: 'CSS', done: false },
      { title: 'React — hooks et composants', topic: 'React', done: false },
      { title: 'Vue.js — composition API', topic: 'Vue.js', done: false },
      { title: 'Tailwind CSS', topic: 'Tailwind CSS', done: false },
    ],
  },
  {
    id: 4,
    title: 'Web Backend',
    icon: Server,
    gradient: 'from-violet-500 to-purple-500',
    description: 'Node.js, Spring Boot, Django, FastAPI, REST',
    lessons: [
      { title: 'Node.js & Express', topic: 'Node.js', done: false },
      { title: 'Spring Boot', topic: 'Spring Boot', done: false },
      { title: 'Django & Flask', topic: 'Django', done: false },
      { title: 'FastAPI', topic: 'FastAPI', done: false },
      { title: 'Conception d\'API REST', topic: 'API REST', done: false },
    ],
  },
  {
    id: 5,
    title: 'Bases de données',
    icon: Database,
    gradient: 'from-amber-500 to-orange-500',
    description: 'SQL, PostgreSQL, MongoDB, Redis',
    lessons: [
      { title: 'SQL — requêtes et optimisation', topic: 'SQL', done: false },
      { title: 'PostgreSQL avancé', topic: 'PostgreSQL', done: false },
      { title: 'MongoDB — NoSQL', topic: 'MongoDB', done: false },
      { title: 'Redis — cache et sessions', topic: 'Redis', done: false },
      { title: 'ORM — Sequelize, Hibernate', topic: 'Hibernate', done: false },
    ],
  },
  {
    id: 6,
    title: 'Systèmes & DevOps',
    icon: Cpu,
    gradient: 'from-purple-500 to-fuchsia-500',
    description: 'Docker, Kubernetes, Linux, Git, CI/CD',
    lessons: [
      { title: 'Git — workflow avancé', topic: 'Git', done: false },
      { title: 'Docker & Docker Compose', topic: 'Docker', done: false },
      { title: 'Linux — administration', topic: 'Linux', done: false },
      { title: 'CI/CD — GitHub Actions', topic: 'GitHub Actions', done: false },
      { title: 'Kubernetes — orchestration', topic: 'Kubernetes', done: false },
    ],
  },
  {
    id: 7,
    title: 'Sécurité',
    icon: Shield,
    gradient: 'from-rose-500 to-pink-500',
    description: 'Cybersécurité, OWASP, Cryptographie, JWT',
    lessons: [
      { title: 'OWASP Top 10', topic: 'Cybersécurité', done: false },
      { title: 'Cryptographie appliquée', topic: 'Cryptographie', done: false },
      { title: 'OAuth2 & JWT', topic: 'JWT', done: false },
      { title: 'Sécurité des APIs', topic: 'Sécurité Web', done: false },
      { title: 'Pentesting — bases', topic: 'Pentesting', done: false },
    ],
  },
  {
    id: 8,
    title: 'Intelligence Artificielle',
    icon: Zap,
    gradient: 'from-pink-500 to-rose-500',
    description: 'Machine Learning, Deep Learning, NLP, TensorFlow',
    lessons: [
      { title: 'Machine Learning — Introduction', topic: 'Machine Learning', done: false },
      { title: 'Réseaux de neurones', topic: 'Deep Learning', done: false },
      { title: 'NLP — traitement du langage', topic: 'NLP', done: false },
      { title: 'TensorFlow & PyTorch', topic: 'TensorFlow', done: false },
      { title: 'Transformers & LLMs', topic: 'Transformers', done: false },
    ],
  },
];

const Chapter = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = CHAPTERS.filter(ch =>
    search === '' ||
    ch.title.toLowerCase().includes(search.toLowerCase()) ||
    ch.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <div className="absolute top-20 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-3xl animate-pulse-slow" />
            <div className="absolute inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <BookOpen className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Chapitres & Modules</h1>
          <p className="text-gray-400">Explorez les leçons par thème et progressez à votre rythme</p>
        </div>

        {}
        <div className="max-w-lg mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un chapitre..."
              className="w-full pl-11 pr-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all text-sm backdrop-blur-sm"
            />
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {filtered.map((chapter) => {
            const Icon = chapter.icon;
            const isExpanded = expandedId === chapter.id;

            return (
              <div
                key={chapter.id}
                className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden hover:border-gray-700/80 transition-all duration-300"
              >
                {}
                <div className={`h-1 bg-gradient-to-r ${chapter.gradient}`} />

                {}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : chapter.id)}
                  className="w-full flex items-center gap-4 p-6 text-left hover:bg-gray-800/20 transition-colors"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${chapter.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold">{chapter.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{chapter.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-500 bg-gray-800/60 px-2.5 py-1 rounded-lg">
                      {chapter.lessons.length} leçons
                    </span>
                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-2 border-t border-gray-800/40 pt-4 animate-fade-in">
                    {chapter.lessons.map((lesson, i) => (
                      <button
                        key={i}
                        onClick={() => navigate('/lecon', { state: { topic: lesson.topic, title: lesson.title } })}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left bg-gray-800/30 hover:bg-gray-800/60 border border-transparent hover:border-gray-700/40 transition-all duration-200 group"
                      >
                        <div className="w-7 h-7 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                          {lesson.done
                            ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                            : <BookOpen className="w-4 h-4 text-indigo-400" />
                          }
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">{lesson.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">Aucun chapitre trouvé pour "{search}"</p>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Chapter;
