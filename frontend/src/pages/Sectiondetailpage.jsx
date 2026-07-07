import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import AiAssistant from '../components/AiAssistant';
import CommentSection from '../components/CommentSection';
import { getSectionById, getSectionsByCourse, markSectionCompleted } from '../service/Api';
import {
    ArrowLeft, BookOpen, Play, Lightbulb, AlignLeft,
    ChevronRight, AlertCircle, RefreshCw,
    ChevronLeft, ExternalLink, Layers,
    CheckCircle, ArrowRight, BookMarked,
    Sparkles, Dumbbell
} from 'lucide-react';


const cleanTitle = (title = '') => title.replace(/^.+#\d+\s*[-–]\s*/i, '').trim() || title;


const toEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('embed')) return url;
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    const longMatch = url.match(/[?&]v=([^&]+)/);
    if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}`;
    return url;
};

const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));


const CircularProgress = ({ value, max, palette }) => {
    const pct = max > 0 ? (value / max) * 100 : 0;
    const r = 28;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
                cx="36" cy="36" r={r} fill="none"
                stroke="url(#pg)" strokeWidth="5"
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={circ / 4}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
            />
            <defs>
                <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
            </defs>
            <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">
                {Math.round(pct)}%
            </text>
        </svg>
    );
};

const SectionDetailPage = () => {
    const { courseId, sectionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef(null);

    const stateData = location.state || {};
    const palette = stateData.palette || {
        card: 'from-orange-500 to-amber-500',
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/20',
    };
    const course = stateData.course || null;

    const [section, setSection] = useState(stateData.section || null);
    const [siblings, setSiblings] = useState([]);
    const [loading, setLoading] = useState(!stateData.section);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('content');
    const [videoWatched, setVideoWatched] = useState(false);
    const playerRef = useRef(null);
    const watchTimerRef = useRef(null);

    useEffect(() => { loadData(); }, [sectionId]);

    
    useEffect(() => {
        return () => clearInterval(watchTimerRef.current);
    }, []);

    
    useEffect(() => {
        if (!section?.videoUrl || !isYouTube(section.videoUrl)) return;

        setVideoWatched(false);
        clearInterval(watchTimerRef.current);
        if (playerRef.current?.destroy) {
            playerRef.current.destroy();
            playerRef.current = null;
        }

        const initPlayer = () => {
            if (!document.getElementById('yt-player')) return;
            playerRef.current = new window.YT.Player('yt-player', {
                events: {
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            watchTimerRef.current = setInterval(() => {
                                if (!playerRef.current) return;
                                const duration = playerRef.current.getDuration();
                                const currentTime = playerRef.current.getCurrentTime();
                                if (duration > 0 && currentTime / duration >= 0.95) {
                                    setVideoWatched(true);
                                    clearInterval(watchTimerRef.current);
                                    markSectionCompleted(sectionId).catch(() => { });
                                }
                            }, 2000);
                        } else {
                            clearInterval(watchTimerRef.current);
                        }
                    },
                },
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                document.body.appendChild(tag);
            }
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            clearInterval(watchTimerRef.current);
            if (playerRef.current?.destroy) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [section?.videoUrl, sectionId]);

    const loadData = async () => {
        if (!stateData.section) setLoading(true);
        setError('');
        try {
            const calls = [
                getSectionById(sectionId),
            ];
            if (courseId) calls.push(getSectionsByCourse(courseId));
            const results = await Promise.allSettled(calls);
            if (results[0].status === 'fulfilled') setSection(results[0].value);
            if (results[1]?.status === 'fulfilled') setSiblings(results[1].value || []);

            const sectionData = results[0].status === 'fulfilled' ? results[0].value : null;
            if (sectionData && !isYouTube(sectionData.videoUrl)) {
                markSectionCompleted(sectionId).catch(() => { });
            }
        } catch {
            setError('Impossible de charger cette section.');
        } finally {
            setLoading(false);
        }
    };

    const currentIndex = siblings.findIndex(s => String(s.id) === String(sectionId));
    const prevSection = currentIndex > 0 ? siblings[currentIndex - 1] : null;
    const nextSection = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

    const navigateSection = (sec) => {
        navigate(`/courses/${courseId}/sections/${sec.id}`, {
            state: { section: sec, course, palette, sectionIndex: siblings.indexOf(sec) },
        });
    };

    const embedUrl = section?.videoUrl ? toEmbedUrl(section.videoUrl) : null;
    const hasContent = section?.content && section.content.trim().length > 0;
    const hasSummary = section?.summary && section.summary.trim().length > 0;

    const tabs = [
        hasContent && { key: 'content', label: 'Contenu', icon: AlignLeft },
        hasSummary && { key: 'summary', label: 'Résumé', icon: Lightbulb },
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-950 relative overflow-hidden">
            {}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-orange-900/10 to-transparent pointer-events-none" />
            <div className="absolute top-40 right-1/3 w-96 h-96 bg-orange-500/4 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-indigo-500/4 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30" />

            <Navbar />

            {}
            {!loading && section && (
                <div className="relative pt-16 border-b border-gray-800/60">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-950/80 to-gray-950" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${palette.card} opacity-[0.04]`} />
                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        {}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 flex-wrap">
                            <button onClick={() => navigate('/courses')}
                                className="hover:text-orange-400 transition-colors flex items-center gap-1 group">
                                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                                Cours
                            </button>
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                            <button
                                onClick={() => navigate(`/courses/${courseId}`, { state: { course, palette } })}
                                className="hover:text-orange-400 transition-colors truncate max-w-[140px]">
                                {course?.title || 'Cours'}
                            </button>
                            <ChevronRight className="w-3 h-3 flex-shrink-0" />
                            <span className="text-gray-300 truncate max-w-[220px]">{cleanTitle(section?.title)}</span>
                        </div>

                        {}
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0 mt-0.5">
                                <BookMarked className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                {currentIndex >= 0 && siblings.length > 0 && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/25">
                                            Section {currentIndex + 1}/{siblings.length}
                                        </span>
                                        {embedUrl && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                <Play className="w-3 h-3" /> Vidéo
                                            </span>
                                        )}
                                    </div>
                                )}
                                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight">
                                    {cleanTitle(section.title)}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

                {}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
                        <div className="relative mb-6">
                            <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-orange-500 animate-spin" />
                            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-amber-500 animate-spin"
                                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                        </div>
                        <p className="text-gray-400 text-sm">Chargement de la section...</p>
                    </div>
                )}

                {}
                {error && (
                    <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-start gap-3 animate-fade-in">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="flex-1">{error}</span>
                        <button onClick={loadData} className="hover:text-red-300 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {!loading && section && (
                    <div className="pt-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {}
                            <div className="lg:col-span-2 space-y-5">

                                {}
                                {embedUrl && (
                                    <div className="rounded-2xl overflow-hidden border border-gray-800/60 bg-gray-900/40 shadow-xl shadow-black/20">
                                        {}
                                        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/60 bg-gray-900/60">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                                            </div>
                                            <div className="flex items-center gap-2 flex-1">
                                                <div className="w-6 h-6 bg-red-500/15 rounded flex items-center justify-center">
                                                    <Play className="w-3 h-3 text-red-400" />
                                                </div>
                                                <span className="text-sm text-gray-300 font-medium">Vidéo du cours</span>
                                            </div>
                                            {isYouTube(section.videoUrl) && (
                                                <a href={section.videoUrl} target="_blank" rel="noopener noreferrer"
                                                    className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-800/60">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                        {}
                                        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                                            <iframe
                                                id="yt-player"
                                                src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}enablejsapi=1`}
                                                title={section.title}
                                                className="absolute inset-0 w-full h-full"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                        {}
                                        <div className={`flex items-center gap-2 px-4 py-2.5 border-t border-gray-800/60 text-xs transition-all ${videoWatched ? 'bg-emerald-500/8 text-emerald-400' : 'bg-gray-900/60 text-amber-400/70'}`}>
                                            {videoWatched
                                                ? <><CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> Section validée — bien joué !</>
                                                : <><span className="text-base leading-none">⏳</span> Regardez au moins 95 % de la vidéo pour valider cette section</>
                                            }
                                        </div>
                                    </div>
                                )}

                                {}
                                {tabs.length > 0 && (
                                    <div className="rounded-2xl overflow-hidden border border-gray-800/60 bg-gray-900/50">
                                        {}
                                        <div className="flex border-b border-gray-800/60 bg-gray-900/60">
                                            {tabs.map(tab => (
                                                <button
                                                    key={tab.key}
                                                    onClick={() => setActiveTab(tab.key)}
                                                    className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all ${activeTab === tab.key
                                                        ? 'text-orange-400'
                                                        : 'text-gray-500 hover:text-gray-300'
                                                        }`}
                                                >
                                                    <tab.icon className="w-4 h-4" />
                                                    {tab.label}
                                                    {activeTab === tab.key && (
                                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-t" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {}
                                        <div className="p-6 sm:p-8">
                                            {activeTab === 'content' && hasContent && (
                                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm prose-sm max-w-none">
                                                    {section.content}
                                                </div>
                                            )}
                                            {activeTab === 'summary' && hasSummary && (
                                                <div className="flex gap-4">
                                                    <div className="w-8 h-8 bg-amber-500/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <Lightbulb className="w-4 h-4 text-amber-400" />
                                                    </div>
                                                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm flex-1">
                                                        {section.summary}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {}
                                <CommentSection type="section" targetId={sectionId} palette={palette} />
                            </div>

                            {}
                            <div ref={sidebarRef} className="space-y-4 lg:sticky lg:top-24 lg:self-start">

                                {}
                                {siblings.length > 1 && currentIndex >= 0 && (
                                    <div className="rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-sm overflow-hidden">
                                        <div className="px-5 pt-5 pb-4">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                                                Progression
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <CircularProgress
                                                    value={currentIndex + 1}
                                                    max={siblings.length}
                                                    palette={palette}
                                                />
                                                <div>
                                                    <p className="text-2xl font-bold text-white tabular-nums">
                                                        {currentIndex + 1}
                                                        <span className="text-base font-normal text-gray-500">/{siblings.length}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">sections complétées</p>
                                                </div>
                                            </div>
                                            {}
                                            <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
                                                    style={{ width: `${((currentIndex + 1) / siblings.length) * 100}%` }}
                                                />
                                            </div>
                                            {}
                                            {embedUrl && (
                                                <div className={`mt-3 flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all ${videoWatched ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/8 text-amber-400/70 border border-amber-500/15'}`}>
                                                    {videoWatched
                                                        ? <><CheckCircle className="w-3 h-3 flex-shrink-0" /> Vidéo complétée</>
                                                        : <><span className="text-sm leading-none">⏳</span> Vidéo à regarder (95%)</>
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {}
                                {(prevSection || nextSection) && (
                                    <div className="rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-sm overflow-hidden">
                                        <div className="px-5 pt-4 pb-1">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                                                Navigation
                                            </p>
                                        </div>
                                        <div className="px-3 pb-3 space-y-2">
                                            {prevSection && (
                                                <button
                                                    onClick={() => navigateSection(prevSection)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/20 hover:bg-gray-800/50 border border-gray-700/20 hover:border-gray-700/50 transition-all text-left group"
                                                >
                                                    <div className="w-7 h-7 bg-gray-800/60 group-hover:bg-gray-700/60 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                                                        <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs text-gray-600 mb-0.5">Précédent</p>
                                                        <p className="text-xs text-gray-300 group-hover:text-white truncate transition-colors font-medium">
                                                            {prevSection.title}
                                                        </p>
                                                    </div>
                                                </button>
                                            )}
                                            {nextSection && (
                                                <button
                                                    onClick={() => navigateSection(nextSection)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-500/8 hover:bg-orange-500/15 border border-orange-500/20 hover:border-orange-500/35 transition-all text-left group"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs text-orange-400/60 mb-0.5">Suivant</p>
                                                        <p className="text-xs text-orange-300 group-hover:text-white truncate transition-colors font-medium">
                                                            {nextSection.title}
                                                        </p>
                                                    </div>
                                                    <div className="w-7 h-7 bg-orange-500/15 group-hover:bg-orange-500/30 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                                                        <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {}
                                {siblings.length > 1 && (
                                    <div className="rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-sm overflow-hidden">
                                        <div className="px-5 py-3.5 border-b border-gray-800/60 flex items-center gap-2">
                                            <Layers className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                                Toutes les sections
                                            </span>
                                        </div>
                                        <div className="max-h-[280px] overflow-y-auto custom-scroll divide-y divide-gray-800/30">
                                            {siblings.map((sib, idx) => {
                                                const isCurrent = String(sib.id) === String(sectionId);
                                                const isCompleted = idx < currentIndex;
                                                return (
                                                    <button
                                                        key={sib.id}
                                                        onClick={() => !isCurrent && navigateSection(sib)}
                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${isCurrent
                                                            ? 'bg-orange-500/8 cursor-default'
                                                            : 'hover:bg-gray-800/30 cursor-pointer'
                                                            }`}
                                                    >
                                                        <div className="flex-shrink-0">
                                                            {isCompleted ? (
                                                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                            ) : isCurrent ? (
                                                                <div className="w-3.5 h-3.5 rounded-full border-2 border-orange-400 flex items-center justify-center">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                                                </div>
                                                            ) : (
                                                                <span className="w-3.5 h-3.5 flex items-center justify-center text-xs text-gray-600">
                                                                    {idx + 1}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-xs truncate leading-snug ${isCurrent
                                                            ? 'text-orange-300 font-semibold'
                                                            : isCompleted
                                                                ? 'text-gray-500'
                                                                : 'text-gray-400'
                                                            }`}>
                                                            {sib.title}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {}
                                {section && (
                                    <div className="rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-sm overflow-hidden">
                                        <div className="px-5 py-3.5 border-b border-gray-800/60 flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                                Pratiquer ce sujet
                                            </span>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <button
                                                onClick={() => navigate('/quiz', { state: { preselectedTopic: cleanTitle(section.title), courseTitle: course?.title } })}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 hover:border-indigo-500/50 text-indigo-300 hover:text-white transition-all group text-left"
                                            >
                                                <div className="w-7 h-7 bg-indigo-500/20 group-hover:bg-indigo-500/35 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                                                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold leading-tight">Générer un quiz</p>
                                                    <p className="text-xs text-indigo-400/60 truncate mt-0.5">{course?.title} : {cleanTitle(section.title)}</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => navigate('/exercises', { state: { preselectedTopic: cleanTitle(section.title), courseTitle: course?.title } })}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 hover:border-emerald-500/50 text-emerald-300 hover:text-white transition-all group text-left"
                                            >
                                                <div className="w-7 h-7 bg-emerald-500/20 group-hover:bg-emerald-500/35 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                                                    <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold leading-tight">Générer un exercice</p>
                                                    <p className="text-xs text-emerald-400/60 truncate mt-0.5">{course?.title} : {cleanTitle(section.title)}</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {}
                                <button
                                    onClick={() => navigate(`/courses/${courseId}`, { state: { course, palette } })}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900/40 border border-gray-800/60 rounded-xl text-gray-500 hover:text-gray-200 hover:border-gray-700 text-xs font-medium transition-all group"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                    Retour au cours
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AiAssistant
                context="course"
                subject={section?.title || course?.title || ''}
                extra={section?.content || section?.summary || ''}
            />
            <ScrollToTop />
        </div>
    );
};

export default SectionDetailPage;