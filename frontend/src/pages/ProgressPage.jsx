import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ProgressChart from '../components/ProgressChart';
import ScrollToTop from '../components/ScrollToTop';
import { getProgress, getStats } from '../service/Api';
import { BarChart3, Trophy, Target, BookOpen, MessageSquare, Loader2, Flame, Zap, Award, TrendingUp, ArrowUpRight, Clock, Star, BookMarked, CheckCircle, ChevronDown, ArrowLeft } from 'lucide-react';


const cleanProgressTopic = (topic = '') => topic.split(' : ')[0].trim() || topic;




const AnimatedCounter = ({ end, duration = 1200, suffix = '' }) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setValue(start);
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span ref={ref}>{value}{suffix}</span>;
};




const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, gradientId = 'cpGrad' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="#1f2937" strokeWidth={strokeWidth} fill="none"
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={`url(#${gradientId})`} strokeWidth={strokeWidth} fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
};




const ProgressPage = () => {
  const { user } = useAuth();

  const [progress, setProgress] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [progressData, statsData] = await Promise.all([getProgress(), getStats()]);
      setProgress(progressData);
      setStats(statsData);
    } catch (err) {
      setError('Erreur lors du chargement des données de progression.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setActiveSection(prev => prev === section ? null : section);
  };

  const levelConfig = {
    'débutant': { gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Zap, pct: 33 },
    'intermédiaire': { gradient: 'from-amber-500 to-orange-400', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: Flame, pct: 66 },
    'avancé': { gradient: 'from-rose-500 to-pink-400', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', icon: Award, pct: 100 },
  };

  const currentLevel = levelConfig[user?.level] || levelConfig['débutant'];
  const LevelIcon = currentLevel.icon;

  const getPerformanceBadge = (score, total) => {
    if (!score || !total) return { label: '—', color: 'text-gray-500', bg: 'bg-gray-500/10' };
    const pct = (score / total) * 100;
    if (pct >= 80) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: '🏆' };
    if (pct >= 50) return { label: 'Bien', color: 'text-amber-400', bg: 'bg-amber-500/15', icon: '👍' };
    return { label: 'À revoir', color: 'text-rose-400', bg: 'bg-rose-500/15', icon: '📖' };
  };

  const getMasteryColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400';
    if (score >= 50) return 'from-amber-500 to-orange-400';
    return 'from-rose-500 to-pink-400';
  };

  const getMasteryLabel = (score) => {
    if (score >= 80) return { text: 'Maîtrisé', color: 'text-emerald-400' };
    if (score >= 50) return { text: 'En cours', color: 'text-amber-400' };
    return { text: 'À travailler', color: 'text-rose-400' };
  };


  const statCards = [
    {
      label: 'Quiz passés',
      value: stats?.total_quizzes || 0,
      icon: Target,
      gradient: 'from-indigo-500 to-violet-500',
      iconBg: 'bg-indigo-500/15',
      iconColor: 'text-indigo-400',
      glowColor: 'shadow-indigo-500/10',
    },
    {
      label: 'Score moyen',
      value: stats?.average_score || 0,
      suffix: '%',
      icon: Trophy,
      gradient: 'from-purple-500 to-fuchsia-500',
      iconBg: 'bg-purple-500/15',
      iconColor: 'text-purple-400',
      glowColor: 'shadow-purple-500/10',
    },
    {
      label: 'Topics maîtrisés',
      value: stats?.topics_mastered || 0,
      icon: BookOpen,
      gradient: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      glowColor: 'shadow-emerald-500/10',
    },
    {
      label: 'Sections complétées',
      value: stats?.sections_completed || 0,
      icon: BookMarked,
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      glowColor: 'shadow-amber-500/10',
    },
    {
      label: 'Messages envoyés',
      value: stats?.total_messages || 0,
      icon: MessageSquare,
      gradient: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-400',
      glowColor: 'shadow-cyan-500/10',
    },
  ];


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-gray-500 text-sm animate-pulse">Chargement de votre progression...</p>
        </div>
      </div>
    );
  }




  const MasteryHeader = ({ expanded }) => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-white" />
      </div>
      <div className="text-left">
        <h3 className="text-lg font-semibold text-white">Maîtrise par sujet</h3>
        <p className="text-xs text-gray-500">{progress.topics.length} {progress.topics.length > 1 ? 'sujets suivis' : 'sujet'}</p>
      </div>
    </div>
  );

  const CoursesHeader = () => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
        <BookMarked className="w-5 h-5 text-white" />
      </div>
      <div className="text-left">
        <h3 className="text-lg font-semibold text-white">Progression des cours</h3>
        <p className="text-xs text-gray-500">{progress.course_progress.length} {progress.course_progress.length > 1 ? 'cours suivis' : 'cours suivi'}</p>
      </div>
    </div>
  );

  const QuizHeader = () => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
        <Clock className="w-5 h-5 text-white" />
      </div>
      <div className="text-left">
        <h3 className="text-lg font-semibold text-white">Historique des quiz</h3>
        <p className="text-xs text-gray-500">{progress.quiz_history.length} {progress.quiz_history.length > 1 ? 'quiz enregistrés' : 'quiz enregistré'}</p>
      </div>
    </div>
  );




  const MasteryContent = () => (
    <div className="space-y-5 px-8 pb-8">
      {progress.topics.map((tp, i) => {
        const mastery = getMasteryLabel(tp.mastery_score);
        return (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">{cleanProgressTopic(tp.topic)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${mastery.color} bg-gray-800/80`}>{mastery.text}</span>
              </div>
              <span className="text-sm font-bold text-white">{Math.round(tp.mastery_score)}%</span>
            </div>
            <div className="w-full bg-gray-800/80 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getMasteryColor(tp.mastery_score)} transition-all duration-1000 ease-out relative overflow-hidden`}
                style={{ width: `${Math.min(tp.mastery_score, 100)}%`, animationDelay: `${i * 0.15}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const CoursesContent = () => (
    <div className="space-y-5 px-8 pb-8">
      {progress.course_progress.map((cp, i) => {
        const pct = cp.progressPercent;
        const gradColor = pct >= 80 ? 'from-emerald-500 to-teal-400' : pct >= 40 ? 'from-amber-500 to-orange-400' : 'from-indigo-500 to-violet-500';
        const statusLabel = pct >= 100 ? { text: 'Terminé', color: 'text-emerald-400' } : pct >= 50 ? { text: 'En cours', color: 'text-amber-400' } : { text: 'Débuté', color: 'text-indigo-400' };
        return (
          <div key={cp.courseId} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-300">{cp.courseTitle}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel.color} bg-gray-800/80`}>{statusLabel.text}</span>
              </div>
              <span className="text-xs text-gray-500">{cp.completedSections}/{cp.totalSections} sections</span>
            </div>
            <div className="w-full bg-gray-800/80 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${gradColor} transition-all duration-1000 ease-out relative overflow-hidden`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-xs font-bold text-white">{Math.round(pct)}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const QuizContent = () => (
    <div className="overflow-x-auto px-8 pb-8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800/80">
            <th className="text-left py-3.5 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Date</th>
            <th className="text-left py-3.5 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Sujet</th>
            <th className="text-left py-3.5 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Niveau</th>
            <th className="text-left py-3.5 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Score</th>
            <th className="text-left py-3.5 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">Performance</th>
          </tr>
        </thead>
        <tbody>
          {progress.quiz_history.map((q, i) => {
            const badge = getPerformanceBadge(q.score, q.total_questions);
            const pct = q.total_questions ? Math.round((q.score / q.total_questions) * 100) : 0;
            return (
              <tr key={i} className="border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors group">
                <td className="py-4 px-4 text-gray-400">
                  {q.taken_at ? new Date(q.taken_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td className="py-4 px-4">
                  <span className="text-white font-medium">{cleanProgressTopic(q.topic) || '—'}</span>
                </td>
                <td className="py-4 px-4">
                  <span className={`capitalize text-xs px-2.5 py-1 rounded-full border ${q.level === 'avancé' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
                    q.level === 'intermédiaire' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                      'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    }`}>{q.level || '—'}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{q.score !== null ? `${q.score}/${q.total_questions}` : '—'}</span>
                    {q.score !== null && (
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${getMasteryColor(pct)}`} style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${badge.bg} ${badge.color}`}>
                    {badge.icon && <span>{badge.icon}</span>}
                    {badge.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <Navbar />
      <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 w-full">

        {}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
            <div className="flex items-center gap-4">
              {}
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${currentLevel.gradient} flex items-center justify-center shadow-lg`}>
                <LevelIcon className="w-7 h-7 text-white" />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-950 flex items-center justify-center`}>
                  <Star className={`w-3 h-3 ${currentLevel.text}`} />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">Ma Progression</h1>
                <p className="text-gray-400 text-sm mt-0.5">Bienvenue, <span className="text-white font-medium">{user?.username}</span>. Voici votre tableau de bord d'apprentissage.</p>
              </div>
            </div>

            {/* Level badge */}
            <div className={`sm:ml-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${currentLevel.bg} ${currentLevel.border}`}>
              <span className={`text-sm font-semibold capitalize ${currentLevel.text}`}>{user?.level || 'débutant'}</span>
              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${currentLevel.gradient} transition-all duration-1000`} style={{ width: `${currentLevel.pct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">⚠️</div>
            {error}
          </div>
        )}

        {activeSection === null ? (
          <>
            {/* ===== STAT CARDS ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
              {statCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className={`group relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6
                      hover:border-gray-700/80 hover:shadow-2xl ${card.glowColor} transition-all duration-500
                      animate-fade-in-up`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {/* Gradient top line */}
                    <div className={`absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r ${card.gradient} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`} />

                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-5 h-5 ${card.iconColor}`} />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-white">
                      <AnimatedCounter end={card.value} suffix={card.suffix || ''} />
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ===== SCORE OVERVIEW — only show when data exists ===== */}
            {(stats?.average_score > 0 || stats?.total_quizzes > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                {/* Circular score */}
                <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-8 flex flex-col items-center justify-center">
                  <p className="text-sm text-gray-500 mb-4 font-medium">Performance globale</p>
                  <div className="relative">
                    <CircularProgress percentage={stats?.average_score || 0} size={140} strokeWidth={10} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">{stats?.average_score || 0}%</span>
                      <span className="text-xs text-gray-500">score moyen</span>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-8">
                  <p className="text-sm text-gray-500 mb-6 font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Résumé des performances
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">🎯</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stats?.total_quizzes || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Quiz complétés</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">📖</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stats?.sections_completed || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Sections vues</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">📚</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stats?.topics_mastered || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Sujets maîtrisés</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">💬</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stats?.total_messages || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Messages échangés</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== CHARTS ===== */}
            <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <ProgressChart
                quizHistory={progress?.quiz_history || []}
                topicProgress={progress?.topics || []}
              />
            </div>

            {/* ===== TOPIC MASTERY (collapsed entry point) ===== */}
            {progress?.topics?.length > 0 && (
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl mb-10 animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.5s' }}>
                <button
                  onClick={() => toggleSection('mastery')}
                  className="w-full flex items-center justify-between p-8 hover:bg-gray-800/20 transition-colors"
                >
                  <MasteryHeader />
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 -rotate-90" />
                </button>
              </div>
            )}

            {/* ===== COURSE PROGRESS (collapsed entry point) ===== */}
            {progress?.course_progress?.length > 0 && (
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl mb-10 animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.55s' }}>
                <button
                  onClick={() => toggleSection('courses')}
                  className="w-full flex items-center justify-between p-8 hover:bg-gray-800/20 transition-colors"
                >
                  <CoursesHeader />
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 -rotate-90" />
                </button>
              </div>
            )}

            {/* ===== QUIZ HISTORY (collapsed entry point) ===== */}
            {progress?.quiz_history?.length > 0 && (
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.6s' }}>
                <button
                  onClick={() => toggleSection('quiz')}
                  className="w-full flex items-center justify-between p-8 hover:bg-gray-800/20 transition-colors"
                >
                  <QuizHeader />
                  <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300 -rotate-90" />
                </button>
              </div>
            )}

            {/* ===== EMPTY STATE ===== */}
            {(!progress?.quiz_history?.length && !progress?.topics?.length) && (
              <div className="text-center py-20 animate-fade-in-up">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl animate-pulse-slow" />
                  <div className="absolute inset-2 bg-gray-900 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-10 h-10 text-gray-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Aucune donnée de progression</h3>
                <p className="text-gray-500 max-w-md mx-auto">Complétez des quiz pour voir vos statistiques apparaître ici. Chaque quiz vous aidera à suivre votre évolution !</p>
                <a href="/quiz" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all">
                  <Target className="w-5 h-5" />
                  Lancer mon premier quiz
                </a>
              </div>
            )}
          </>
        ) : (
          /* ===== VUE PLEIN ÉCRAN DE LA SECTION ACTIVE ===== */
          <div className="animate-fade-in-up">
            {/* Bouton retour */}
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Retour à la progression
            </button>

            {activeSection === 'mastery' && progress?.topics?.length > 0 && (
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden">
                <div className="p-8 pb-4">
                  <MasteryHeader />
                </div>
                <MasteryContent />
              </div>
            )}

            {activeSection === 'courses' && progress?.course_progress?.length > 0 && (
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden">
                <div className="p-8 pb-4">
                  <CoursesHeader />
                </div>
                <CoursesContent />
              </div>
            )}

            {activeSection === 'quiz' && progress?.quiz_history?.length > 0 && (
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden">
                <div className="p-8 pb-4">
                  <QuizHeader />
                </div>
                <QuizContent />
              </div>
            )}
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default ProgressPage;