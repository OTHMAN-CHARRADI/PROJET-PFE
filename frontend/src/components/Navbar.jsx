import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bot, MessageSquare, Target, BarChart3, LogOut, Menu, X,
  Dumbbell, UserCircle, Sun, Moon, Home,
  GraduationCap, Shield, Bell, Heart, Reply, Pin, Trash2, Headphones
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead, deleteNotification, deleteAllNotifications } from '../service/Api';

const NOTIF_ICONS = {
  LIKE: { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  REPLY: { icon: Reply, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  PINNED: { icon: Pin, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  DELETED: { icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10' },
  SUPPORT_REPLY: { icon: Headphones, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

const NOTIF_LABELS = {
  LIKE: (actor) => `${actor} a aimé votre commentaire`,
  REPLY: (actor) => `${actor} a répondu à votre commentaire`,
  PINNED: () => `L'admin a épinglé votre commentaire`,
  DELETED: () => `L'admin a supprimé votre commentaire`,
  SUPPORT_REPLY: (_, preview) => `L'admin a répondu à votre message de support${preview ? ` : "${preview}"` : ''}`,
};

const timeAgo = (date) => {
  if (!date) return '';
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} j`;
};

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);


  useEffect(() => {
    if (!isAuthenticated || user?.role === 'ADMIN') return;

    const fetchCount = async () => {
      try {
        const data = await getUnreadCount();
        setUnreadCount(data.count || 0);
      } catch { }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);


  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openNotifications = async () => {
    if (!notifOpen) {
      try {
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(0);
        await markAllNotificationsRead();
      } catch { }
    }
    setNotifOpen(!notifOpen);
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch { }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setNotifications([]);
    } catch { }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  const rightLinks = isAuthenticated
    ? user?.role === 'ADMIN'
      ? [
        { path: '/profile', label: 'Profil', icon: UserCircle },
      ]
      : [
        { path: '/courses', label: 'Cours', icon: GraduationCap },
        { path: '/chat', label: 'Chat', icon: MessageSquare },
        { path: '/quiz', label: 'Quiz', icon: Target },
        { path: '/exercises', label: 'Exercices', icon: Dumbbell },
        { path: '/progress', label: 'Progression', icon: BarChart3 },
        { path: '/profile', label: 'Profil', icon: UserCircle },
      ]
    : [
      { path: '/login', label: 'Connexion' },
      { path: '/register', label: 'Inscription' },
    ];


  const allMobileLinks = isAuthenticated
    ? user?.role === 'ADMIN'
      ? [
        { path: '/admin', label: 'Accueil', icon: Home },
        { path: '/profile', label: 'Profil', icon: UserCircle },
      ]
      : [
        { path: '/home', label: 'Accueil', icon: Home },
        { path: '/courses', label: 'Cours', icon: GraduationCap },
        { path: '/chat', label: 'Chat', icon: MessageSquare },
        { path: '/quiz', label: 'Quiz', icon: Target },
        { path: '/exercises', label: 'Exercices', icon: Dumbbell },
        { path: '/progress', label: 'Progression', icon: BarChart3 },
        { path: '/profile', label: 'Profil', icon: UserCircle },
      ]
    : [
      { path: '/login', label: 'Connexion' },
      { path: '/register', label: 'Inscription' },
    ];

  const linkClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === path
      ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
      : isDark
        ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${isDark ? 'bg-gray-950/80 border-gray-800/50' : 'bg-white/80 border-gray-200/60'
      }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-2">

          {}
          <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              InfoAcademy
            </span>
          </Link>

          {}
          {isAuthenticated && (
            <Link
              to={user?.role === 'ADMIN' ? '/admin' : '/home'}
              className={`hidden md:flex ${linkClass(user?.role === 'ADMIN' ? '/admin' : '/home')}`}
            >
              <Home className="w-4 h-4" />
              Accueil
            </Link>
          )}

          {}
          <div className="flex-1" />

          {}
          <div className="hidden md:flex items-center gap-1">
            {rightLinks.map((link) => {
              const isChatLink = link.path === '/chat';
              const handleClick = (e) => {
                if (isChatLink) { e.preventDefault(); navigate(`/chat?new=${Date.now()}`); }
              };
              return (
                <Link
                  key={link.path}
                  to={isChatLink ? '#' : link.path}
                  onClick={handleClick}
                  className={linkClass(link.path)}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                {}
                {user?.role !== 'ADMIN' && (
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={openNotifications}
                      className={`relative p-2 rounded-lg transition-all duration-200 ml-1 ${isDark ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-800/50' : 'text-gray-500 hover:text-indigo-500 hover:bg-gray-100'}`}
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {}
                    {notifOpen && (
                      <div className={`absolute right-0 top-12 z-50 w-80 rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-gray-900 border-gray-700/60' : 'bg-white border-gray-200'}`}>
                        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Notifications</span>
                          <div className="flex items-center gap-2">
                            {notifications.length > 0 && (
                              <>
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{notifications.length} au total</span>
                                <button
                                  onClick={handleDeleteAll}
                                  title="Supprimer toutes les notifications"
                                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-400 hover:bg-red-50'}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Tout supprimer
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2">
                              <Bell className="w-8 h-8 text-gray-600 opacity-40" />
                              <p className="text-sm text-gray-500">Aucune notification</p>
                            </div>
                          ) : (
                            notifications.map(notif => {
                              const conf = NOTIF_ICONS[notif.type] || NOTIF_ICONS.LIKE;
                              const IconComp = conf.icon;
                              const label = NOTIF_LABELS[notif.type]?.(notif.actorUsername, notif.commentPreview) || '';


                              const handleNotifClick = async () => {
                                try { await markNotificationRead(notif.id); } catch { }
                                setNotifOpen(false);

                                if (notif.type === 'SUPPORT_REPLY') {
                                  navigate('/profile');
                                  return;
                                }
                                if (notif.courseId && notif.sectionId) {
                                  const params = notif.commentId ? `?commentId=${notif.commentId}` : '';
                                  navigate(`/courses/${notif.courseId}/sections/${notif.sectionId}${params}`);
                                } else if (notif.courseId) {
                                  const params = notif.commentId ? `?commentId=${notif.commentId}` : '';
                                  navigate(`/courses/${notif.courseId}${params}`);
                                } else {

                                  navigate('/courses');
                                }
                              };


                              const isNavigable = true;

                              return (
                                <div
                                  key={notif.id}
                                  onClick={isNavigable ? handleNotifClick : undefined}
                                  className={`flex gap-3 px-4 py-3 border-b transition-colors
                                    ${isNavigable ? 'cursor-pointer' : ''}
                                    ${isDark ? 'border-gray-800/60 hover:bg-gray-800/30' : 'border-gray-100 hover:bg-gray-50'}
                                    ${!notif.read ? (isDark ? 'bg-indigo-500/5' : 'bg-indigo-50/60') : ''}`}
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${conf.bg}`}>
                                    <IconComp className={`w-4 h-4 ${conf.color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium leading-snug ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{label}</p>
                                    {notif.commentPreview && notif.type !== 'SUPPORT_REPLY' && (
                                      <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>"{notif.commentPreview}"</p>
                                    )}
                                    <p className="text-[11px] text-gray-600 mt-0.5">{timeAgo(notif.createdAt)}</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    {!notif.read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1" />}
                                    {isNavigable && (
                                      <span className={`text-[10px] font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>Voir →</span>
                                    )}
                                    <button
                                      onClick={(e) => handleDeleteNotif(e, notif.id)}
                                      title="Supprimer cette notification"
                                      className={`p-0.5 rounded transition-colors ${isDark ? 'text-gray-600 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:text-red-400 hover:bg-red-50'}`}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all duration-200 ml-1 ${isDark ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50' : 'text-gray-500 hover:text-yellow-500 hover:bg-gray-100'
                    }`}
                  title={isDark ? 'Mode clair' : 'Mode sombre'}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ml-1"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            )}
          </div>

          {}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800/50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {}
      {mobileOpen && (
        <div className={`md:hidden backdrop-blur-xl border-b animate-fade-in ${isDark ? 'bg-gray-900/95 border-gray-800/50' : 'bg-white/95 border-gray-200/50'
          }`}>
          <div className="px-4 py-3 space-y-1">
            {allMobileLinks.map((link) => {
              const isChatLink = link.path === '/chat';
              const handleClick = (e) => {
                setMobileOpen(false);
                if (isChatLink) { e.preventDefault(); navigate(`/chat?new=${Date.now()}`); }
              };
              return (
                <Link
                  key={link.path}
                  to={isChatLink ? '#' : link.path}
                  onClick={handleClick}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${location.pathname === link.path
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated && (
              <>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 transition-all w-full"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? 'Mode clair' : 'Mode sombre'}
                </button>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;