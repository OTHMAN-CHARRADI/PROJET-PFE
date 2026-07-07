import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import { getAllCourses } from '../service/Api';
import {
    GraduationCap, Search, Loader2,
    BookOpen, Layers, AlertCircle, RefreshCw, ArrowRight,
    X, BookMarked, Sparkles
} from 'lucide-react';

const GRADIENTS = [
    {
        card: 'from-indigo-500 to-violet-500',
        glow: 'shadow-indigo-500/20',
        border: 'hover:border-indigo-500/40',
        bg: 'bg-indigo-500/10', text: 'text-indigo-400', bord: 'border-indigo-500/20',
        header: 'from-indigo-600/90 to-violet-600/90',
        dot: 'bg-indigo-400',
    },
    {
        card: 'from-emerald-500 to-teal-500',
        glow: 'shadow-emerald-500/20',
        border: 'hover:border-emerald-500/40',
        bg: 'bg-emerald-500/10', text: 'text-emerald-400', bord: 'border-emerald-500/20',
        header: 'from-emerald-600/90 to-teal-600/90',
        dot: 'bg-emerald-400',
    },
    {
        card: 'from-amber-500 to-orange-500',
        glow: 'shadow-amber-500/20',
        border: 'hover:border-amber-500/40',
        bg: 'bg-amber-500/10', text: 'text-amber-400', bord: 'border-amber-500/20',
        header: 'from-amber-600/90 to-orange-600/90',
        dot: 'bg-amber-400',
    },
    {
        card: 'from-cyan-500 to-blue-500',
        glow: 'shadow-cyan-500/20',
        border: 'hover:border-cyan-500/40',
        bg: 'bg-cyan-500/10', text: 'text-cyan-400', bord: 'border-cyan-500/20',
        header: 'from-cyan-600/90 to-blue-600/90',
        dot: 'bg-cyan-400',
    },
    {
        card: 'from-rose-500 to-pink-500',
        glow: 'shadow-rose-500/20',
        border: 'hover:border-rose-500/40',
        bg: 'bg-rose-500/10', text: 'text-rose-400', bord: 'border-rose-500/20',
        header: 'from-rose-600/90 to-pink-600/90',
        dot: 'bg-rose-400',
    },
    {
        card: 'from-purple-500 to-fuchsia-500',
        glow: 'shadow-purple-500/20',
        border: 'hover:border-purple-500/40',
        bg: 'bg-purple-500/10', text: 'text-purple-400', bord: 'border-purple-500/20',
        header: 'from-purple-600/90 to-fuchsia-600/90',
        dot: 'bg-purple-400',
    },
    {
        card: 'from-sky-500 to-indigo-500',
        glow: 'shadow-sky-500/20',
        border: 'hover:border-sky-500/40',
        bg: 'bg-sky-500/10', text: 'text-sky-400', bord: 'border-sky-500/20',
        header: 'from-sky-600/90 to-indigo-600/90',
        dot: 'bg-sky-400',
    },
    {
        card: 'from-lime-500 to-green-500',
        glow: 'shadow-lime-500/20',
        border: 'hover:border-lime-500/40',
        bg: 'bg-lime-500/10', text: 'text-lime-400', bord: 'border-lime-500/20',
        header: 'from-lime-600/90 to-green-600/90',
        dot: 'bg-lime-400',
    },
];

