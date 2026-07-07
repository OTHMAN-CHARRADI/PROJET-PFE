import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import {
  Bot, MessageSquare, BookOpen, Target, BarChart3, ArrowRight,
  Sparkles, Zap, Code2, Brain, Shield, Rocket, CheckCircle2,
  ChevronRight, Terminal, GraduationCap, Users, Globe,
  Star, Award, Clock, ChevronDown, Play, Menu, X, Send, PenLine,
  PlayCircle, Layers, Video
} from 'lucide-react';


const features = [
  {
    icon: GraduationCap, gradient: 'from-violet-500 to-indigo-500',
    bg: 'bg-violet-500/10', ring: 'ring-violet-500/20',
    title: 'Cours Structurés',
    desc: 'Des cours complets organisés en sections avec vidéos, contenu théorique et quiz intégrés — suivez une progression guidée du début à la fin.',
  },
  {
    icon: MessageSquare, gradient: 'from-blue-500 to-cyan-400',
    bg: 'bg-blue-500/10', ring: 'ring-blue-500/20',
    title: 'Chat IA Intelligent',
    desc: 'Dialoguez avec un assistant qui comprend le contexte, adapte ses explications à votre niveau et fournit du code prêt à l\'emploi.',
  },
  {
    icon: BookOpen, gradient: 'from-emerald-500 to-teal-400',
    bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20',
    title: 'Exercices Sur-Mesure',
    desc: 'Des exercices progressifs générés dynamiquement avec des solutions commentées et des indices personnalisés.',
  },
  {
    icon: Target, gradient: 'from-orange-500 to-amber-400',
    bg: 'bg-orange-500/10', ring: 'ring-orange-500/20',
    title: 'Quiz Adaptatifs',
    desc: '20 questions par quiz, feedback instantané, explications détaillées et ajustement automatique de votre niveau.',
  },
  {
    icon: BarChart3, gradient: 'from-purple-500 to-pink-400',
    bg: 'bg-purple-500/10', ring: 'ring-purple-500/20',
    title: 'Suivi de Progression',
    desc: 'Tableaux de bord interactifs, scores par sujet, historique complet et recommandations personnalisées.',
  },
];

const topics = [
  { name: 'Python', color: 'from-yellow-400 to-yellow-600' },
  { name: 'JavaScript', color: 'from-yellow-300 to-amber-500' },
  { name: 'Java', color: 'from-orange-400 to-red-500' },
  { name: 'C / C++', color: 'from-blue-400 to-blue-600' },
  { name: 'React', color: 'from-cyan-400 to-blue-500' },
  { name: 'SQL', color: 'from-cyan-300 to-teal-500' },
  { name: 'Algorithmique', color: 'from-indigo-400 to-violet-500' },
  { name: 'POO', color: 'from-purple-400 to-pink-500' },
  { name: 'Git & Docker', color: 'from-red-400 to-orange-500' },
  { name: 'Cybersécurité', color: 'from-red-500 to-rose-600' },
  { name: 'Machine Learning', color: 'from-emerald-400 to-cyan-500' },
  { name: 'Node.js', color: 'from-green-400 to-emerald-600' },
];

const stats = [
  { value: '200+', label: 'Langages & sujets', icon: Code2 },
  { value: '∞', label: 'Exercices générés', icon: BookOpen },
  { value: '24/7', label: 'Disponibilité', icon: Zap },
  { value: '100%', label: 'Gratuit', icon: Rocket },
];

