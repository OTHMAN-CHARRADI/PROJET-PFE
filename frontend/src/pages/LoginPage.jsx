import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, Sparkles, MessageSquare, Target, BarChart3, KeyRound, Star, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import ScrollToTop from '../components/ScrollToTop';

const ADMIN_SECRET = 'apprendreàcomprendre';

const LoginPage = () => {
  const PERKS = [
    { icon: MessageSquare, text: 'Chat IA illimité', desc: 'Posez toutes vos questions' },
    { icon: Target, text: 'Quiz adaptatifs', desc: '20 questions par session' },
    { icon: BarChart3, text: 'Suivi de progression', desc: 'Tableaux de bord interactifs' },
  ];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {

      const loggedUser = await login(email, password);
      const role = loggedUser?.role;


      if (role === 'ADMIN') {
        if (secretCode !== ADMIN_SECRET) {

          logout();
          setError('Code secret incorrect. Accès administrateur refusé.');
          setLoading(false);
          return;
        }
      }

      navigate(role === 'ADMIN' ? '/admin' : '/home');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erreur de connexion. Vérifiez vos identifiants.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex relative overflow-hidden">
      {}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-purple-500/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 right-0 w-px h-2/3 -translate-y-1/2 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent" />

        <div className="max-w-md relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-10 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">InfoAcademy</span>
          </Link>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 animate-fade-in-up">
            Bon retour parmi nous <span className="inline-block animate-bounce-slow">👋</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '.1s' }}>
            Continuez votre apprentissage là où vous l'avez laissé. Votre assistant IA vous attend.
          </p>

          <div className="space-y-4 mb-10">
            {PERKS.map((p, i) => (
              <div key={i} className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${(i + 2) * 0.12}s` }}>
                <div className="w-11 h-11 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <p.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <span className="text-gray-200 font-semibold text-sm">{p.text}</span>
                  <p className="text-gray-600 text-xs">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats mini */}
          <div className="glass-card rounded-2xl p-5 animate-fade-in-up" style={{ animationDelay: '.5s' }}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">200+</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Sujets</p>
              </div>
              <div>
                <p className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">24/7</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Disponible</p>
              </div>
              <div>
                <p className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">100%</p>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">Gratuit</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>

          <div className="glass-card rounded-3xl shadow-2xl shadow-black/30 p-8 sm:p-10 animate-fade-in-up relative overflow-hidden">
            {}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

            {}
            <div className="text-center mb-8">
              <div className="lg:hidden w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-1">Connexion</h1>
              <p className="text-gray-500 text-sm">Accédez à votre espace d'apprentissage</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-fade-in flex items-start gap-3">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-600 focus:border-indigo-500/50 focus:bg-gray-800/80 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Mot de passe</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-14 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-600 focus:border-indigo-500/50 focus:bg-gray-800/80 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-300"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-1">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Secret code */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Code secret
                  <span className="ml-2 text-xs text-gray-600 font-normal">(requis pour les administrateurs)</span>
                </label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="Laissez vide si vous n'êtes pas admin"
                    className="w-full pl-12 pr-14 py-3.5 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-600 focus:border-amber-500/50 focus:bg-gray-800/80 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all duration-300"
                  />
                  <button type="button" onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors p-1">
                    {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white font-bold text-base shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</>
                  ) : (
                    <>Se connecter <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
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
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Créer un compte
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

export default LoginPage;