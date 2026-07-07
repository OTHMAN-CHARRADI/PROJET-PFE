import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bot, Mail, Lock, Eye, EyeOff, User, ArrowLeft, Loader2,
  CheckCircle, Sparkles, Shield, BookOpen, Zap, KeyRound,
  UserCircle, ChevronDown, Star, ArrowRight, Rocket, Code2, Brain
} from 'lucide-react';
import ScrollToTop from '../components/ScrollToTop';

const ADMIN_SECRET = 'apprendreàcomprendre';

const RegisterPage = () => {
  const PERKS = [
    { icon: Zap, text: 'Accès immédiat et gratuit', desc: 'Pas de carte bancaire requise', gradient: 'from-amber-500 to-orange-500' },
    { icon: BookOpen, text: '200+ sujets informatiques', desc: 'Python, Java, C, SQL et plus', gradient: 'from-emerald-500 to-teal-500' },
    { icon: Shield, text: 'Progression sauvegardée', desc: 'Reprenez où vous avez arrêté', gradient: 'from-blue-500 to-cyan-500' },
  ];

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [secretCode, setSecretCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();


  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: score, label: 'Faible', color: 'bg-red-500', textColor: 'text-red-400' };
    if (score <= 3) return { level: score, label: 'Moyen', color: 'bg-orange-500', textColor: 'text-orange-400' };
    return { level: score, label: 'Fort', color: 'bg-green-500', textColor: 'text-green-400' };
  };
  const strength = getPasswordStrength();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (role === 'ADMIN' && secretCode !== ADMIN_SECRET) {
      setError('Code secret incorrect. Inscription administrateur refusée.');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password, role, role === 'ADMIN' ? secretCode : undefined);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Erreur lors de l'inscription.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="fixed inset-0 grid-pattern pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-3xl pointer-events-none animate-glow-pulse" />
        <div className="text-center animate-fade-in-up relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-green-500/20 rounded-3xl blur-2xl animate-glow-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Inscription réussie ! 🎉</h2>
          <p className="text-gray-400 text-lg mb-2">Bienvenue sur InfoAcademy !</p>
          <p className="text-gray-500 text-sm">Redirection vers la connexion...</p>
          <div className="mt-8 flex justify-center">
            <div className="w-48 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: '100%', animation: 'shimmer 2s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex relative overflow-hidden">
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-32 left-16 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-0 w-px h-2/3 -translate-y-1/2 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />

        <div className="max-w-md relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-10 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">InfoAcademy</span>
          </Link>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 animate-fade-in-up">
            Commencez votre parcours <span className="inline-block animate-bounce-slow">🚀</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '.1s' }}>
            Créez votre compte et accédez à un assistant pédagogique IA qui s'adapte à votre rythme.
          </p>

          <div className="space-y-4 mb-10">
            {PERKS.map((p, i) => (
              <div key={i} className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${(i + 2) * 0.12}s` }}>
                <div className={`w-11 h-11 bg-gradient-to-br ${p.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-gray-200 font-semibold text-sm">{p.text}</span>
                  <p className="text-gray-600 text-xs">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '.6s' }}>
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />)}
            </div>
            <p className="text-gray-400 text-sm italic leading-relaxed mb-4">
              "Grâce à InfoAcademy, j'ai pu réviser mes cours de structures de données en mode interactif. Les quiz m'ont vraiment aidé !"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg">AK</div>
              <div>
                <p className="text-sm font-medium text-gray-300">Ahmed K.</p>
                <p className="text-xs text-gray-600">Étudiant en L3 Informatique</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>

          <div className="glass-card rounded-3xl shadow-2xl shadow-black/30 p-8 sm:p-10 animate-fade-in-up relative overflow-hidden">
            {}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />

            <div className="text-center mb-8">
              <div className="lg:hidden w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-1">Créer un compte</h1>
              <p className="text-gray-500 text-sm">Rejoignez la communauté InfoAcademy</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-fade-in flex items-start gap-3">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Type de compte</label>
                <div className="grid grid-cols-2 gap-3">
                  {}
                  <button
                    type="button"
                    onClick={() => { setRole('USER'); setSecretCode(''); }}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${role === 'USER'
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-400 shadow-sm shadow-indigo-500/5'
                        : 'bg-gray-800/40 border-gray-700/50 text-gray-500 hover:border-gray-600/60 hover:text-gray-300'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${role === 'USER' ? 'bg-indigo-500/20' : 'bg-gray-700/50'}`}>
                      <UserCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold leading-none mb-0.5">Utilisateur</p>
                      <p className="text-[10px] opacity-60">Étudiant</p>
                    </div>
                    {role === 'USER' && <CheckCircle className="w-4 h-4 ml-auto flex-shrink-0" />}
                  </button>

                  {}
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${role === 'ADMIN'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/5'
                        : 'bg-gray-800/40 border-gray-700/50 text-gray-500 hover:border-gray-600/60 hover:text-gray-300'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${role === 'ADMIN' ? 'bg-amber-500/20' : 'bg-gray-700/50'}`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold leading-none mb-0.5">Admin</p>
                      <p className="text-[10px] opacity-60">Gestionnaire</p>
                    </div>
                    {role === 'ADMIN' && <CheckCircle className="w-4 h-4 ml-auto flex-shrink-0" />}
                  </button>
                </div>
              </div>

              {}
              {role === 'ADMIN' && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Code secret admin
                    <span className="ml-2 text-xs text-amber-500/70 font-normal">obligatoire</span>
                  </label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-amber-400 transition-colors" />
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      required
                      placeholder="Entrez le code secret"
                      className="w-full pl-12 pr-14 py-3.5 bg-gray-800/50 border border-amber-500/30 rounded-2xl text-white placeholder-gray-600 focus:border-amber-500/60 focus:bg-gray-800/80 focus:ring-2 focus:ring-amber-500/15 outline-none transition-all duration-300"
                    />
                    <button type="button" onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-1">
                      {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nom d'utilisateur</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    required minLength={3} placeholder="votre_pseudo"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-600 focus:border-indigo-500/50 focus:bg-gray-800/80 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* ── Email ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required placeholder="votre@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-600 focus:border-indigo-500/50 focus:bg-gray-800/80 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* ── Password ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Mot de passe</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    placeholder="min. 6 caractères"
                    className="w-full pl-12 pr-14 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-600 focus:border-indigo-500/50 focus:bg-gray-800/80 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-1">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-gray-800'}`} />
                      ))}
                    </div>
                    <p className={`text-xs mt-1.5 font-medium ${strength.textColor}`}>Force : {strength.label}</p>
                  </div>
                )}
              </div>

              {/* ── Confirm password ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Confirmer le mot de passe</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} required
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border rounded-2xl text-white placeholder-gray-600 focus:bg-gray-800/80 focus:ring-2 outline-none transition-all duration-300 ${confirmPassword && password !== confirmPassword
                        ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                        : confirmPassword && password === confirmPassword
                          ? 'border-green-500/50 focus:border-green-500/50 focus:ring-green-500/20'
                          : 'border-gray-700/50 focus:border-indigo-500/50 focus:ring-indigo-500/20'
                      }`}
                  />
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                  )}
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1.5 font-medium">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* ── Submit ── */}
              <button type="submit" disabled={loading}
                className={`w-full py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2 relative overflow-hidden group ${role === 'ADMIN'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/20 hover:shadow-amber-500/35'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/20 hover:shadow-indigo-500/35'
                  }`}>
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${role === 'ADMIN'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                    : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                  }`} />
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Inscription...</>
                  ) : (
                    <>{role === 'ADMIN' ? <Shield className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      {role === 'ADMIN' ? "Créer le compte admin" : "S'inscrire"}</>
                  )}
                </span>
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
              <span className="text-xs text-gray-600 uppercase tracking-wider font-medium">ou</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
            </div>

            <p className="text-center text-sm text-gray-500">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Se connecter
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-center text-xs text-gray-700">
              © {new Date().getFullYear()} InfoAcademy — Service opérationnel
            </p>
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default RegisterPage;