import { useState } from 'react';
import {
    Bug, CheckCircle2, AlertCircle, Monitor, Smartphone,
    Globe, Code2, MessageCircle, Zap, ChevronDown, Send, Loader2
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { sendContactMessage } from '../service/Api';

const CATEGORIES = [
    { value: 'ui', label: "Interface / Affichage", icon: Monitor },
    { value: 'auth', label: "Connexion / Inscription", icon: Globe },
    { value: 'chat', label: "Assistant IA", icon: MessageCircle },
    { value: 'quiz', label: "Quiz / Exercices", icon: Code2 },
    { value: 'perf', label: "Performance / Lenteur", icon: Zap },
    { value: 'mobile', label: "Mobile", icon: Smartphone },
    { value: 'other', label: "Autre", icon: Bug },
];

const SEVERITIES = [
    { value: 'low', label: 'Mineure', desc: "Gêne légère, contournement possible", color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' },
    { value: 'medium', label: 'Modérée', desc: "Fonctionnalité dégradée", color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' },
    { value: 'high', label: 'Critique', desc: "Blocage total, données perdues", color: 'text-red-400 border-red-500/30 bg-red-500/5' },
];

const SelectField = ({ label, value, onChange, children, icon: Icon }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all ${Icon ? 'pl-10' : ''}`}
            >
                {children}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
    </div>
);

const ReportPage = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        category: 'ui',
        severity: 'medium',
        title: '',
        description: '',
        steps: '',
        url: '',
    });
    const [status, setStatus] = useState('idle');

    const set = (key) => (val) => setForm((f) => ({ ...f, [key]: typeof val === 'string' ? val : val.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.title || !form.description) return;
        setStatus('loading');
        try {
            const catLabel = CATEGORIES.find((c) => c.value === form.category)?.label || form.category;
            const sevLabel = SEVERITIES.find((s) => s.value === form.severity)?.label || form.severity;

            const message = `🐛 RAPPORT DE BUG\n\nCatégorie : ${catLabel}\nSévérité : ${sevLabel}\nURL concernée : ${form.url || 'Non précisée'}\n\nDescription :\n${form.description}\n\nÉtapes pour reproduire :\n${form.steps || 'Non précisées'}`;

            await sendContactMessage({
                name: form.name || 'Anonyme',
                email: form.email,
                subject: `[BUG - ${sevLabel}] ${form.title}`,
                message,
            });
            setStatus('success');
        } catch {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gray-950 text-white">
                <PublicNavbar />
                <div className="flex items-center justify-center min-h-[80vh] px-6">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Rapport envoyé !</h2>
                        <p className="text-gray-400 mb-6">
                            Merci pour votre signalement. Notre équipe va analyser le bug et vous contactera si nécessaire à l'adresse <span className="text-white font-medium">{form.email}</span>.
                        </p>
                        <button
                            onClick={() => { setStatus('idle'); setForm({ name: '', email: '', category: 'ui', severity: 'medium', title: '', description: '', steps: '', url: '' }); }}
                            className="px-5 py-2.5 bg-gray-800 border border-gray-700 text-white text-sm rounded-xl hover:bg-gray-700 transition-colors"
                        >
                            Signaler un autre bug
                        </button>
                    </div>
                </div>
                <PublicFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <PublicNavbar />

            {/* Hero */}
            <section className="relative pt-28 pb-12 px-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-transparent pointer-events-none" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/8 rounded-full blur-3xl pointer-events-none" />
                <div className="relative max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-5">
                        <Bug className="w-3.5 h-3.5" />
                        Signalement de bug
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        Vous avez trouvé{' '}
                        <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">un bug ?</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Aidez-nous à améliorer InfoAcademy. Chaque rapport compte.
                    </p>
                </div>
            </section>

            {/* Form */}
            <section className="max-w-2xl mx-auto px-6 pb-24">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Identity */}
                    <div className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800/60 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Vos coordonnées</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nom <span className="text-gray-600 font-normal">(optionnel)</span></label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={set('name')}
                                    placeholder="Votre nom"
                                    className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email <span className="text-red-400">*</span></label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={set('email')}
                                    placeholder="votre@email.com"
                                    required
                                    className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bug info */}
                    <div className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800/60 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Détails du bug</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SelectField label="Catégorie" value={form.category} onChange={set('category')} icon={Bug}>
                                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </SelectField>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Sévérité</label>
                                <div className="space-y-2">
                                    {SEVERITIES.map((s) => (
                                        <label
                                            key={s.value}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-xl border cursor-pointer transition-all ${form.severity === s.value ? s.color : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}
                                        >
                                            <input type="radio" name="severity" value={s.value} checked={form.severity === s.value} onChange={() => set('severity')(s.value)} className="sr-only" />
                                            <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${form.severity === s.value ? 'border-current bg-current' : 'border-gray-600'}`} />
                                            <div>
                                                <span className="text-xs font-medium">{s.label}</span>
                                                <span className="text-xs text-gray-600 ml-1.5">{s.desc}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Titre du bug <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={set('title')}
                                placeholder="Ex : Le quiz ne se charge pas sur Chrome"
                                required
                                className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">URL concernée <span className="text-gray-600 font-normal">(optionnel)</span></label>
                            <input
                                type="text"
                                value={form.url}
                                onChange={set('url')}
                                placeholder="Ex : /courses/123 ou /quiz"
                                className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800/60 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Description</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Que s'est-il passé ? <span className="text-red-400">*</span></label>
                            <textarea
                                value={form.description}
                                onChange={set('description')}
                                rows={4}
                                required
                                placeholder="Décrivez le comportement observé et ce que vous attendiez..."
                                className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Étapes pour reproduire <span className="text-gray-600 font-normal">(optionnel)</span>
                            </label>
                            <textarea
                                value={form.steps}
                                onChange={set('steps')}
                                rows={3}
                                placeholder={"1. Je clique sur...\n2. Je remplis...\n3. Le bug apparaît"}
                                className="w-full bg-gray-900 border border-gray-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {}
                    {status === 'error' && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            Erreur lors de l'envoi. Vérifiez votre connexion et réessayez.
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={status === 'loading' || !form.email || !form.title || !form.description}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {status === 'loading' ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                        ) : (
                            <><Send className="w-4 h-4" /> Envoyer le rapport</>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-600">
                        Votre rapport sera traité sous 24-48h. Pour les bugs critiques, notre équipe vous contactera directement.
                    </p>
                </form>
            </section>

            <PublicFooter />
        </div>
    );
};

export default ReportPage;