import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getTestimonials, submitTestimonial } from '../service/Api';
import {
    Bot, Star, ArrowLeft, Shield, Send, PenLine, X, CheckCircle2
} from 'lucide-react';


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


const TestimonialCard = ({ t, index }) => {
    const ac = cardAccents[index % cardAccents.length];
    const initials = (t.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const rating = t.rating || 5;
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-[#0d0f14] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 animate-fade-in-up">
            <div className={`absolute left-0 top-4 bottom-4 w-[3px] ${ac.bar} rounded-full opacity-70 group-hover:opacity-100 group-hover:top-0 group-hover:bottom-0 transition-all duration-500`} />
            <div className="pl-7 pr-6 py-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-800 text-gray-800'}`} />
                        ))}
                    </div>
                    <span className={`text-xs font-bold tabular-nums ${ac.text} opacity-60`}>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <p className="text-gray-400 text-[13px] leading-[1.75] mb-5 line-clamp-4 group-hover:text-gray-300 transition-colors duration-300">
                    "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${ac.avatar} flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 shadow-md`}>
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-white truncate leading-tight">{t.name}</p>
                        <p className="text-[11px] text-gray-600 truncate mt-0.5">{t.role || 'Apprenant'}</p>
                    </div>
                    {rating === 5 && <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest opacity-70">★ Top</span>}
                </div>
            </div>
        </div>
    );
};


