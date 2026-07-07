import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import { Bot, Menu, X, Sun, Moon } from 'lucide-react';

const NAV_LINKS = [
    { to: '/', label: 'Home' },
    { to: '/features', label: 'Fonctionnalités' },
    { to: '/topics', label: 'Sujets' },
    { to: '/how-it-works', label: 'Comment ça marche' },
    { to: '/reviews', label: 'Avis' },
];

const PublicNavbar = () => {
    const { isAuthenticated, user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);


    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isActive = (to) => location.pathname === to;

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled
            ? 'bg-gray-950/80 backdrop-blur-2xl border-b border-gray-800/50 shadow-xl shadow-black/20'
            : 'bg-gray-950/80 backdrop-blur-2xl border-b border-gray-800/50'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">

                    {}
                    <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            InfoAcademy
                        </span>
                    </Link>

                    {}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`text-sm font-medium transition-colors ${isActive(to)
                                    ? 'text-white border-b-2 border-indigo-400 pb-0.5'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                            title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <Link
                            to={isAuthenticated ? (isAdmin ? '/admin' : '/home') : '/login'}
                            className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            {isAuthenticated ? 'Mon espace' : 'Se connecter'}
                        </Link>
                        {!isAdmin && (
                            <Link
                                to={isAuthenticated ? '/chat' : '/register'}
                                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-105 active:scale-95 transition-all"
                            >
                                {isAuthenticated ? 'Aller au chat' : 'Commencer'}
                            </Link>
                        )}
                    </div>

                    {}
                    <button
                        onClick={() => setMobileOpen(o => !o)}
                        className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {}
                {mobileOpen && (
                    <div className="md:hidden pb-4 space-y-1 animate-fade-in">
                        {NAV_LINKS.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`block px-4 py-2.5 text-sm rounded-xl transition-all ${isActive(to)
                                    ? 'bg-indigo-500/10 text-indigo-300 font-medium'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                    }`}
                            >
                                {label}
                            </Link>
                        ))}
                        <div className="pt-2 flex flex-col gap-2 border-t border-gray-800/50 mt-2">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white rounded-xl hover:bg-gray-800/50 transition-all"
                            >
                                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                {isDark ? 'Mode clair' : 'Mode sombre'}
                            </button>
                            <Link
                                to={isAuthenticated ? (isAdmin ? '/admin' : '/home') : '/login'}
                                className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white text-center rounded-xl border border-gray-800 hover:border-gray-700 transition-all"
                            >
                                {isAuthenticated ? 'Mon espace' : 'Se connecter'}
                            </Link>
                            {!isAdmin && (
                                <Link
                                    to={isAuthenticated ? '/chat' : '/register'}
                                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl text-center shadow-lg shadow-indigo-500/20"
                                >
                                    {isAuthenticated ? 'Aller au chat' : 'Commencer'}
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default PublicNavbar;