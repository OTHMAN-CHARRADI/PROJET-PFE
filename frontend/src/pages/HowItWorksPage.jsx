import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { Link } from 'react-router-dom';
import { Bot, Rocket, ArrowLeft, Users, GraduationCap, MessageSquare, Target, BarChart3, ArrowRight, CheckCircle2, Layers, Video, BookOpen } from 'lucide-react';

const steps = [
    {
        num: '01',
        icon: Users,
        title: 'Créez votre compte',
        color: 'from-indigo-500 to-blue-600',
        accent: 'indigo',
        desc: 'Inscription en quelques secondes, totalement gratuite et sans engagement. Aucune carte de crédit requise.',
        details: [
            'Remplissez un formulaire simple (nom, email, mot de passe)',
            'Confirmation immédiate — pas d\'attente de validation',
            '100% gratuit, toujours',
        ],
    },
    {
        num: '02',
        icon: GraduationCap,
        title: 'Explorez les cours',
        color: 'from-violet-500 to-purple-600',
        accent: 'violet',
        desc: 'Parcourez des cours structurés en sections progressives avec vidéos et contenu théorique pour chaque leçon.',
        details: [
            'Cours organisés par langage et thématique',
            'Chaque cours découpé en sections progressives',
            'Vidéos intégrées et contenu détaillé par section',
        ],
    },
    {
        num: '03',
        icon: Layers,
        title: 'Choisissez un sujet',
        color: 'from-purple-500 to-pink-600',
        accent: 'purple',
        desc: 'Naviguez parmi 200+ langages et sujets informatiques, du niveau débutant à expert.',
        details: [
            'Catalogue organisé par catégories et niveaux',
            'Recherche rapide par mot-clé ou langage',
            'Recommandations personnalisées selon votre progression',
        ],
    },
    {
        num: '04',
        icon: MessageSquare,
        title: 'Discutez avec l\'IA',
        color: 'from-cyan-500 to-teal-600',
        accent: 'cyan',
        desc: 'Posez vos questions au chat IA, obtenez des explications claires, des exemples de code et des corrections instantanées.',
        details: [
            'Chat en langage naturel, en français',
            'Code généré, expliqué et commenté',
            'Historique de vos conversations conservé',
        ],
    },
    {
        num: '05',
        icon: Target,
        title: 'Testez-vous avec des quiz',
        color: 'from-orange-500 to-amber-600',
        accent: 'orange',
        desc: '20 questions par session, avec feedback immédiat et explications pour chaque réponse — ou générez un quiz depuis une section de cours.',
        details: [
            'Questions adaptées à votre niveau actuel',
            'Générez un quiz ciblé depuis chaque section de cours',
            'Rejouer autant de fois que vous voulez',
        ],
    },
    {
        num: '06',
        icon: BarChart3,
        title: 'Suivez votre progression',
        color: 'from-emerald-500 to-green-600',
        accent: 'emerald',
        desc: 'Visualisez vos progrès en temps réel grâce à un tableau de bord complet et des statistiques détaillées.',
        details: [
            'Score global et par sujet',
            'Graphiques d\'évolution dans le temps',
            'Suggestions de sujets à réviser',
        ],
    },
];

const courseFlow = [
    { icon: Video, label: 'Regardez la vidéo', color: 'bg-purple-500/10 border-purple-500/20 text-purple-300' },
    { icon: Target, label: 'Générez un quiz IA', color: 'bg-orange-500/10 border-orange-500/20 text-orange-300' },
    { icon: BookOpen, label: 'Générez un exercice IA', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' },
    { icon: BarChart3, label: 'Progression mise à jour', color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' },
];


const leftSteps = steps.filter((_, i) => i % 2 === 0);
const rightSteps = steps.filter((_, i) => i % 2 !== 0);

const StepCard = ({ s, i }) => (
    <div
        className="flex gap-4 animate-fade-in-up"
        style={{ animationDelay: `${i * 100}ms` }}
    >
        {}
        <div className="relative flex-shrink-0">
            <div className={`w-14 h-14 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                <s.icon className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-950 border border-gray-800 rounded-full text-[9px] font-black text-indigo-400 flex items-center justify-center leading-none">
                {parseInt(s.num)}
            </span>
        </div>

        {}
        <div className="flex-1 glass-card rounded-2xl p-5 hover:scale-[1.015] transition-all duration-300 hover:border-white/10">
            <h2 className="text-base font-bold text-white mb-1.5 leading-snug">{s.title}</h2>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">{s.desc}</p>
            <ul className="space-y-1.5">
                {s.details.map((d, j) => (
                    <li key={j} className="flex items-start gap-2 text-[11px] text-gray-500">
                        <CheckCircle2 className="w-3 h-3 text-indigo-400/60 flex-shrink-0 mt-0.5" />
                        {d}
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const HowItWorksPage = () => {
    return (
        <div className="min-h-screen bg-gray-950 overflow-hidden relative">

            {}
            <div className="fixed inset-0 grid-pattern pointer-events-none" />
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] radial-glow opacity-40" />
                <div className="absolute top-1/3 left-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            <PublicNavbar />

            <main className="relative pt-28 pb-24 px-4">
                <div className="max-w-5xl mx-auto">

                    {}
                    <div className="text-center mb-16 animate-fade-in-up">
                        <span className="inline-flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
                            <Rocket className="w-4 h-4" /> Comment ça marche
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5">
                            Simple comme{' '}
                            <span className="shimmer-text animate-shimmer">1, 2, 3</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg">
                            InfoAcademy est conçu pour être aussi simple que possible, commencez à apprendre en moins de 2 minutes.
                        </p>
                    </div>

                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {steps.map((s, i) => (
                            <StepCard key={i} s={s} i={i} />
                        ))}
                    </div>

                    {}
                    <div
                        className="mt-12 glass-card rounded-2xl p-7 border border-violet-500/15 animate-fade-in-up"
                        style={{ animationDelay: '600ms' }}
                    >
                        <div className="flex items-start gap-4 mb-5">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold mb-1">Depuis une section de cours</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Dans chaque section, deux boutons vous permettent de générer instantanément un quiz ou un exercice ciblé sur le sujet de la leçon. Votre résultat est automatiquement ajouté à votre progression.
                                </p>
                            </div>
                        </div>

                        {}
                        <div className="flex flex-wrap items-center gap-2 pl-14">
                            {courseFlow.map((item, i) => (
                                <span key={i} className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${item.color}`}>
                                        <item.icon className="w-3.5 h-3.5" />
                                        {item.label}
                                    </span>
                                    {i < courseFlow.length - 1 && (
                                        <ArrowRight className="w-3 h-3 text-gray-700 flex-shrink-0" />
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    {}
                    <div
                        className="text-center mt-16 animate-fade-in-up"
                        style={{ animationDelay: '700ms' }}
                    >
                        <p className="text-gray-400 mb-6 text-lg">Prêt à commencer votre parcours ?</p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] transition-all duration-300"
                        >
                            S'inscrire gratuitement
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                </div>
            </main>

            <PublicFooter />
        </div>
    );
};

export default HowItWorksPage;