const ReviewsPage = () => {
    const { isAuthenticated, user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState(0);
    const [showAll, setShowAll] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', role: '', text: '', rating: 5 });
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        getTestimonials()
            .then(data => setTestimonials(Array.isArray(data) ? data : []))
            .catch(() => setTestimonials([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user?.username) {
            setFormData(prev => ({ ...prev, name: prev.name || user.username }));
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.text.trim()) { setFormError('Le texte est requis.'); return; }
        setFormLoading(true); setFormError('');
        try {
            await submitTestimonial(formData);
            setFormSuccess(true);
            setFormData({ name: user?.username || '', role: '', text: '', rating: 5 });
            const updated = await getTestimonials();
            setTestimonials(Array.isArray(updated) ? updated : []);
            setTimeout(() => { setFormSuccess(false); setShowForm(false); }, 3500);
        } catch (err) {
            setFormError(err?.response?.data?.detail || 'Une erreur est survenue.');
        } finally {
            setFormLoading(false);
        }
    };

    const filtered = filterRating ? testimonials.filter(t => (t.rating || 5) === filterRating) : testimonials;
    const INITIAL_COUNT = 3;
    const visibleReviews = showAll ? filtered : filtered.slice(-INITIAL_COUNT).reverse();
    const hiddenCount = filtered.length - INITIAL_COUNT;

    const avg = testimonials.length
        ? (testimonials.reduce((s, t) => s + (t.rating || 5), 0) / testimonials.length).toFixed(1)
        : null;

    return (
        <div className="min-h-screen bg-gray-950 overflow-hidden relative">
            {}
            <div className="fixed inset-0 grid-pattern pointer-events-none" />
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
            </div>
            <PublicNavbar />

            {}
            <main className="relative pt-28 pb-24 px-4">
                <div className="max-w-6xl mx-auto">

                    {}
                    <div className="text-center mb-12 animate-fade-in-up">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-bold uppercase tracking-[0.15em] mb-5">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> Avis
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5">
                            Ils nous font <span className="shimmer-text animate-shimmer">confiance</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl mx-auto text-lg">
                            Découvrez ce que nos apprenants pensent de leur expérience avec InfoAcademy.
                        </p>
                    </div>

                    {}
                    {avg && (
                        <div className="max-w-2xl mx-auto mb-10 glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <div className="flex gap-6 items-center">
                                <div className="text-center flex-shrink-0">
                                    <p className="text-5xl font-black text-white">{avg}</p>
                                    <div className="flex gap-0.5 justify-center my-1.5">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />)}
                                    </div>
                                    <p className="text-xs text-gray-500">{testimonials.length} avis</p>
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    {[5, 4, 3, 2, 1].map(r => {
                                        const count = testimonials.filter(t => (t.rating || 5) === r).length;
                                        return (
                                            <div key={r} className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 w-3">{r}</span>
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                                                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700"
                                                        style={{ width: testimonials.length ? `${(count / testimonials.length) * 100}%` : '0%' }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600 w-4 text-right">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {}
                    {testimonials.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mb-10 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                            {[0, 5, 4, 3].map(r => (
                                <button
                                    key={r}
                                    onClick={() => { setFilterRating(filterRating === r ? 0 : r); setShowAll(false); }}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${filterRating === r
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                                        : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'}`}
                                >
                                    {r === 0 ? 'Tous les avis' : <><Star className="w-3 h-3 fill-current" /> {r} étoile{r > 1 ? 's' : ''}</>}
                                </button>
                            ))}
                        </div>
                    )}

                    {}
                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {visibleReviews.map((t, i) => <TestimonialCard key={t.id} t={t} index={i} />)}
                            </div>
                            {filtered.length > INITIAL_COUNT && (
                                <div className="flex justify-center mb-12">
                                    <button
                                        onClick={() => setShowAll(v => !v)}
                                        className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-gray-700/50 bg-gray-900/60 text-sm font-medium text-gray-400 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/5 transition-all duration-200"
                                    >
                                        {showAll ? (
                                            <><span>Masquer les anciens avis</span><span className="text-amber-500">↑</span></>
                                        ) : (
                                            <><span>Voir les {hiddenCount} autre{hiddenCount > 1 ? 's' : ''} avis</span><span className="text-amber-500">↓</span></>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : testimonials.length > 0 ? (
                        <div className="text-center py-12 mb-12 glass-card rounded-2xl">
                            <Star className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-500">Aucun avis avec cette note.</p>
                            <button onClick={() => setFilterRating(0)} className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">Voir tous les avis</button>
                        </div>
                    ) : (
                        <div className="text-center py-16 mb-12 glass-card rounded-2xl">
                            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Star className="w-7 h-7 text-amber-500/50" />
                            </div>
                            <p className="text-white font-semibold mb-1">Aucun avis pour le moment</p>
                            <p className="text-gray-500 text-sm">Soyez le premier à partager votre expérience !</p>
                        </div>
                    )}

                    {}
                    <div className="max-w-2xl mx-auto">
                        {isAuthenticated && !isAdmin ? (
                            <>
                                {!showForm && !formSuccess && (
                                    <div className="text-center">
                                        <p className="text-gray-500 text-sm mb-4">Partagez votre expérience avec la communauté</p>
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
                                        >
                                            <PenLine className="w-4 h-4" />
                                            Laisser un avis
                                        </button>
                                    </div>
                                )}

                                {formSuccess && (
                                    <div className="glass-card rounded-2xl p-8 text-center animate-fade-in border border-emerald-500/20 bg-emerald-500/5">
                                        <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                                        </div>
                                        <p className="text-white font-bold text-lg mb-1">Merci pour votre avis !</p>
                                        <p className="text-sm text-gray-400">Il sera visible après validation par un administrateur.</p>
                                    </div>
                                )}

                                {showForm && !formSuccess && (
                                    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in border border-gray-800/50">
                                        <div className="px-6 pt-6 pb-5 border-b border-gray-800/50 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                                                        <PenLine className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-white">Votre avis</h3>
                                                        <p className="text-xs text-gray-500">Partagez votre expérience</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setShowForm(false); setFormError(''); }} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/50 transition-all">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Nom affiché</label>
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                                        placeholder="Votre prénom ou pseudo"
                                                        className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Votre profil</label>
                                                    <input
                                                        type="text"
                                                        value={formData.role}
                                                        onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                                                        placeholder="Ex: Étudiant en L3 Info"
                                                        className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Votre note</label>
                                                <StarRating value={formData.rating} onChange={v => setFormData(p => ({ ...p, rating: v }))} size="lg" />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Témoignage <span className="text-amber-500">*</span></label>
                                                <textarea
                                                    value={formData.text}
                                                    onChange={e => setFormData(p => ({ ...p, text: e.target.value }))}
                                                    placeholder="Partagez votre expérience avec InfoAcademy..."
                                                    rows={4}
                                                    maxLength={1000}
                                                    className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-sm resize-none"
                                                />
                                                <div className="flex justify-between mt-1">
                                                    <p className="text-xs text-gray-600">Soyez honnête et constructif</p>
                                                    <p className="text-xs text-gray-600">{formData.text.length}/1000</p>
                                                </div>
                                            </div>

                                            {formError && (
                                                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                                                    <X className="w-4 h-4 flex-shrink-0" />
                                                    {formError}
                                                </div>
                                            )}

                                            <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                                <Shield className="w-3.5 h-3.5 text-gray-500" />
                                                Votre avis sera visible après validation par un administrateur.
                                            </p>

                                            <div className="flex gap-3 justify-end pt-1">
                                                <button type="button" onClick={() => { setShowForm(false); setFormError(''); }} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all">
                                                    Annuler
                                                </button>
                                                <button type="submit" disabled={formLoading} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100">
                                                    {formLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                                                    Envoyer l'avis
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </>
                        ) : !isAdmin && (
                            <div className="text-center">
                                <p className="text-gray-500 text-sm mb-4">Vous avez utilisé InfoAcademy ?</p>
                                <Link to="/login" className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-amber-500/30 bg-amber-500/5 text-amber-300 font-semibold rounded-2xl hover:bg-amber-500/15 hover:border-amber-500/50 transition-all text-sm">
                                    <PenLine className="w-4 h-4" />
                                    Connectez-vous pour laisser un avis
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    );
};

export default ReviewsPage;