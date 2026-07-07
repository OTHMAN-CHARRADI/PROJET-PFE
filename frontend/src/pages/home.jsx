import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import { getStats, getProgress } from '../service/Api';
import {
  getAdminStats, getAdminUsers, updateUserRole, deleteUser,
  getAllCourses, createCourse, updateCourse, deleteCourse,
  getAllSections, createSection, updateSection, deleteSection,
  getAllVideos, createVideo, deleteVideo, uploadVideoFile, uploadThumbnail,
} from '../service/Api';
import {
  MessageSquare, Target, Dumbbell, BarChart3, Zap, ArrowRight,
  BookOpen, Trophy, Flame, TrendingUp, Star, GraduationCap,
  Shield, Users, Layers, Video, Plus, Search, Trash2, Edit3,
  ChevronDown, AlertTriangle, X, Loader2, Eye, ArrowUpRight,
  Crown, UserCircle, Check, Upload, Link2, AlertCircle,
  CheckCircle2, Play, Home as HomeIcon, ImagePlus,
} from 'lucide-react';


class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('[AdminDashboard Error]', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Erreur d'affichage</h3>
          <p className="text-gray-500 text-sm mb-4 max-w-sm">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm hover:bg-indigo-600 transition-colors">
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ================================================================
   HELPERS
   ================================================================ */
const safeArr = (v) => Array.isArray(v) ? v : (v?.content || v?.data || []);

const getYoutubeEmbed = (url, autoplay = false) => {
  if (!url) return '';
  const m1 = url.match(/youtu\.be\/([^?&]+)/);
  if (m1) return `https://www.youtube.com/embed/${m1[1]}${autoplay ? '?autoplay=1' : ''}`;
  const m2 = url.match(/[?&]v=([^&]+)/);
  if (m2) return `https://www.youtube.com/embed/${m2[1]}${autoplay ? '?autoplay=1' : ''}`;
  return url;
};

const isLocalVideo = (url) => url && url.startsWith('/uploads');
const getLocalSrc = (url) => url ? `http://localhost:8080${url}` : '';

/* ================================================================
   SMALL SUB-COMPONENTS
   ================================================================ */
const StatCard = ({ icon: Icon, label, value, gradient, delay }) => (
  <div className="glass-card rounded-2xl p-5 hover:scale-[1.03] transition-all duration-300 animate-fade-in group"
    style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center justify-between mb-3">
      <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
    </div>
    <p className="text-2xl font-extrabold text-white">{value ?? '—'}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
  </div>
);

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, danger }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? 'bg-red-500/15' : 'bg-indigo-500/15'}`}>
            <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-indigo-400'}`} />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all">Annuler</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-all ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}>Confirmer</button>
        </div>
      </div>
    </div>
  );
};

