import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { Link } from 'react-router-dom';
import { Globe, Code2, GraduationCap, Video, ArrowRight, Layers } from 'lucide-react';

const coursesHighlight = [
    { name: 'Java', color: 'from-orange-400 to-red-500', sections: 21, border: 'border-orange-500/25', text: 'text-orange-400', bg: 'bg-orange-500/10' },
    { name: 'Python', color: 'from-yellow-400 to-yellow-600', sections: 18, border: 'border-yellow-500/25', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { name: 'JavaScript', color: 'from-yellow-300 to-amber-500', sections: 15, border: 'border-amber-500/25', text: 'text-amber-400', bg: 'bg-amber-500/10' },
    { name: 'Réseaux', color: 'from-sky-400 to-blue-600', sections: 12, border: 'border-sky-500/25', text: 'text-sky-400', bg: 'bg-sky-500/10' },
    { name: 'Algorithmique', color: 'from-indigo-400 to-violet-500', sections: 10, border: 'border-indigo-500/25', text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { name: 'AWS & Cloud', color: 'from-orange-300 to-amber-600', sections: 9, border: 'border-orange-400/25', text: 'text-orange-300', bg: 'bg-orange-400/10' },
];

const topicGroups = [

];



const TopicsPage = () => (
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
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-semibold uppercase tracking-widest mb-6">
                        <Globe className="w-3.5 h-3.5" /> Sujets & Cours
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
                        200+ sujets{' '}
                        <span className="shimmer-text animate-shimmer">couverts</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Du C bas niveau au Machine Learning, InfoAcademy couvre tout l'éventail de l'informatique
                        moderne, avec des cours structurés pour les sujets les plus populaires.
                    </p>
                </section>

                {}
                <section
                    className="glass-card rounded-2xl p-7 border border-violet-500/15 animate-fade-in-up"
                    style={{ animationDelay: '80ms' }}
                >
                    {}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-base">Cours disponibles</h2>
                            <p className="text-gray-500 text-xs">Parcours structurés avec vidéos, sections et quiz IA</p>
                        </div>
                        <Link
                            to="/register"
                            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Voir tous <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {coursesHighlight.map((c, i) => (
                            <div
                                key={i}
                                className={`${c.bg} border ${c.border} rounded-xl p-3.5 hover:scale-[1.04] transition-all duration-200 group cursor-default`}
                            >
                                <div className={`h-1 w-8 bg-gradient-to-r ${c.color} rounded-full mb-2.5 group-hover:w-full transition-all duration-500`} />
                                <p className={`text-xs font-bold ${c.text} mb-2`}>{c.name}</p>
                                <div className="flex items-center gap-1 mb-0.5">
                                    <Layers className="w-3 h-3 text-gray-600 flex-shrink-0" />
                                    <span className="text-[10px] text-gray-500">{c.sections} sections</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Video className="w-3 h-3 text-gray-600 flex-shrink-0" />
                                    <span className="text-[10px] text-gray-500">Vidéos incluses</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {}
                <section className="space-y-14">
                    {topicGroups.map((group, gi) => (
                        <div
                            key={gi}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${gi * 80}ms` }}
                        >
                            {}
                            <div className="flex items-center gap-3 mb-5">
                                <span className={`w-2 h-2 rounded-full ${group.dotColor} flex-shrink-0`} />
                                <Code2 className={`w-4 h-4 ${group.color} flex-shrink-0`} />
                                <h2 className={`text-base font-bold ${group.color}`}>{group.label}</h2>
                                <span className="text-xs text-gray-600 font-medium">{group.items.length} sujets</span>
                                <div className="flex-1 h-px bg-gray-800/60" />
                            </div>

                            {}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {group.items.map((t, i) => (
                                    <div
                                        key={i}
                                        className="glass-card rounded-xl p-4 hover:scale-[1.03] hover:shadow-lg transition-all duration-300 cursor-default group"
                                    >
                                        <div className={`h-1.5 w-10 bg-gradient-to-r ${t.color} rounded-full mb-3 group-hover:w-full transition-all duration-500`} />
                                        <p className="text-white font-semibold text-sm mb-1">{t.name}</p>
                                        <p className="text-gray-500 text-xs leading-relaxed">{t.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>



                {}
                <div className="text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <p className="text-gray-500 text-sm mb-6">Aucune carte bancaire requise · Accès immédiat</p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] transition-all duration-300"
                    >
                        Explorer tous les sujets
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

            </div>
        </main>

        <PublicFooter />
    </div>
);

export default TopicsPage;