const sampleCourses = [
  { title: 'Apprendre le Java', sections: 21, color: 'from-orange-400 to-red-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', tag: 'Débutant → Avancé' },
  { title: 'Apprendre Python', sections: 18, color: 'from-yellow-400 to-yellow-600', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', tag: 'Débutant' },
  { title: 'JavaScript Moderne', sections: 15, color: 'from-yellow-300 to-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', tag: 'Intermédiaire' },
  { title: 'Réseaux & Systèmes', sections: 12, color: 'from-sky-400 to-blue-600', bg: 'bg-sky-500/10', border: 'border-sky-500/20', text: 'text-sky-400', tag: 'Fondamentaux' },
];

const steps = [
  { num: '01', title: 'Inscrivez-vous', desc: 'Créez un compte en quelques secondes — totalement gratuit.', icon: Users },
  { num: '02', title: 'Explorez les cours', desc: 'Parcourez des cours structurés en sections avec vidéos et contenu.', icon: GraduationCap },
  { num: '03', title: 'Apprenez & progressez', desc: 'Chat, quiz et exercices adaptés à votre rythme et niveau.', icon: Rocket },
];


const DEMO_LINES = [
  { role: 'user', text: 'Explique-moi les pointeurs en C' },
  { role: 'bot', text: 'Un pointeur est une variable qui stocke l\'adresse mémoire d\'une autre variable. En C, on le déclare avec l\'opérateur * ...' },
];

const useTyping = () => {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (currentLine >= DEMO_LINES.length) { setDone(true); return; }
    const line = DEMO_LINES[currentLine];
    if (currentChar === 0) setLines(prev => [...prev, { role: line.role, text: '' }]);
    if (currentChar < line.text.length) {
      const speed = line.role === 'user' ? 40 : 18;
      const t = setTimeout(() => {
        setLines(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], text: line.text.slice(0, currentChar + 1) };
          return copy;
        });
        setCurrentChar(c => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setCurrentLine(l => l + 1); setCurrentChar(0); }, 800);
      return () => clearTimeout(t);
    }
  }, [currentLine, currentChar, done]);

  return lines;
};


const useOnScreen = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};


const StarRating = ({ value, onChange, size = 'md' }) => {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
        >
          <Star className={`${sz} transition-all duration-150 ${s <= (hovered || value) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]' : 'text-gray-600'}`} />
        </button>
      ))}
    </div>
  );
};


const cardAccents = [
  { bar: 'bg-indigo-500', avatar: 'from-indigo-500 to-violet-600', text: 'text-indigo-400' },
  { bar: 'bg-emerald-400', avatar: 'from-emerald-400 to-cyan-500', text: 'text-emerald-400' },
  { bar: 'bg-rose-500', avatar: 'from-rose-400 to-pink-600', text: 'text-rose-400' },
  { bar: 'bg-amber-400', avatar: 'from-amber-400 to-orange-500', text: 'text-amber-400' },
  { bar: 'bg-sky-400', avatar: 'from-sky-400 to-blue-600', text: 'text-sky-400' },
  { bar: 'bg-fuchsia-500', avatar: 'from-fuchsia-400 to-purple-600', text: 'text-fuchsia-400' },
];

