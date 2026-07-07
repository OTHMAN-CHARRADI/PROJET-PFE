import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import { updateProfile, getStats, uploadAvatar, deleteAvatar, deleteAccount, resetLevel, deleteExerciseHistory, sendContactMessage } from '../service/Api';
import {
  User, Mail, Lock, Save, Loader2, CheckCircle, AlertCircle,
  Shield, Calendar, Zap, Flame, Award, Star, BarChart3,
  MessageSquare, Target, BookOpen, Eye, EyeOff, KeyRound, Pencil,
  Camera, Trash2, ImagePlus, RotateCcw, LifeBuoy, Send, ChevronDown, ChevronUp
} from 'lucide-react';

const AVATAR_BASE_URL = 'http://localhost:8080/uploads/avatars/';

const ProfilePage = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);


  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');


  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);


  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);


  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');


  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);


  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState('');
  const [supportError, setSupportError] = useState('');
  const [supportExpanded, setSupportExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error('Stats error:', err);
      }
    };
    fetchStats();
  }, []);

  const clearMessages = () => {
    setSuccess('');
    setError('');
  };


  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await doAvatarUpload(file);

    e.target.value = '';
  };

  const doAvatarUpload = async (file) => {
    clearMessages();


    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 5 Mo).');
      return;
    }


    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      await refreshUser();
      setAvatarPreview(null);
      setSuccess('Photo de profil mise à jour !');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setAvatarPreview(null);
      setError(err.response?.data?.detail || "Erreur lors de l'upload de la photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    clearMessages();
    setUploadingAvatar(true);
    try {
      await deleteAvatar();
      await refreshUser();
      setAvatarPreview(null);
      setSuccess('Photo de profil supprimée.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression.');
    } finally {
      setUploadingAvatar(false);
    }
  };


  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) doAvatarUpload(file);
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!username.trim() || !email.trim()) {
      setError("Le nom d'utilisateur et l'email sont requis.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ username: username.trim(), email: email.trim() });
      await refreshUser();
      setSuccess('Profil mis à jour avec succès !');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour du profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!currentPassword || !newPassword) {
      setError('Veuillez remplir tous les champs de mot de passe.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSavingPw(true);
    try {
      await updateProfile({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Mot de passe modifié avec succès !');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du changement de mot de passe.');
    } finally {
      setSavingPw(false);
    }
  };

  const handleResetLevel = async () => {
    clearMessages();
    setResetting(true);
    try {
      await Promise.all([resetLevel(), deleteExerciseHistory()]);
      await refreshUser();
      const data = await getStats();
      setStats(data);
      setShowResetModal(false);
      setSuccess('Niveau et historique des exercices réinitialisés avec succès !');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la réinitialisation.');
      setShowResetModal(false);
    } finally {
      setResetting(false);
    }
  };

  const levelConfig = {
    'débutant': { gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Zap, pct: 33 },
    'intermédiaire': { gradient: 'from-amber-500 to-orange-400', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: Flame, pct: 66 },
    'avancé': { gradient: 'from-rose-500 to-pink-400', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', icon: Award, pct: 100 },
  };



  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) {
      setSupportError("Veuillez remplir tous les champs.");
      return;
    }
    setSendingSupport(true);
    setSupportError("");
    setSupportSuccess("");
    try {
      await sendContactMessage({
        name: user?.username || user?.email || "Utilisateur",
        email: user?.email || "",
        subject: "[Support] " + supportSubject,
        message: supportMessage,
      });
      setSupportSuccess("Votre message a bien été envoyé. Notre équipe vous répondra par email.");
      setSupportSubject("");
      setSupportMessage("");
    } catch (err) {
      setSupportError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSendingSupport(false);
    }
  };

  const currentLevel = levelConfig[user?.level] || levelConfig['débutant'];
  const LevelIcon = currentLevel.icon;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const initials = (user?.username || 'U').slice(0, 2).toUpperCase();


  const avatarSrc = avatarPreview
    || (user?.profilePicture ? `${AVATAR_BASE_URL}${user.profilePicture}` : null);

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Navbar />

      <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 w-full">

        {}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {}
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}
              onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="w-20 h-20 rounded-3xl object-cover shadow-2xl shadow-indigo-500/20 border-2 border-gray-800 group-hover:border-indigo-500/50 transition-all duration-300"
                />
              ) : (
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${currentLevel.gradient} flex items-center justify-center shadow-2xl shadow-indigo-500/20 text-white text-2xl font-bold border-2 border-transparent group-hover:border-indigo-500/50 transition-all duration-300`}>
                  {initials}
                </div>
              )}
              {}
              <div className="absolute inset-0 rounded-3xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
              {}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gray-950 border-2 border-gray-800 flex items-center justify-center">
                <LevelIcon className={`w-3.5 h-3.5 ${currentLevel.text}`} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
              <p className="text-gray-400 text-sm mt-0.5">Gérez vos informations personnelles et vos préférences</p>
              {avatarSrc && !avatarPreview && user?.profilePicture && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteAvatar(); }}
                  className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Supprimer la photo
                </button>
              )}
            </div>
          </div>
        </div>

        {}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {}
          <div className="space-y-6">

            {}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
              <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-500/15 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Compte</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Nom d'utilisateur</p>
                      <p className="text-sm text-white font-medium">{user?.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-white font-medium">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Membre depuis</p>
                      <p className="text-sm text-white font-medium">{memberSince}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Level card — hidden for admins */}
            {user?.role !== 'ADMIN' && <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentLevel.gradient} flex items-center justify-center shadow-lg`}>
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Niveau actuel</p>
                  <p className={`text-lg font-bold capitalize ${currentLevel.text}`}>{user?.level || 'débutant'}</p>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${currentLevel.gradient} transition-all duration-1000`}
                  style={{ width: `${currentLevel.pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {currentLevel.pct < 100 ? 'Continuez à progresser pour atteindre le niveau suivant !' : 'Niveau maximum atteint — Bravo ! 🎉'}
              </p>
              <button
                onClick={() => setShowResetModal(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800/60 border border-gray-700/40 rounded-xl text-gray-400 text-xs font-medium hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Réinitialiser le niveau
              </button>
            </div>

            }
            {/* Quick stats card — hidden for admins */}
            {user?.role !== 'ADMIN' && stats && (
              <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Statistiques</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/40 rounded-xl p-3 text-center">
                    <Target className="w-5 h-5 text-indigo-400 mx-auto mb-1.5" />
                    <p className="text-xl font-bold text-white">{stats.total_quizzes}</p>
                    <p className="text-[10px] text-gray-500">Quiz passés</p>
                  </div>
                  <div className="bg-gray-800/40 rounded-xl p-3 text-center">
                    <Award className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                    <p className="text-xl font-bold text-white">{stats.average_score}%</p>
                    <p className="text-[10px] text-gray-500">Score moyen</p>
                  </div>
                  <div className="bg-gray-800/40 rounded-xl p-3 text-center">
                    <BookOpen className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                    <p className="text-xl font-bold text-white">{stats.topics_mastered}</p>
                    <p className="text-[10px] text-gray-500">Sujets maîtrisés</p>
                  </div>
                  <div className="bg-gray-800/40 rounded-xl p-3 text-center">
                    <MessageSquare className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
                    <p className="text-xl font-bold text-white">{stats.total_messages}</p>
                    <p className="text-[10px] text-gray-500">Messages</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== RIGHT COLUMN — Forms ===== */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Edit info form ── */}

            <form onSubmit={handleUpdateInfo} className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-indigo-500/15 rounded-xl flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Informations personnelles</h3>
                    <p className="text-xs text-gray-500">Modifiez votre nom d'utilisateur et votre email</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom d'utilisateur</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); clearMessages(); }}
                        className="w-full pl-11 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all text-sm"
                        placeholder="Votre nom d'utilisateur"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Adresse email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                        className="w-full pl-11 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 outline-none transition-all text-sm"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>

            {/* ── Change password form ── */}
            <form onSubmit={handleUpdatePassword} className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Changer le mot de passe</h3>
                    <p className="text-xs text-gray-500">Sécurisez votre compte avec un nouveau mot de passe</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Current password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe actuel</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => { setCurrentPassword(e.target.value); clearMessages(); }}
                        className="w-full pl-11 pr-12 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all text-sm"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nouveau mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); clearMessages(); }}
                        className="w-full pl-11 pr-12 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all text-sm"
                        placeholder="Minimum 6 caractères"
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPassword && newPassword.length < 6 && (
                      <p className="text-xs text-amber-400 mt-1.5">⚠ Minimum 6 caractères</p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); clearMessages(); }}
                        className="w-full pl-11 pr-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 outline-none transition-all text-sm"
                        placeholder="Retapez le nouveau mot de passe"
                      />
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-400 mt-1.5">✕ Les mots de passe ne correspondent pas</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 6 && (
                      <p className="text-xs text-emerald-400 mt-1.5">✓ Les mots de passe correspondent</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPw || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100"
                >
                  {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {savingPw ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </div>
            </form>

            {/* ── Support section — utilisateurs uniquement ── */}
            {user?.role !== 'ADMIN' && <div className="bg-gray-900/60 backdrop-blur-sm border border-cyan-500/20 rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <div className="h-1 bg-gradient-to-r from-cyan-500 to-sky-500" />
              <div className="p-8">
                {/* Header — clickable to toggle */}
                <button
                  type="button"
                  onClick={() => { setSupportExpanded(v => !v); setSupportSuccess(''); setSupportError(''); }}
                  className="w-full flex items-center justify-between gap-3 mb-2 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center">
                      <LifeBuoy className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white">Support</h3>
                      <p className="text-xs text-gray-500">Contactez notre équipe pour toute aide</p>
                    </div>
                  </div>
                  {supportExpanded
                    ? <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />
                    : <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-200 transition-colors" />
                  }
                </button>

                {supportExpanded && (
                  <form onSubmit={handleSupportSubmit} className="mt-6 space-y-4">

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sujet</label>
                      <input
                        type="text"
                        value={supportSubject}
                        onChange={(e) => { setSupportSubject(e.target.value); setSupportError(''); setSupportSuccess(''); }}
                        placeholder="Ex : Problème de connexion, question sur un cours…"
                        className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white text-sm placeholder-gray-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                      <textarea
                        value={supportMessage}
                        onChange={(e) => { setSupportMessage(e.target.value); setSupportError(''); setSupportSuccess(''); }}
                        placeholder="Décrivez votre problème ou votre question en détail…"
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white text-sm placeholder-gray-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Feedback */}
                    {supportSuccess && (
                      <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {supportSuccess}
                      </div>
                    )}
                    {supportError && (
                      <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {supportError}
                      </div>
                    )}

                    {/* Info email */}
                    <p className="text-xs text-gray-500">
                      La réponse sera envoyée à <span className="text-cyan-400 font-medium">{user?.email}</span>
                    </p>

                    <button
                      type="submit"
                      disabled={sendingSupport || !supportSubject.trim() || !supportMessage.trim()}
                      className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-xl text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100"
                    >
                      {sendingSupport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {sendingSupport ? 'Envoi en cours…' : 'Envoyer le message'}
                    </button>
                  </form>
                )}
              </div>
            </div>}

            {/* ── Danger zone ── */}
            <div className="bg-gray-900/60 backdrop-blur-sm border border-red-500/15 rounded-2xl p-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Zone de danger</h3>
                  <p className="text-xs text-gray-500">Actions irréversibles sur votre compte</p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/20 hover:border-red-500/50 active:scale-95 transition-all"
                >
                  Se déconnecter de tous les appareils
                </button>
                <button
                  onClick={() => { setShowDeleteModal(true); setDeletePassword(''); setDeleteError(''); }}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600/10 border border-red-600/30 rounded-xl text-red-500 text-sm font-medium hover:bg-red-600/25 hover:border-red-600/50 active:scale-95 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer mon compte
                </button>
              </div>
            </div>

            {/* ── Delete Account Modal ── */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                {/* Modal */}
                <div className="relative w-full max-w-md bg-gray-900 border border-red-500/25 rounded-2xl shadow-2xl shadow-red-500/10 overflow-hidden animate-scale-in">
                  <div className="h-1 bg-gradient-to-r from-red-500 to-rose-600" />
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-500/15 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Supprimer le compte</h3>
                        <p className="text-xs text-gray-500">Cette action est définitive</p>
                      </div>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                      <p className="text-sm text-red-300">
                        <strong>Attention :</strong> Toutes vos données seront supprimées de façon permanente — conversations, quiz, progression et photo de profil. Cette action est irréversible.
                      </p>
                    </div>

                    <label className="block text-sm text-gray-400 mb-2">Confirmez avec votre mot de passe</label>
                    <div className="relative mb-4">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Votre mot de passe"
                        className="w-full pl-11 pr-4 py-3 bg-gray-800/60 border border-gray-700/60 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/50 transition-all"
                        autoFocus
                      />
                    </div>

                    {deleteError && (
                      <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {deleteError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 px-5 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-gray-300 text-sm font-medium hover:bg-gray-800 transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={async () => {
                          if (!deletePassword) {
                            setDeleteError('Veuillez entrer votre mot de passe.');
                            return;
                          }
                          setDeleting(true);
                          setDeleteError('');
                          try {
                            await deleteAccount(deletePassword);
                            logout();
                            navigate('/');
                          } catch (err) {
                            setDeleteError(err.response?.data?.detail || 'Erreur lors de la suppression du compte.');
                          } finally {
                            setDeleting(false);
                          }
                        }}
                        disabled={deleting || !deletePassword}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-600 rounded-xl text-white text-sm font-semibold hover:bg-red-700 active:scale-95 transition-all disabled:opacity-40 disabled:hover:bg-red-600"
                      >
                        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {deleting ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Reset Level Modal ── */}
            {showResetModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !resetting && setShowResetModal(false)} />
                {/* Modal */}
                <div className="relative w-full max-w-md bg-gray-900 border border-amber-500/25 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden animate-scale-in">
                  <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center">
                        <RotateCcw className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Réinitialiser le niveau</h3>
                        <p className="text-xs text-gray-500">Repartir de zéro</p>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                      <p className="text-sm text-amber-300">
                        <strong>Attention :</strong> Cette action va réinitialiser votre niveau à <strong>Débutant</strong> et supprimer toute votre progression :
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-amber-300/80">
                        <li>• Historique des quiz</li>
                        <li>• Scores de maîtrise par sujet</li>
                        <li>• Niveau actuel</li>
                        <li>• Historique des exercices</li>
                      </ul>
                      <p className="mt-2 text-sm text-amber-300/60">
                        Vos conversations et votre compte resteront intacts.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowResetModal(false)}
                        disabled={resetting}
                        className="flex-1 px-5 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-gray-300 text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleResetLevel}
                        disabled={resetting}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        {resetting ? 'Réinitialisation...' : 'Réinitialiser'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default ProfilePage;