const CoursesPage = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [showAll, setShowAll] = useState(false);

    useEffect(() => { loadCourses(); }, []);

    const loadCourses = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getAllCourses();
            setCourses(data || []);
        } catch {
            setError('Impossible de charger les cours. Vérifiez que le serveur est démarré.');
        } finally {
            setLoading(false);
        }
    };

    const filtered = courses.filter(c =>
        search === '' ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
    );

    const displayed = showAll ? filtered : filtered.slice(0, 9);

    return (
        <div className="min-h-screen bg-gray-950 relative overflow-hidden">
            {}
            <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-indigo-900/10 via-gray-950/50 to-transparent pointer-events-none" />
            <div className="absolute top-32 left-1/3 w-[500px] h-[500px] bg-indigo-500/4 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-64 right-1/4 w-72 h-72 bg-violet-500/4 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30" />

            <Navbar />

            <div className="relative pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

                {}
                <div className="text-center mb-14 animate-fade-in-up">
                    {}
                    <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/40 to-violet-500/40 rounded-3xl blur-xl animate-pulse" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                            <GraduationCap className="w-9 h-9 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
                        Catalogue de{' '}
                        <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                            Cours
                        </span>
                    </h1>
                    <p className="text-gray-400 max-w-sm mx-auto text-sm leading-relaxed">
                        Choisissez un cours pour explorer ses sections et accéder aux vidéos
                    </p>

                    {}
                    {!loading && courses.length > 0 && (
                        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/60 border border-gray-800/60 rounded-full text-sm text-gray-300 backdrop-blur-sm">
                                <BookMarked className="w-4 h-4 text-indigo-400" />
                                <span><strong className="text-white">{courses.length}</strong> cours disponibles</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/60 border border-gray-800/60 rounded-full text-sm text-gray-300 backdrop-blur-sm">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span>Contenu interactif</span>
                            </div>
                        </div>
                    )}
                </div>

                {}
                <div className="max-w-xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher un cours..."
                            className="w-full pl-11 pr-10 py-3.5 bg-gray-900/70 border border-gray-800/60 rounded-2xl text-white placeholder-gray-500 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm backdrop-blur-sm"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {}
                {error && (
                    <div className="max-w-lg mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-start gap-3 animate-fade-in">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{error}</span>
                        <button onClick={loadCourses} className="hover:text-red-300 transition-colors flex-shrink-0">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-28 animate-fade-in">
                        <div className="relative mb-6">
                            <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-indigo-500 animate-spin" />
                            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-violet-500 animate-spin"
                                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                        </div>
                        <p className="text-gray-400 text-sm">Chargement des cours...</p>
                    </div>
                )}

                {}
                {!loading && !error && filtered.length > 0 && (
                    <div className="flex items-center justify-between mb-6 animate-fade-in-up px-1" style={{ animationDelay: '0.08s' }}>
                        <p className="text-gray-500 text-sm">
                            {search
                                ? <><span className="text-white font-semibold">{filtered.length}</span> résultat{filtered.length > 1 ? 's' : ''} pour "<span className="text-indigo-400">{search}</span>"</>
                                : <><span className="text-white font-semibold">{filtered.length}</span> cours disponibles</>
                            }
                        </p>
                    </div>
                )}

                {}
                {!loading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayed.map((course, idx) => {
                            const p = GRADIENTS[idx % GRADIENTS.length];
                            return (
                                <button
                                    key={course.id}
                                    onClick={() => navigate(`/courses/${course.id}`, {
                                        state: { course, palette: { card: p.card, bg: p.bg, text: p.text, border: p.bord } }
                                    })}
                                    className={`group text-left bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 ${p.border} rounded-2xl overflow-hidden hover:scale-[1.025] hover:shadow-2xl ${p.glow} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 animate-fade-in-up`}
                                    style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                                >
                                    {}
                                    <div className={`relative bg-gradient-to-br ${p.header} p-6 overflow-hidden`}>
                                        {}
                                        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
                                        <div className="absolute -bottom-6 -left-2 w-20 h-20 rounded-full bg-black/10" />

                                        <div className="relative flex items-start justify-between">
                                            {}
                                            <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                                <BookOpen className="w-6 h-6 text-white" />
                                            </div>
                                            {}
                                            <span className="text-xs font-bold px-2.5 py-1 bg-black/25 text-white/80 rounded-lg border border-white/10 tabular-nums">
                                                #{String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                    </div>

                                    {}
                                    <div className="p-5">
                                        {}
                                        <h3 className="text-white font-bold text-base mb-2 line-clamp-2 leading-snug group-hover:text-gray-100 transition-colors">
                                            {course.title}
                                        </h3>

                                        {}
                                        <p className={`text-sm line-clamp-2 leading-relaxed mb-5 ${course.description ? 'text-gray-500' : 'text-gray-700 italic'}`}>
                                            {course.description || 'Aucune description disponible.'}
                                        </p>

                                        {}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-800/60">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Layers className="w-3.5 h-3.5" />
                                                <span>Voir les sections</span>
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-xs font-semibold ${p.text} group-hover:gap-2.5 transition-all duration-200`}>
                                                Commencer
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {}
                {!loading && filtered.length > 9 && (
                    <div className="flex justify-center mt-10 animate-fade-in-up">
                        <button
                            onClick={() => setShowAll(prev => !prev)}
                            className="inline-flex items-center gap-2.5 px-6 py-3 bg-gray-900/70 border border-gray-700/60 hover:border-indigo-500/50 rounded-2xl text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 hover:bg-indigo-500/10 backdrop-blur-sm group"
                        >
                            {showAll ? (
                                <>
                                    <BookOpen className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                                    Afficher seulement les 9 premiers
                                </>
                            ) : (
                                <>
                                    <Layers className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                                    Voir tous les cours
                                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs tabular-nums">
                                        {filtered.length}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                )}
                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-28 animate-fade-in-up">
                        {search ? (
                            <>
                                <div className="w-16 h-16 bg-gray-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-600" />
                                </div>
                                <p className="text-gray-300 font-semibold mb-1">Aucun résultat pour "{search}"</p>
                                <p className="text-gray-600 text-sm mb-5">Essayez un autre terme</p>
                                <button
                                    onClick={() => setSearch('')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/60 border border-gray-700/60 rounded-xl text-gray-400 text-sm hover:text-white hover:border-gray-600 transition-all"
                                >
                                    <X className="w-3.5 h-3.5" /> Effacer la recherche
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap className="w-8 h-8 text-indigo-400" />
                                </div>
                                <p className="text-gray-300 font-semibold mb-2">Aucun cours disponible</p>
                                <p className="text-gray-500 text-sm mb-6">Les cours seront ajoutés par un administrateur</p>
                                <button
                                    onClick={loadCourses}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-sm hover:bg-indigo-500/20 transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" /> Actualiser
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            <ScrollToTop />
        </div>
    );
};

export default CoursesPage;