const TestimonialCard = ({ t, visible, delay, index }) => {
  const ac = cardAccents[index % cardAccents.length];
  const initials = (t.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const rating = t.rating || 5;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-[#0d0f14] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: delay }}
    >
      {}
      <div className={`absolute left-0 top-4 bottom-4 w-[3px] ${ac.bar} rounded-full opacity-70 group-hover:opacity-100 group-hover:top-0 group-hover:bottom-0 transition-all duration-500`} />

      <div className="pl-7 pr-6 py-6">
        {}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-800 text-gray-800'}`} />
            ))}
          </div>
          <span className={`text-xs font-bold tabular-nums ${ac.text} opacity-60`}>{String(index + 1).padStart(2, '0')}</span>
        </div>

        {}
        <p className="text-gray-400 text-[13px] leading-[1.75] mb-5 line-clamp-4 group-hover:text-gray-300 transition-colors duration-300">
          "{t.text}"
        </p>

        {}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${ac.avatar} flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 shadow-md`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">{t.name}</p>
            <p className="text-[11px] text-gray-600 truncate mt-0.5">{t.role || 'Apprenant'}</p>
          </div>
          {rating === 5 && (
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest opacity-70">★ Top</span>
          )}
        </div>
      </div>
    </div>
  );
};



const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';



  const typedLines = useTyping();

  return (
    <div className="min-h-screen bg-gray-950 overflow-hidden relative">
      {}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] radial-glow opacity-60" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-500/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-2/3 left-1/2 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${8 + Math.random() * 84}%`,
          animationDuration: `${8 + Math.random() * 12}s`,
          animationDelay: `${Math.random() * 6}s`,
          bottom: '-10px',
        }} />
      ))}
      <PublicNavbar />

      {}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-10">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="animate-fade-in-up mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium backdrop-blur-sm">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Assistant IA Pédagogique — 100% Gratuit
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.08] mb-6 animate-fade-in-up" style={{ animationDelay: '.12s' }}>
              <span className="text-white">Apprenez</span><br />
              <span className="text-white">l'informatique</span><br />
              <span className="shimmer-text animate-shimmer">avec l'IA</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-xl mb-4 animate-fade-in-up" style={{ animationDelay: '.24s' }}>
              <span className="text-gray-300 font-medium">InfoAcademy</span> est votre tuteur personnel propulsé par l'intelligence artificielle.
              Cours structurés, chat interactif, quiz adaptatifs et exercices sur-mesure pour maîtriser <span className="text-indigo-400">200+ langages et sujets</span>.
            </p>

            <p className="text-sm text-gray-500 mb-8 animate-fade-in-up" style={{ animationDelay: '.32s' }}>
              Propulsé par OpenAI via OpenRouter — adapté à tous les niveaux.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 animate-fade-in-up" style={{ animationDelay: '.4s' }}>
              <Link to={isAuthenticated ? '/chat' : '/register'} className="group relative flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white font-bold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] transition-all duration-300 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              {!isAdmin && (
                <Link to={isAuthenticated ? '/chat' : '/login'} className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-gray-700 text-gray-300 font-semibold hover:border-indigo-500/50 hover:text-white hover:bg-indigo-500/5 transition-all duration-300">
                  {isAuthenticated ? 'Aller au chat' : 'Se connecter'}
                </Link>
              )}            </div>

            <div className="flex items-center gap-4 mt-10 animate-fade-in-up justify-center lg:justify-start" style={{ animationDelay: '.5s' }}>
              <div className="flex -space-x-2">
                {['AK', 'SM', 'YB', 'NL'].map((initials, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold border-2 border-gray-950 shadow-sm">
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-xs text-gray-500">Utilisé par <span className="text-gray-300 font-medium">des étudiants</span> chaque jour</p>
              </div>
            </div>
          </div>

          <div className="animate-fade-in-up hidden lg:block" style={{ animationDelay: '.5s' }}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
              <div className="relative terminal-window shadow-2xl shadow-indigo-500/10">
                <div className="terminal-header">
                  <div className="terminal-dot bg-red-500" />
                  <div className="terminal-dot bg-yellow-500" />
                  <div className="terminal-dot bg-green-500" />
                  <span className="ml-2 text-xs text-gray-500 font-medium">InfoAcademy — Chat IA</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400/80">En ligne</span>
                  </div>
                </div>
                <div className="p-5 space-y-4 min-h-[260px]">
                  {typedLines.map((line, i) => (
                    <div key={i} className={`flex gap-3 ${line.role === 'user' ? 'justify-end' : ''}`}>
                      {line.role === 'bot' && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${line.role === 'user'
                        ? 'bg-indigo-500/20 text-indigo-200 rounded-br-sm'
                        : 'bg-gray-800/80 text-gray-300 rounded-bl-sm'}`}>
                        {line.text}
                        {i === typedLines.length - 1 && (
                          <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-typing-cursor align-middle" />
                        )}
                      </div>
                    </div>
                  ))}
                  {typedLines.length === 0 && (
                    <div className="flex items-center justify-center h-40">
                      <div className="flex gap-1.5">
                        <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
                        <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
                        <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex justify-center pt-2">
            <div className="w-1 h-2.5 bg-indigo-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>
      {/* ═══════════ COURSES SHOWCASE ═══════════ */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 animate-fade-in-up">
            <span className="inline-flex items-center gap-2 text-violet-400 text-sm font-semibold uppercase tracking-widest mb-4">
              <Layers className="w-4 h-4" /> Cours Structurés
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Apprenez avec des <span className="shimmer-text animate-shimmer">parcours complets</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Des cours organisés en sections progressives avec vidéos, contenu détaillé et quiz IA intégrés à chaque leçon.
            </p>
          </div>

          {/* Course cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {sampleCourses.map((course, i) => (
              <div
                key={i}
                className={`group glass-card rounded-2xl p-5 border ${course.border} hover:scale-[1.03] hover:shadow-xl transition-all duration-300 animate-fade-in-up`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-11 h-11 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1 leading-tight">{course.title}</h3>
                <p className={`text-xs font-medium ${course.text} mb-3`}>{course.tag}</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${course.color}`} />
                  <span className="text-gray-500 text-xs">{course.sections} sections</span>
                  <Video className="w-3 h-3 text-gray-600 ml-auto" />
                  <span className="text-gray-600 text-xs">Vidéos</span>
                </div>
                {/* Progress bar decoration */}
                <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${course.color} rounded-full w-0 group-hover:w-full transition-all duration-700`} />
                </div>
              </div>
            ))}
          </div>

          {/* How a course works */}


          <div className="text-center mt-10 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
            <Link
              to={isAuthenticated ? '/courses' : '/register'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.03] transition-all duration-300"
            >
              <GraduationCap className="w-5 h-5" />
              Voir tous les cours
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default LandingPage;