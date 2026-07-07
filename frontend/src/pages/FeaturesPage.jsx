import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { Link } from 'react-router-dom';
import {
    MessageSquare, BookOpen, Target, BarChart3, Zap,
    CheckCircle2, GraduationCap, Video, Layers, ArrowRight
} from 'lucide-react';

const features = [
    {
        icon: GraduationCap,
        gradient: 'from-violet-500 to-indigo-500',
        shadowColor: 'shadow-violet-500/20',
        borderColor: 'border-violet-500/20',
        badge: 'Parcours',
        title: 'Cours Structurés',
        desc: 'Des parcours complets organisés en sections progressives avec vidéos, contenu théorique et outils IA intégrés à chaque leçon.',
        details: [
            'Cours découpés en sections thématiques et progressives',
            'Vidéos intégrées pour chaque leçon',
            'Contenu théorique détaillé par section',
            'Génération de quiz IA directement depuis la section',
            'Génération d\'exercices pratiques par section',
        ],
    },
    {
        icon: MessageSquare,
        gradient: 'from-blue-500 to-cyan-400',
        shadowColor: 'shadow-blue-500/20',
        borderColor: 'border-blue-500/20',
        badge: 'Assistant',
        title: 'Chat IA Intelligent',
        desc: 'Dialoguez avec un assistant qui comprend le contexte, adapte ses explications à votre niveau et fournit du code prêt à l\'emploi.',
        details: [
            'Compréhension du contexte de la conversation',
            'Adaptation automatique au niveau de l\'étudiant',
            'Génération de code commenté et prêt à l\'emploi',
            'Support de 200+ langages de programmation',
            'Explications pas à pas sur demande',
        ],
    },
    {
        icon: BookOpen,
        gradient: 'from-emerald-500 to-teal-400',
        shadowColor: 'shadow-emerald-500/20',
        borderColor: 'border-emerald-500/20',
        badge: 'Pratique',
        title: 'Exercices Sur-Mesure',
        desc: 'Des exercices progressifs générés dynamiquement avec des solutions commentées et des indices personnalisés.',
        details: [
            'Génération dynamique selon votre niveau',
            'Difficulté progressive et adaptative',
            'Solutions détaillées et commentées',
            'Indices personnalisés si vous bloquez',
            'Historique de vos exercices réalisés',
        ],
    },
    {
        icon: Target,
        gradient: 'from-orange-500 to-amber-400',
        shadowColor: 'shadow-orange-500/20',
        borderColor: 'border-orange-500/20',
        badge: 'Évaluation',
        title: 'Quiz Adaptatifs',
        desc: '20 questions par quiz, feedback instantané, explications détaillées et ajustement automatique de votre niveau.',
        details: [
            '20 questions par session de quiz',
            'Feedback instantané après chaque réponse',
            'Explications détaillées des bonnes réponses',
            'Ajustement automatique du niveau',
            'Score et statistiques en fin de quiz',
        ],
    },
    {
        icon: BarChart3,
        gradient: 'from-purple-500 to-pink-400',
        shadowColor: 'shadow-purple-500/20',
        borderColor: 'border-purple-500/20',
        badge: 'Analytique',
        title: 'Suivi de Progression',
        desc: 'Tableaux de bord interactifs, scores par sujet, historique complet et recommandations personnalisées.',
        details: [
            'Tableau de bord interactif en temps réel',
            'Scores détaillés par sujet et par session',
            'Historique complet de votre apprentissage',
            'Recommandations personnalisées de sujets',
            'Visualisation de vos points forts et axes d\'amélioration',
        ],
    },
];

const workflowSteps = [
    { icon: GraduationCap, label: 'Cours', color: 'bg-violet-500/15 border-violet-500/30 text-violet-300' },
    { icon: Video, label: 'Section', color: 'bg-blue-500/15   border-blue-500/30   text-blue-300' },
    { icon: Target, label: 'Quiz IA', color: 'bg-orange-500/15 border-orange-500/30 text-orange-300' },
    { icon: BookOpen, label: 'Exercice IA', color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' },
];



const FeaturesPage = () => {

    const topFeatures = features.slice(0, 2);
    const bottomFeatures = features.slice(2);

    return (
        <div className="min-h-screen bg-gray-950 overflow-hidden relative">

            {}
            <div className="fixed inset-0 grid-pattern pointer-events-none" />
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] radial-glow opacity-40" />
            </div>

            <PublicNavbar />

            <main className="relative pt-28 pb-24 px-4">
                <div className="max-w-6xl mx-auto space-y-20">

                    {}
                    <section className="text-center animate-fade-in-up">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-6">
                            <Zap className="w-3.5 h-3.5" /> Fonctionnalités
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
                            Tout pour{' '}
                            <span className="shimmer-text animate-shimmer">apprendre mieux</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                            Un compagnon d'apprentissage intelligent qui s'adapte à votre rythme et à votre niveau.
                        </p>
                    </section>

                    {}
                    <section className="space-y-8">

                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {topFeatures.map((f, i) => (
                                <FeatureCard key={i} f={f} delay={i * 100} />
                            ))}
                        </div>

                        {}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {bottomFeatures.map((f, i) => (
                                <FeatureCard key={i} f={f} delay={(i + 2) * 100} />
                            ))}
                        </div>
                    </section>

                    {}
                    <section
                        className="glass-card rounded-2xl p-8 border border-violet-500/15 animate-fade-in-up"
                        style={{ animationDelay: '500ms' }}
                    >
                        <div className="flex flex-col lg:flex-row items-center gap-8">

                            {}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Layers className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg">Un cours, une section, un quiz</h3>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                                    Depuis chaque section d'un cours, générez en un clic un quiz ou un exercice IA ciblé sur
                                    le sujet de la leçon. Votre progression est automatiquement enregistrée.
                                </p>
                            </div>

                            {/* Right: steps */}
                            <div className="flex items-center gap-3 flex-shrink-0 flex-wrap justify-center">
                                {workflowSteps.map((step, i, arr) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${step.color}`}>
                                            <step.icon className="w-4 h-4" />
                                            <span className="text-xs font-semibold whitespace-nowrap">{step.label}</span>
                                        </div>
                                        {i < arr.length - 1 && (
                                            <ArrowRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── CTA ── */}
                    <div className="text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                        <p className="text-gray-500 text-sm mb-6">Aucune carte bancaire requise · Accès immédiat</p>
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] transition-all duration-300"
                        >
                            Commencer gratuitement
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                </div>
            </main>

            <PublicFooter />
        </div>
    );
};

/* ── Shared card component ── */
const FeatureCard = ({ f, delay }) => (
    <div
        className={`group glass-card rounded-2xl p-8 border ${f.borderColor} hover:scale-[1.02] hover:shadow-xl ${f.shadowColor} transition-all duration-500 animate-fade-in-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Icon + badge */}
        <div className="flex items-start justify-between mb-5">
            <div
                className={`w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
            >
                <f.icon className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-1">
                {f.badge}
            </span>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{f.title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">{f.desc}</p>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-5" />

        {/* Detail list */}
        <ul className="space-y-2.5">
            {f.details.map((d, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    {d}
                </li>
            ))}
        </ul>
    </div>
);

export default FeaturesPage;