const FormModal = ({ open, title, fields, values, onChange, onSubmit, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto custom-scroll">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/50 transition-all"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea value={values[field.name] || ''} onChange={e => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder} rows={3}
                  className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm resize-none" />
              ) : field.type === 'select' ? (
                <div className="relative">
                  <select value={values[field.name] || ''} onChange={e => {
                    onChange(field.name, e.target.value);
                    if (field.resets) field.resets.forEach(f => onChange(f, ''));
                  }}
                    className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm appearance-none">
                    <option value="">{field.placeholder || 'Sélectionner...'}</option>
                    {(field.getOptions ? field.getOptions(values) : field.options)?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              ) : field.type === 'videoselect' ? (
                <div className="space-y-2">
                  {field.localVideos && field.localVideos.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">Choisir une vidéo importée :</p>
                      <div className="max-h-36 overflow-y-auto custom-scroll space-y-1 mb-2">
                        {field.localVideos.map(v => (
                          <button key={v.id} type="button" onClick={() => onChange(field.name, v.youtubeUrl)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm ${values[field.name] === v.youtubeUrl ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-300' : 'bg-gray-800/40 hover:bg-gray-700/40 text-gray-300'}`}>
                            <Video className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            <span className="truncate flex-1">{v.title}</span>
                            {values[field.name] === v.youtubeUrl && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-px bg-gray-800" /><span className="text-xs text-gray-600">ou saisir manuellement</span><div className="flex-1 h-px bg-gray-800" />
                      </div>
                    </div>
                  )}
                  <input type="text" value={values[field.name] || ''} onChange={e => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm" />
                </div>
              ) : field.type === 'thumbnail' ? (
                <div className="space-y-3">
                  {/* Preview */}
                  {values[field.name] && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-700/50 bg-gray-800/40">
                      <img src={values[field.name].startsWith('/') ? `http://localhost:8080${values[field.name]}` : values[field.name]} alt="Miniature" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => onChange(field.name, '')}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-gray-300 hover:text-red-400 hover:bg-red-500/20 transition-all backdrop-blur-sm">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {/* Upload button */}
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/60 border border-dashed border-gray-600/60 rounded-xl text-sm text-gray-400 hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all cursor-pointer">
                      <ImagePlus className="w-4 h-4" />
                      <span>Importer une image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const result = await uploadThumbnail(file);
                          onChange(field.name, result.url);
                        } catch (err) {
                          console.error('Thumbnail upload error:', err);
                        }
                        e.target.value = '';
                      }} />
                    </label>
                  </div>
                  {/* Or enter URL */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-800" /><span className="text-xs text-gray-600">ou saisir une URL</span><div className="flex-1 h-px bg-gray-800" />
                  </div>
                  <input type="text" value={values[field.name] || ''} onChange={e => onChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm" />
                </div>
              ) : (
                <input type={field.type || 'text'} value={values[field.name] || ''} onChange={e => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm" />
              )}
            </div>
          ))}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all">Annuler</button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ================================================================
   VIDEO PLAYER MODAL
   ================================================================ */
const VideoPlayerModal = ({ video, onClose }) => {
  if (!video) return null;
  const local = isLocalVideo(video.src);
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-4xl mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-white font-bold truncate flex-1 mr-4">{video.title}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-800/80 flex items-center justify-center text-gray-400 hover:text-white transition-all flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden bg-black shadow-2xl border border-gray-800/60">
          {local ? (
            <video src={getLocalSrc(video.src)} controls autoPlay className="w-full" style={{ maxHeight: '75vh', aspectRatio: '16/9' }}>
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          ) : (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe src={getYoutubeEmbed(video.src, true)} title={video.title}
                className="absolute inset-0 w-full h-full" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   IMPORT MODAL
   ================================================================ */
const ImportModal = ({ onClose, courses, sections, videos, onImported }) => {
  const [tab, setTab] = useState('url');
  const [importText, setImportText] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [pcFiles, setPcFiles] = useState([]);
  const [pcLoading, setPcLoading] = useState(false);
  const [pcResults, setPcResults] = useState(null);
  const [pcCourseId, setPcCourseId] = useState('');
  const [pcSectionId, setPcSectionId] = useState('');

  const handleImportUrls = async () => {
    setImportLoading(true); setImportResults(null);
    const lines = importText.split('\n').map(l => l.trim()).filter(Boolean);
    const results = { success: [], failed: [] };
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      const youtubeUrl = parts[0] || '';
      const title = parts[1] || youtubeUrl;
      const description = parts[2] || '';
      const courseId = parts[3] ? parseInt(parts[3]) : null;
      const sectionId = parts[4] ? parseInt(parts[4]) : null;
      if (!youtubeUrl) { results.failed.push({ line, reason: 'URL manquante' }); continue; }
      try {
        await createVideo({ title, description, youtubeUrl, courseId, sectionId });
        results.success.push(title || youtubeUrl);
      } catch (e) {
        results.failed.push({ line: title || youtubeUrl, reason: e?.message || 'Erreur' });
      }
    }
    await onImported();
    setImportResults(results);
    setImportLoading(false);
    if (results.failed.length === 0) setTimeout(() => { onClose(); }, 2000);
  };

  const handlePcUpload = async () => {
    if (!pcFiles.length) return;
    setPcLoading(true); setPcResults(null);
    const results = { success: [], failed: [] };
    for (const file of pcFiles) {
      try {
        await uploadVideoFile(file, { courseId: pcCourseId ? parseInt(pcCourseId) : null, sectionId: pcSectionId ? parseInt(pcSectionId) : null });
        results.success.push(file.name);
      } catch (e) {
        results.failed.push({ name: file.name, reason: e?.response?.data?.detail || e?.message || 'Erreur' });
      }
    }
    await onImported();
    setPcResults(results);
    setPcLoading(false);
    if (results.failed.length === 0) setTimeout(() => { onClose(); }, 2000);
  };

  const lineCount = importText.split('\n').filter(l => l.trim()).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[85vh] overflow-y-auto custom-scroll">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/15 rounded-xl flex items-center justify-center"><Upload className="w-5 h-5 text-indigo-400" /></div>
            <div>
              <h3 className="text-lg font-bold text-white">Importer des vidéos</h3>
              <p className="text-xs text-gray-500">URL YouTube ou fichier local</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/50 transition-all"><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-900/60 rounded-xl mb-5">
          <button onClick={() => setTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'url' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' : 'text-gray-500 hover:text-gray-300'}`}>
            <Link2 className="w-4 h-4" /> URL YouTube
          </button>
          <button onClick={() => setTab('pc')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'pc' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' : 'text-gray-500 hover:text-gray-300'}`}>
            <Upload className="w-4 h-4" /> Depuis mon PC
          </button>
        </div>

        {tab === 'url' ? (
          <div className="space-y-4">
            <div className="p-3 bg-gray-800/40 border border-gray-700/40 rounded-xl">
              <p className="text-xs text-gray-400 font-semibold mb-1 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5 text-indigo-400" /> Format :</p>
              <code className="text-xs text-indigo-300 font-mono">URL_YouTube | Titre | Description | ID_Cours | ID_Section</code>
              <p className="text-xs text-gray-600 mt-1">Seule l'URL est obligatoire.</p>
              {courses.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700/40">
                  <p className="text-xs text-gray-500 mb-1">Cours :</p>
                  <div className="flex flex-wrap gap-1">
                    {courses.map(c => <span key={c.id} className="px-2 py-0.5 bg-gray-700/40 text-gray-400 text-[10px] rounded-full font-mono">ID:{c.id} → {c.title}</span>)}
                  </div>
                </div>
              )}
            </div>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={8}
              placeholder={"https://youtube.com/watch?v=abc123 | Python intro | Leçon 1 | 1\nhttps://youtu.be/xyz | Les boucles | | 1 | 2"}
              className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 transition-all text-sm resize-none font-mono" />
            {importResults && (
              <div className="space-y-2 animate-fade-in">
                {importResults.success.length > 0 && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2 mb-1"><CheckCircle2 className="w-4 h-4" /> {importResults.success.length} importée(s)</p>
                    {importResults.success.map((t, i) => <p key={i} className="text-xs text-emerald-600 truncate">✓ {t}</p>)}
                  </div>
                )}
                {importResults.failed.length > 0 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4" /> {importResults.failed.length} échec(s)</p>
                    {importResults.failed.map((f, i) => <p key={i} className="text-xs text-red-600 truncate">✗ {f.line} — {f.reason}</p>)}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all">Annuler</button>
              <button onClick={handleImportUrls} disabled={importLoading || !importText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100">
                {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {importLoading ? 'Import...' : `Importer (${lineCount})`}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${pcFiles.length ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-gray-700/60 hover:border-indigo-500/30 hover:bg-gray-800/30'}`}>
                <Upload className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-300 mb-1">
                  {pcFiles.length ? `${pcFiles.length} fichier(s) sélectionné(s)` : 'Cliquez ou glissez vos vidéos ici'}
                </p>
                <p className="text-xs text-gray-600">MP4, MKV, AVI, MOV, WEBM — max 500 MB</p>
                <input type="file" multiple accept="video/*" className="hidden"
                  onChange={e => { setPcFiles(Array.from(e.target.files)); setPcResults(null); }} />
              </div>
            </label>
            {pcFiles.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scroll">
                {pcFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-800/40 rounded-lg">
                    <Video className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm text-gray-300 flex-1 truncate">{f.name}</span>
                    <span className="text-xs text-gray-600">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cours (optionnel)</label>
                <select value={pcCourseId} onChange={e => setPcCourseId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white text-sm outline-none focus:border-indigo-500/40 transition-all appearance-none">
                  <option value="">— Aucun —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Section (optionnel)</label>
                <select value={pcSectionId} onChange={e => setPcSectionId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white text-sm outline-none focus:border-indigo-500/40 transition-all appearance-none">
                  <option value="">— Aucune —</option>
                  {sections.filter(s => !pcCourseId || s.courseId === parseInt(pcCourseId)).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
            </div>
            {pcResults && (
              <div className="space-y-2 animate-fade-in">
                {pcResults.success.length > 0 && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {pcResults.success.length} uploadée(s)</p>
                  </div>
                )}
                {pcResults.failed.length > 0 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4" /> {pcResults.failed.length} échec(s)</p>
                    {pcResults.failed.map((f, i) => <p key={i} className="text-xs text-red-600">✗ {f.name} — {f.reason}</p>)}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all">Annuler</button>
              <button onClick={handlePcUpload} disabled={pcLoading || !pcFiles.length}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100">
                {pcLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {pcLoading ? 'Upload...' : `Uploader (${pcFiles.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const TABS = [
  { id: 'overview', label: "Vue d'ensemble", icon: BarChart3 },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'courses', label: 'Cours', icon: BookOpen },
  { id: 'sections', label: 'Sections', icon: Layers },
  { id: 'videos', label: 'Vidéos', icon: Video },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [videos, setVideos] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [searchSection, setSearchSection] = useState('');
  const [searchVideo, setSearchVideo] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [formModal, setFormModal] = useState({ open: false });
  const [formValues, setFormValues] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [playVideo, setPlayVideo] = useState(null);
  const formValuesRef = useRef({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try { const c = await getAllCourses(); setCourses(safeArr(c)); } catch { }
    try { const s = await getAllSections(); setSections(safeArr(s)); } catch { }
    try { const v = await getAllVideos(); setVideos(safeArr(v)); } catch { }
    try { const s = await getAdminStats(); setStats(s); } catch { }
    try { const u = await getAdminUsers(); setUsers(safeArr(u)); } catch { }
    setLoading(false);
  };

  const refreshAll = async () => {
    const [c, s, v, st, u] = await Promise.all([getAllCourses(), getAllSections(), getAllVideos(), getAdminStats(), getAdminUsers()]);
    setCourses(safeArr(c)); setSections(safeArr(s)); setVideos(safeArr(v)); setStats(st); setUsers(safeArr(u));
  };


  const handleRoleToggle = (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setConfirmModal({
      open: true, title: 'Changer le rôle', danger: false,
      message: `Changer le rôle en ${newRole} ?`,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try { await updateUserRole(userId, newRole); setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u)); } catch { }
      },
    });
  };

  const handleDeleteUser = (userId, username) => {
    setConfirmModal({
      open: true, title: "Supprimer l'utilisateur", danger: true,
      message: `Supprimer "${username}" ? Action irréversible.`,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try { await deleteUser(userId); await refreshAll(); } catch { }
      },
    });
  };


  const openCourseForm = (course = null) => {
    const init = course ? { title: course.title, description: course.description } : {};
    setFormValues(init); formValuesRef.current = init;
    setFormModal({
      open: true, title: course ? 'Modifier le cours' : 'Nouveau cours',
      fields: [
        { name: 'title', label: 'Titre', placeholder: 'Ex: Introduction au Python' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Description...' },
      ],
      onSubmit: async () => {
        setFormLoading(true);
        try {
          if (course) await updateCourse(course.id, formValuesRef.current);
          else await createCourse(formValuesRef.current);
          await refreshAll(); setFormModal({ open: false });
        } catch { } finally { setFormLoading(false); }
      },
    });
  };

  const handleDeleteCourse = (id, title) => {
    setConfirmModal({
      open: true, title: 'Supprimer le cours', danger: true,
      message: `Supprimer "${title}" ?`,
      onConfirm: async () => { setConfirmModal({ open: false }); try { await deleteCourse(id); await refreshAll(); } catch { } },
    });
  };


  const openSectionForm = (section = null) => {
    const init = section
      ? { title: section.title, content: section.content || '', summary: section.summary || '', videoUrl: section.videoUrl || '', courseId: section.courseId?.toString() || '' }
      : {};
    setFormValues(init); formValuesRef.current = init;
    setFormModal({
      open: true, title: section ? 'Modifier la section' : 'Nouvelle section',
      fields: [
        { name: 'courseId', label: 'Cours', type: 'select', placeholder: 'Sélectionner un cours', options: courses.map(c => ({ value: c.id.toString(), label: c.title })) },
        { name: 'title', label: 'Titre', placeholder: 'Ex: Variables et Types' },
        { name: 'content', label: 'Contenu', type: 'textarea', placeholder: 'Contenu...' },
        { name: 'summary', label: 'Résumé', type: 'textarea', placeholder: 'Résumé...' },
        { name: 'videoUrl', label: 'URL vidéo', type: 'videoselect', placeholder: 'https://...', localVideos: videos.filter(v => isLocalVideo(v.youtubeUrl)) },
      ],
      onSubmit: async () => {
        setFormLoading(true);
        try {
          const payload = { ...formValuesRef.current, courseId: parseInt(formValuesRef.current.courseId) };
          if (section) await updateSection(section.id, payload);
          else await createSection(payload);
          await refreshAll(); setFormModal({ open: false });
        } catch { } finally { setFormLoading(false); }
      },
    });
  };

  const handleDeleteSection = (id, title) => {
    setConfirmModal({
      open: true, title: 'Supprimer la section', danger: true,
      message: `Supprimer "${title}" ?`,
      onConfirm: async () => { setConfirmModal({ open: false }); try { await deleteSection(id); await refreshAll(); } catch { } },
    });
  };


  const openVideoForm = () => {
    setFormValues({}); formValuesRef.current = {};
    setFormModal({
      open: true, title: 'Nouvelle vidéo',
      fields: [
        { name: 'courseId', label: 'Cours', type: 'select', placeholder: 'Sélectionner un cours', options: courses.map(c => ({ value: c.id.toString(), label: c.title })), resets: ['sectionId'] },
        { name: 'sectionId', label: 'Section', type: 'select', placeholder: 'Sélectionner une section', getOptions: (vals) => sections.filter(s => vals.courseId && s.courseId === parseInt(vals.courseId)).map(s => ({ value: s.id.toString(), label: s.title })) },
        { name: 'title', label: 'Titre', placeholder: 'Ex: Introduction aux listes' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Description...' },
        { name: 'youtubeUrl', label: 'URL YouTube', placeholder: 'https://youtube.com/watch?v=...' },
        { name: 'thumbnailUrl', label: 'Miniature', type: 'thumbnail', placeholder: 'https://...' },
      ],
      onSubmit: async () => {
        setFormLoading(true);
        try {
          const fv = formValuesRef.current;
          await createVideo({ ...fv, courseId: fv.courseId ? parseInt(fv.courseId) : null, sectionId: fv.sectionId ? parseInt(fv.sectionId) : null });
          await refreshAll(); setFormModal({ open: false });
        } catch { } finally { setFormLoading(false); }
      },
    });
  };

  const handleDeleteVideo = (id, title) => {
    setConfirmModal({
      open: true, title: 'Supprimer la vidéo', danger: true,
      message: `Supprimer "${title}" ?`,
      onConfirm: async () => { setConfirmModal({ open: false }); try { await deleteVideo(id); await refreshAll(); } catch { } },
    });
  };


  const filteredUsers = users.filter(u => u.username?.toLowerCase().includes(searchUser.toLowerCase()) || u.email?.toLowerCase().includes(searchUser.toLowerCase()));
  const filteredCourses = courses.filter(c => c.title?.toLowerCase().includes(searchCourse.toLowerCase()));
  const filteredSections = sections.filter(s => s.title?.toLowerCase().includes(searchSection.toLowerCase()));
  const filteredVideos = videos.filter(v => v.title?.toLowerCase().includes(searchVideo.toLowerCase()));

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {}
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Administration</h1>
          <p className="text-sm text-gray-500">Gérer la plateforme d'apprentissage</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 glass-card rounded-2xl w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
            <StatCard icon={Users} label="Utilisateurs" value={stats?.totalUsers} gradient="from-blue-500 to-cyan-500" delay={0} />
            <StatCard icon={BookOpen} label="Cours" value={stats?.totalCourses} gradient="from-indigo-500 to-purple-500" delay={50} />
            <StatCard icon={Layers} label="Sections" value={stats?.totalSections} gradient="from-emerald-500 to-teal-500" delay={100} />
            <StatCard icon={Video} label="Vidéos" value={stats?.totalVideos} gradient="from-amber-500 to-orange-500" delay={150} />
            <StatCard icon={Target} label="Quiz" value={stats?.totalQuizzes} gradient="from-rose-500 to-pink-500" delay={200} />
            <StatCard icon={MessageSquare} label="Messages" value={stats?.totalMessages} gradient="from-violet-500 to-fuchsia-500" delay={250} />
            <StatCard icon={Dumbbell} label="Exercices" value={stats?.totalExercises} gradient="from-cyan-500 to-blue-500" delay={300} />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" /> Derniers utilisateurs</h3>
                <button onClick={() => setActiveTab('users')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">Voir tout <Eye className="w-3 h-3" /></button>
              </div>
              <div className="space-y-2">
                {users.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/30 transition-all">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center"><UserCircle className="w-4 h-4 text-indigo-400" /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{u.username}</p><p className="text-xs text-gray-600 truncate">{u.email}</p></div>
                    {u.role === 'ADMIN' && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20">ADMIN</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-400" /> Cours récents</h3>
                <button onClick={() => setActiveTab('courses')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">Voir tout <Eye className="w-3 h-3" /></button>
              </div>
              <div className="space-y-2">
                {courses.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/30 transition-all">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center"><BookOpen className="w-4 h-4 text-emerald-400" /></div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white truncate">{c.title}</p><p className="text-xs text-gray-600 truncate">{c.description || 'Aucune description'}</p></div>
                  </div>
                ))}
                {courses.length === 0 && <p className="text-sm text-gray-600 text-center py-4">Aucun cours créé</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={searchUser} onChange={e => setSearchUser(e.target.value)} placeholder="Rechercher un utilisateur..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 text-sm" />
            </div>
            <span className="text-sm text-gray-500">{filteredUsers.length} utilisateur(s)</span>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/60">
                    {['Utilisateur', 'Email', 'Rôle', 'Niveau', 'Inscrit le', 'Actions'].map((h, i) => (
                      <th key={h} className={`text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4 ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center"><UserCircle className="w-5 h-5 text-indigo-400" /></div>
                          <span className="text-sm font-medium text-white">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-gray-800/50 text-gray-400 border-gray-700/50'}`}>
                          {u.role === 'ADMIN' ? '👑 Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400 capitalize">{u.level || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => handleRoleToggle(u.id, u.role)} className="p-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Changer rôle"><Crown className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteUser(u.id, u.username)} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && <div className="text-center py-12"><Users className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="text-gray-500">Aucun utilisateur trouvé</p></div>}
          </div>
        </div>
      )}

      {/* ── COURSES ── */}
      {activeTab === 'courses' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={searchCourse} onChange={e => setSearchCourse(e.target.value)} placeholder="Rechercher un cours..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 text-sm" />
            </div>
            <button onClick={() => openCourseForm()} className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-4 h-4" /> Nouveau cours
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map(c => (
              <div key={c.id} className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><BookOpen className="w-5 h-5 text-white" /></div>
                  <div className="flex gap-1">
                    <button onClick={() => openCourseForm(c)} className="p-1.5 rounded-lg text-gray-600 opacity-0 group-hover:opacity-100 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteCourse(c.id, c.title)} className="p-1.5 rounded-lg text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-1 line-clamp-1">{c.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{c.description || 'Aucune description'}</p>
                <div className="mt-3 pt-3 border-t border-gray-800/40 text-xs text-gray-600">ID: {c.id}</div>
              </div>
            ))}
            {filteredCourses.length === 0 && <div className="col-span-full text-center py-12"><BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="text-gray-500">Aucun cours trouvé</p></div>}
          </div>
        </div>
      )}

      {/* ── SECTIONS ── */}
      {activeTab === 'sections' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={searchSection} onChange={e => setSearchSection(e.target.value)} placeholder="Rechercher une section..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 text-sm" />
            </div>
            <button onClick={() => openSectionForm()} className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-4 h-4" /> Nouvelle section
            </button>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/60">
                    {['Section', 'Cours', 'Vidéo', 'Actions'].map((h, i) => (
                      <th key={h} className={`text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4 ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {filteredSections.map(s => (
                    <tr key={s.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center"><Layers className="w-4 h-4 text-emerald-400" /></div>
                          <div><p className="text-sm font-medium text-white">{s.title}</p><p className="text-xs text-gray-600 line-clamp-1 max-w-xs">{s.summary || s.content || '—'}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">{courses.find(c => c.id === s.courseId)?.title || `Cours #${s.courseId}`}</td>
                      <td className="px-5 py-4 text-sm">{s.videoUrl ? <span className="text-emerald-400 text-xs">✓ Oui</span> : <span className="text-gray-600 text-xs">—</span>}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button onClick={() => openSectionForm(s)} className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteSection(s.id, s.title)} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredSections.length === 0 && <div className="text-center py-12"><Layers className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="text-gray-500">Aucune section trouvée</p></div>}
          </div>
        </div>
      )}

      {/* ── VIDEOS ── */}
      {activeTab === 'videos' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={searchVideo} onChange={e => setSearchVideo(e.target.value)} placeholder="Rechercher une vidéo..."
                className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 text-sm" />
            </div>
            <button onClick={() => openVideoForm()} className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-4 h-4" /> Nouvelle vidéo
            </button>
            <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:border-gray-600 transition-all">
              <Upload className="w-4 h-4" /> Importer
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map(v => {
              const local = isLocalVideo(v.youtubeUrl);
              const localSrc = local ? getLocalSrc(v.youtubeUrl) : null;
              let ytThumb = v.thumbnailUrl;
              if (!ytThumb && !local && v.youtubeUrl) {
                const m = v.youtubeUrl.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
                if (m) ytThumb = `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg`;
              }
              return (
                <div key={v.id} className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 group">
                  <div className="relative h-36 bg-gray-800/40 overflow-hidden cursor-pointer"
                    onClick={() => setPlayVideo({ title: v.title, src: local ? v.youtubeUrl : (v.youtubeUrl || ''), isLocal: local })}>
                    {local ? (
                      <video src={localSrc} className="w-full h-full object-cover" preload="metadata" muted
                        onLoadedMetadata={e => { try { e.target.currentTime = 1; } catch (_) { } }} />
                    ) : ytThumb ? (
                      <img src={ytThumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Video className="w-10 h-10 text-gray-700" /></div>
                    )}
                    <div className="absolute top-2 left-2">
                      {local
                        ? <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] text-emerald-400 font-medium rounded border border-emerald-500/20">💾 Local</span>
                        : <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] text-red-400 font-medium rounded border border-red-500/20">▶ YouTube</span>
                      }
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 border border-white/30">
                        <Play className="w-5 h-5 text-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <button onClick={e => { e.stopPropagation(); handleDeleteVideo(v.id, v.title); }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/50 text-gray-300 hover:text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">{v.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{v.description || 'Aucune description'}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-600">
                      {v.courseId && <span>Cours #{v.courseId}</span>}
                      {v.sectionId && <span>• Section #{v.sectionId}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredVideos.length === 0 && <div className="col-span-full text-center py-12"><Video className="w-10 h-10 text-gray-700 mx-auto mb-3" /><p className="text-gray-500">Aucune vidéo trouvée</p></div>}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal({ open: false })} />
      <FormModal
        open={formModal.open} title={formModal.title} fields={formModal.fields || []}
        values={formValues}
        onChange={(name, value) => { setFormValues(prev => { const next = { ...prev, [name]: value }; formValuesRef.current = next; return next; }); }}
        onSubmit={formModal.onSubmit}
        onCancel={() => setFormModal({ open: false })}
        loading={formLoading}
      />
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          courses={courses} sections={sections} videos={videos}
          onImported={refreshAll}
        />
      )}
      <VideoPlayerModal video={playVideo} onClose={() => setPlayVideo(null)} />
    </div>
  );
};

/* ================================================================
   HOME — regular users
   ================================================================ */
const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN') { setLoading(false); return; }
    const fetchData = async () => {
      try { const [s, p] = await Promise.all([getStats(), getProgress()]); setStats(s); setProgress(p); } catch { }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const levelConfig = {
    'débutant': { gradient: 'from-emerald-500 to-teal-400', text: 'text-emerald-400', pct: 33, icon: Zap },
    'intermédiaire': { gradient: 'from-amber-500 to-orange-400', text: 'text-amber-400', pct: 66, icon: Flame },
    'avancé': { gradient: 'from-rose-500 to-pink-400', text: 'text-rose-400', pct: 100, icon: Trophy },
  };
  const lvl = levelConfig[user?.level] || levelConfig['débutant'];
  const LevelIcon = lvl.icon;

  const quickActions = [
    { label: 'Chat IA', desc: "Posez vos questions à l'assistant", icon: MessageSquare, path: '/chat', gradient: 'from-indigo-500 to-violet-500' },
    { label: 'Quiz', desc: 'Testez vos connaissances', icon: Target, path: '/quiz', gradient: 'from-purple-500 to-pink-500' },
    { label: 'Exercices', desc: 'Pratiquez avec des exercices guidés', icon: Dumbbell, path: '/exercises', gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Cours', desc: 'Catalogue de cours structurés', icon: GraduationCap, path: '/courses', gradient: 'from-violet-500 to-purple-500' },
    { label: 'Progression', desc: 'Suivez votre évolution', icon: BarChart3, path: '/progress', gradient: 'from-cyan-500 to-blue-500' },
  ];

  const recentTopics = progress?.topics?.slice(0, 5) || [];
  const getMasteryColor = (s) => s >= 80 ? 'from-emerald-500 to-teal-400' : s >= 50 ? 'from-amber-500 to-orange-400' : 'from-rose-500 to-pink-400';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  if (user?.role === 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <Navbar />
        <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <AdminDashboard />
        </div>
        <ScrollToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <Navbar />
      <div className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {user?.profilePicture ? (
                <img
                  src={`http://localhost:8080/uploads/avatars/${user.profilePicture}`}
                  alt={user.username}
                  className="w-16 h-16 rounded-2xl object-cover shadow-xl flex-shrink-0 border-2 border-gray-800"
                />
              ) : (
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${lvl.gradient} flex items-center justify-center shadow-xl text-white text-2xl font-bold flex-shrink-0`}>
                  {(user?.username || 'U').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">{greeting},</p>
                <h1 className="text-3xl font-bold text-white">{user?.username} 👋</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl">
              <LevelIcon className={`w-5 h-5 ${lvl.text}`} />
              <div>
                <p className="text-xs text-gray-500">Niveau actuel</p>
                <p className={`text-sm font-bold capitalize ${lvl.text}`}>{user?.level || 'débutant'}</p>
              </div>
              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden ml-2">
                <div className={`h-full rounded-full bg-gradient-to-r ${lvl.gradient} transition-all duration-1000`} style={{ width: `${lvl.pct}%` }} />
              </div>
            </div>
          </div>
        </div>
        {!loading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {[
              { label: 'Quiz passés', value: stats.total_quizzes, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { label: 'Score moyen', value: `${stats.average_score}%`, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Sujets maîtrisés', value: stats.topics_mastered, icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Messages', value: stats.total_messages, icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-5 hover:border-gray-700/80 transition-all duration-300">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-5"><Zap className="w-5 h-5 text-indigo-400" /><h2 className="text-lg font-semibold text-white">Accès rapide</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.path} className="group bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-6 hover:border-gray-700/80 hover:scale-[1.02] transition-all duration-300 flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold">{action.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
        {recentTopics.length > 0 && (
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-2xl p-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/15 rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-indigo-400" /></div>
                <div><h3 className="text-lg font-semibold text-white">Sujets récents</h3><p className="text-xs text-gray-500">Vos dernières progressions</p></div>
              </div>
              <Link to="/progress" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">Tout voir <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="space-y-4">
              {recentTopics.map((tp, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-300 font-medium">{tp.topic}</span>
                    <span className="text-sm font-bold text-white">{Math.round(tp.mastery_score)}%</span>
                  </div>
                  <div className="w-full bg-gray-800/80 rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${getMasteryColor(tp.mastery_score)} transition-all duration-1000`} style={{ width: `${Math.min(tp.mastery_score, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && !stats?.total_quizzes && (
          <div className="text-center py-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4"><BookOpen className="w-10 h-10 text-indigo-400" /></div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Prêt à commencer ?</h3>
            <p className="text-gray-500 mb-6">Lancez votre premier quiz ou posez une question à l'IA !</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/chat" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:scale-105 transition-all"><MessageSquare className="w-5 h-5" /> Chat IA</Link>
              <Link to="/quiz" className="flex items-center gap-2 px-6 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white font-semibold hover:bg-gray-700/60 transition-all"><Target className="w-5 h-5" /> Lancer un quiz</Link>
            </div>
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
};

export default Home;