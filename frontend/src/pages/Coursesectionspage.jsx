import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import CommentSection from '../components/CommentSection';
import { getCourseById, getSectionsByCourse } from '../service/Api';
import {
    ArrowLeft, BookOpen, Layers, Play,
    ChevronRight, AlertCircle, RefreshCw,
    Video, AlignLeft, Lightbulb, ArrowRight
} from 'lucide-react';

const DEFAULT_PALETTE = {
    card: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
};





const Breadcrumb = ({ courseTitle, onBack }) => (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 animate-fade-in">
        <button
            onClick={onBack}
            className="hover:text-indigo-400 transition-colors flex items-center gap-1 group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Cours
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-400 truncate max-w-[200px]">
            {courseTitle || 'Chargement...'}
        </span>
    </div>
);

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-28 animate-fade-in">
        <div className="relative mb-5">
            <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-purple-500 animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-gray-400">Chargement du cours...</p>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-400 font-medium mb-1 text-center">{message}</p>
        <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium transition-colors"
        >
            <RefreshCw className="w-4 h-4" />
            Réessayer
        </button>
    </div>
);

const StatBadge = ({ icon: Icon, label, bg, text, border }) => (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${bg} ${text} ${border} border`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
    </div>
);

const CourseHeader = ({ course, palette, stats, onStart, hasSections }) => (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden mb-8 animate-fade-in-up">
        <div className={`h-1.5 bg-gradient-to-r ${palette.card}`} />
        <div className="p-8">
            <div className="flex items-start gap-5">
                <div className={`w-16 h-16 bg-gradient-to-br ${palette.card} rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0`}>
                    <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-white mb-2 leading-tight">{course.title}</h1>
                    {course.description && (
                        <p className="text-gray-400 text-sm leading-relaxed">{course.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                        <StatBadge
                            icon={Layers}
                            label={`${stats.total} section${stats.total !== 1 ? 's' : ''}`}
                            bg={palette.bg} text={palette.text} border={palette.border}
                        />
                        {stats.videos > 0 && (
                            <StatBadge
                                icon={Video}
                                label={`${stats.videos} vidéo${stats.videos !== 1 ? 's' : ''}`}
                                bg="bg-purple-500/10" text="text-purple-400" border="border-purple-500/20"
                            />
                        )}
                        {stats.summaries > 0 && (
                            <StatBadge
                                icon={Lightbulb}
                                label={`${stats.summaries} résumé${stats.summaries !== 1 ? 's' : ''}`}
                                bg="bg-amber-500/10" text="text-amber-400" border="border-amber-500/20"
                            />
                        )}
                    </div>
                </div>
            </div>

            {hasSections && (
                <button
                    onClick={onStart}
                    className={`mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r ${palette.card} rounded-xl text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
                >
                    <Play className="w-4 h-4" />
                    Commencer le cours
                </button>
            )}
        </div>
    </div>
);

const EmptySections = () => (
    <div className="text-center py-20 animate-fade-in-up">
        <div className="w-16 h-16 bg-gray-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 font-medium mb-1">Aucune section pour ce cours</p>
        <p className="text-gray-600 text-sm">Les sections seront ajoutées par un administrateur</p>
    </div>
);

const SectionTag = ({ icon: Icon, label, text, bg, border }) => (
    <span className={`inline-flex items-center gap-1 text-xs ${text} ${bg} px-2 py-0.5 rounded ${border || ''}`}>
        <Icon className="w-3 h-3" /> {label}
    </span>
);

const SectionCard = ({ section, index, palette, onClick }) => (
    <button
        onClick={onClick}
        className="w-full group text-left bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-5 hover:border-gray-700/80 hover:bg-gray-900/80 hover:scale-[1.01] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 animate-fade-in-up"
        style={{ animationDelay: `${0.05 * index}s` }}
    >
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 bg-gradient-to-br ${palette.card} rounded-xl flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <span className="text-white text-sm font-bold">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm group-hover:text-indigo-200 transition-colors truncate">
                    {section.title}
                </p>
                {section.summary && (
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{section.summary}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {section.content && (
                        <SectionTag icon={AlignLeft} label="Contenu" text="text-gray-500" bg="bg-gray-800/60" />
                    )}
                    {section.videoUrl && (
                        <SectionTag icon={Play} label="Vidéo" text="text-purple-400" bg="bg-purple-500/10" border="border border-purple-500/20" />
                    )}
                    {section.summary && (
                        <SectionTag icon={Lightbulb} label="Résumé" text="text-amber-400" bg="bg-amber-500/10" border="border border-amber-500/20" />
                    )}
                </div>
            </div>

            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
    </button>
);

const SectionsList = ({ sections, palette, onSectionClick }) => (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-5">
            <Layers className={`w-5 h-5 ${palette.text}`} />
            <h2 className="text-lg font-semibold text-white">Sections du cours</h2>
        </div>
        <div className="space-y-3">
            {sections.map((section, idx) => (
                <SectionCard
                    key={section.id}
                    section={section}
                    index={idx}
                    palette={palette}
                    onClick={() => onSectionClick(section, idx)}
                />
            ))}
        </div>
    </div>
);





const CourseSectionsPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const stateData = location.state || {};
    const palette = stateData.palette || DEFAULT_PALETTE;

    const [course, setCourse] = useState(stateData.course || null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { loadData(); }, [courseId]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [courseData, sectionsData] = await Promise.all([
                getCourseById(courseId),
                getSectionsByCourse(courseId),
            ]);
            setCourse(courseData);
            setSections(sectionsData || []);
        } catch (err) {
            setError('Impossible de charger ce cours. Vérifiez votre connexion et réessayez.');
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => ({
        total: sections.length,
        videos: sections.filter(s => s.videoUrl).length,
        summaries: sections.filter(s => s.summary).length,
    }), [sections]);

    const goToSection = (section, idx) => {
        navigate(`/courses/${courseId}/sections/${section.id}`, {
            state: { section, course, palette, sectionIndex: idx },
        });
    };

    const showContent = !loading && !error && course;

    return (
        <div className="min-h-screen bg-gray-950 relative overflow-hidden">
            <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed inset-0 grid-pattern pointer-events-none opacity-40" />

            <Navbar />

            <div className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

                <Breadcrumb courseTitle={course?.title} onBack={() => navigate('/courses')} />

                {loading && <LoadingState />}
                {!loading && error && <ErrorState message={error} onRetry={loadData} />}

                {showContent && (
                    <>
                        <CourseHeader
                            course={course}
                            palette={palette}
                            stats={stats}
                            hasSections={sections.length > 0}
                            onStart={() => goToSection(sections[0], 0)}
                        />

                        {sections.length === 0
                            ? <EmptySections />
                            : <SectionsList sections={sections} palette={palette} onSectionClick={goToSection} />
                        }
                    </>
                )}

                {courseId && !loading && (
                    <CommentSection type="course" targetId={courseId} palette={palette} />
                )}
            </div>

            <ScrollToTop />
        </div>
    );
};

export default CourseSectionsPage;