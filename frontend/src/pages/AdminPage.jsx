import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScrollToTop from '../components/ScrollToTop';
import {
  getAdminStats, getAdminUsers, updateUserRole, deleteUser, getAdminUserDetail,
  getAllCourses, createCourse, updateCourse, deleteCourse,
  getAllSections, createSection, updateSection, deleteSection,
  getAllVideos, createVideo, deleteVideo,
  uploadVideoFile, uploadThumbnail,
  importYoutubePlaylist,
  getAllTestimonialsAdmin, approveTestimonial, rejectTestimonial, deleteTestimonial,
  getAllCommentsAdmin, toggleCommentPin, deleteComment as apiDeleteComment,
  getContactMessages, markContactMessageRead, replyContactMessage, deleteContactMessage as apiDeleteContactMessage,
  deleteGmailMessage as apiDeleteGmailMessage,
  getInboxEmails, replyToInboxEmail, replyToMessage, refreshMessages
} from '../service/Api';
import {
  Users, BookOpen, Layers, Video, Target, MessageSquare, Pin,
  Shield, Trash2, Loader2, Search, Plus, X, Check, Send, User,
  Edit3, ChevronDown, ChevronUp, AlertTriangle, Crown, UserCircle,
  BarChart2, BarChart3, TrendingUp, Eye, ArrowUpRight, Lock, KeyRound, Star, CheckCircle2, XCircle, Play, Youtube, Link,
  Mail, Reply, Clock, CheckCheck, Archive, PenSquare, RefreshCw, MailOpen
} from 'lucide-react';



const ADMIN_SECRET = 'apprendreàcomprendre';
const SESSION_KEY = 'admin_code_verified';


const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AVATAR_COLORS = [
  ['#6366f1', '#9333ea'],
  ['#3b82f6', '#06b6d4'],
  ['#10b981', '#14b8a6'],
  ['#f43f5e', '#ec4899'],
  ['#f59e0b', '#f97316'],
  ['#8b5cf6', '#d946ef'],
  ['#14b8a6', '#22c55e'],
  ['#ef4444', '#f43f5e'],
  ['#0ea5e9', '#6366f1'],
  ['#84cc16', '#10b981'],
];

const getAvatarStyle = (name) => {
  if (!name) return { background: 'linear-gradient(135deg, #6366f1, #9333ea)' };
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  const [c1, c2] = AVATAR_COLORS[idx];
  return { background: `linear-gradient(135deg, ${c1}, ${c2})` };
};

const TABS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'courses', label: 'Cours', icon: BookOpen },
  { id: 'sections', label: 'Sections', icon: Layers },
  { id: 'videos', label: 'Vidéos', icon: Video },
  { id: 'testimonials', label: 'Avis', icon: Star, badge: 'pending' },
  { id: 'comments', label: 'Commentaires', icon: MessageSquare, badge: 'comments' },
  { id: 'messages', label: 'Messages', icon: Mail, badge: 'messages' },
];


const StatCard = ({ icon: Icon, label, value, gradient, delay }) => (
  <div
    className="glass-card rounded-2xl p-5 hover:scale-[1.03] transition-all duration-300 animate-fade-in group"
    style={{ animationDelay: `${delay}ms` }}
  >
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
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all">
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition-all ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
          >
            Confirmer
          </button>
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
          <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/50 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={values[field.name] || ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm resize-none"
                />
              ) : field.type === 'select' ? (
                <div className="relative">
                  <select
                    value={values[field.name] || ''}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm appearance-none"
                  >
                    <option value="">{field.placeholder || 'Sélectionner...'}</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={values[field.name] || ''}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm"
                />
              )}
            </div>
          ))}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all">
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};





const EmailBody = ({ body, bodyType }) => {
  if (!body) return <p className="text-sm text-gray-500 italic">(Corps vide)</p>;

  const isHtml = bodyType === 'html' || /<(html|body|div|p|table|span)[^>]*>/i.test(body);

  if (isHtml) {
    return (
      <iframe
        srcDoc={`<html><head><style>
          body { font-family: Arial, sans-serif; font-size: 13px; color: #d1d5db;
                 background: transparent; margin: 0; padding: 4px 0;
                 word-break: break-word; line-height: 1.5; }
          a { color: #818cf8; }
          img { max-width: 100%; height: auto; }
          * { box-sizing: border-box; }
        </style></head><body>${body}</body></html>`}
        sandbox="allow-same-origin"
        className="w-full border-0 rounded-lg bg-transparent"
        style={{ minHeight: '80px' }}
        onLoad={e => {
          const doc = e.target.contentDocument;
          if (doc && doc.body) {
            e.target.style.height = (doc.body.scrollHeight + 16) + 'px';
          }
        }}
      />
    );
  }

  return (
    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{body}</p>
  );
};




const splitEmailThread = (rawBody) => {
  if (!rawBody) return { fresh: '', quoted: '' };



  if (/<blockquote/i.test(rawBody)) {
    const bqIdx = rawBody.search(/<blockquote/i);
    if (bqIdx > 0) {
      const freshHtml = rawBody.slice(0, bqIdx);
      const freshText = freshHtml
        .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .trim();
      const quotedText = rawBody.slice(bqIdx)
        .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        .trim();
      if (freshText) return { fresh: freshText, quoted: quotedText };
    }
  }


  const text = rawBody
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');


  const multilineSeps = [

    /On [A-Z][a-z]+,?\s.+?wrote\s*:/s,

    /Le [a-z]+\.?\s.+?a écrit\s*:/s,
  ];
  for (const sep of multilineSeps) {
    const match = text.search(sep);
    if (match > 10) {
      return {
        fresh: text.slice(0, match).trim(),
        quoted: text.slice(match).trim(),
      };
    }
  }


  const singleLineSeps = [
    /^_{3,}/m,
    /^-{3,}\s*Original Message\s*-{3,}/im,
    /^-{3,}\s*Message d'origine\s*-{3,}/im,
    /^From:.+\nTo:.+/im,
    /^De :.+\nÀ :.+/im,
  ];
  for (const sep of singleLineSeps) {
    const match = text.search(sep);
    if (match > 0) {
      return {
        fresh: text.slice(0, match).trim(),
        quoted: text.slice(match).trim(),
      };
    }
  }

  // ── 5. Lignes préfixées > (style plain text) ───────────────────────────────
  const lines = text.split('\n');
  const firstQuoted = lines.findIndex(l => l.trimStart().startsWith('>'));
  if (firstQuoted > 0) {
    return {
      fresh: lines.slice(0, firstQuoted).join('\n').trim(),
      quoted: lines.slice(firstQuoted).map(l => l.replace(/^>\s?/, '')).join('\n').trim(),
    };
  }

  return { fresh: text.trim(), quoted: '' };
};

/**
 * Reconstruit la liste de bulles à partir du corps d'un email de réponse.
 * Chaque niveau de citation devient une bulle USER supplémentaire.
 */
const htmlToText = (html) => {
  if (!html) return '';
  return html

    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const stripSignature = (text) =>
  text.replace(/\n?--\s*\n[\s\S]*$/m, '').trim();

const parseThreadIntoBubbles = (email) => {
  const rawBody = email.body || '';
  if (!rawBody) return [];

  const isHtml = email.bodyType === 'html' || /<[a-z][\s\S]*>/i.test(rawBody);


  if (/<blockquote/i.test(rawBody)) {
    const bqStart = rawBody.search(/<blockquote/i);

    const freshHtml = rawBody.slice(0, bqStart);

    const bqMatch = rawBody.slice(bqStart).match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);
    const quotedHtml = bqMatch ? bqMatch[1] : '';

    const freshText = htmlToText(freshHtml);

    const freshClean = freshText
      .replace(/On [A-Z][a-z]+,?[\s\S]{0,200}?wrote\s*:\s*$/i, '')
      .replace(/Le [a-z]+[\s\S]{0,200}?a écrit\s*:\s*$/i, '')
      .trim();
    const quotedText = stripSignature(htmlToText(quotedHtml));

    const bubbles = [];
    if (quotedText) {
      bubbles.push({
        direction: 'ADMIN',
        senderName: 'Admin (InfoAcademy)',
        text: quotedText,
        sentAt: null,
        isHtml: false,
        depth: 1,
      });
    }
    if (freshClean) {
      bubbles.push({
        direction: 'USER',
        senderName: email.fromName || email.fromEmail || 'Expéditeur',
        text: freshClean,
        sentAt: email.date,
        isHtml: false,
        depth: 0,
      });
    }
    if (bubbles.length > 0) return bubbles;
  }


  const fullText = isHtml ? htmlToText(rawBody) : rawBody;
  const lines = fullText.split('\n');


  let sepIdx = -1;


  for (let i = 0; i < lines.length - 1; i++) {
    const twoLines = lines[i] + ' ' + lines[i + 1];
    if (/On [A-Z][a-z]/.test(lines[i]) && /wrote\s*:/i.test(twoLines)) {
      sepIdx = i; break;
    }
    if (/Le [a-z]/.test(lines[i]) && /a écrit\s*:/i.test(twoLines)) {
      sepIdx = i; break;
    }
  }

  if (sepIdx === -1) {
    sepIdx = lines.findIndex(l =>
      /On [A-Z][a-z].+wrote\s*:/i.test(l) ||
      /Le [a-z].+a écrit\s*:/i.test(l) ||
      /^-{3,}\s*Original Message/i.test(l) ||
      /^_{3,}/.test(l)
    );
  }

  if (sepIdx === -1) {
    sepIdx = lines.findIndex(l => l.trimStart().startsWith('>'));
  }

  if (sepIdx > 0) {
    const freshText = lines.slice(0, sepIdx).join('\n').trim();
    const quotedRaw = lines.slice(sepIdx).map(l => l.replace(/^>\s?/, '')).join('\n');

    const quotedText = stripSignature(
      quotedRaw
        .replace(/^On [^\n]+\n?[^\n]*wrote:\s*/i, '')
        .replace(/^Le [^\n]+\n?[^\n]*a écrit\s*:\s*/i, '')
        .replace(/^-{3,}.*\n?/m, '')
        .trim()
    );
    const bubbles = [];
    if (quotedText) {
      bubbles.push({ direction: 'ADMIN', senderName: 'Admin (InfoAcademy)', text: quotedText, sentAt: null, isHtml: false, depth: 1 });
    }
    if (freshText) {
      bubbles.push({ direction: 'USER', senderName: email.fromName || email.fromEmail || 'Expéditeur', text: freshText, sentAt: email.date, isHtml: false, depth: 0 });
    }
    if (bubbles.length > 0) return bubbles;
  }




  if (isHtml) {
    return [{
      direction: 'USER',
      senderName: email.fromName || email.fromEmail || 'Expéditeur',
      rawHtml: rawBody,
      text: '',
      sentAt: email.date,
      isHtml: true,
      depth: 0,
    }];
  }
  const text = stripSignature(fullText);
  return [{
    direction: 'USER',
    senderName: email.fromName || email.fromEmail || 'Expéditeur',
    text: text || '(contenu vide)',
    sentAt: email.date,
    isHtml: false,
    depth: 0,
  }];
};


const parseContactNotification = (body) => {
  if (!body) return null;
  const text = body.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

  const deMatch = text.match(/De\s*:\s*([^\n\r]+?)(?=Sujet\s*:)/i);
  const sujetMatch = text.match(/Sujet\s*:\s*([^\n\r]+?)(?=Message\s*:)/i);
  const msgMatch = text.match(/Message\s*:\s*([\s\S]+?)(?:---|$)/i);
  if (!deMatch && !sujetMatch && !msgMatch) return null;
  return {
    de: deMatch ? deMatch[1].replace(/<[^>]+>/g, '').trim() : null,
    sujet: sujetMatch ? sujetMatch[1].replace(/<[^>]+>/g, '').trim() : null,
    message: msgMatch ? msgMatch[1].replace(/<[^>]+>/g, '').trim() : null,
  };
};


const ContactNotificationCard = ({ de, sujet, message }) => (
  <div className="space-y-2 text-sm">
    {de && (
      <div className="flex gap-2">
        <span className="text-gray-500 font-medium flex-shrink-0">De :</span>
        <span className="text-white font-semibold">{de}</span>
      </div>
    )}
    {sujet && (
      <div className="flex gap-2">
        <span className="text-gray-500 font-medium flex-shrink-0">Sujet :</span>
        <span className="text-indigo-300">{sujet}</span>
      </div>
    )}
    {message && (
      <div className="flex gap-2 pt-1 border-t border-gray-700/40">
        <span className="text-gray-500 font-medium flex-shrink-0">Message :</span>
        <span className="text-gray-200 whitespace-pre-wrap">{message}</span>
      </div>
    )}
  </div>
);

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();


  const [codeVerified, setCodeVerified] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
  const [secretInput, setSecretInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeShake, setCodeShake] = useState(false);

  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem('admin_active_tab') || 'overview'
  );
  const [loading, setLoading] = useState(true);


  const [lastSeenTestimonials, setLastSeenTestimonials] = useState(
    () => localStorage.getItem('admin_lastseen_testimonials') || null
  );
  const [seenCommentIds, setSeenCommentIds] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_seen_comment_ids');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    sessionStorage.setItem('admin_active_tab', tabId);
    const now = new Date().toISOString();
    if (tabId === 'testimonials') {
      localStorage.setItem('admin_lastseen_testimonials', now);
      setLastSeenTestimonials(now);
    }
    if (tabId === 'comments') {
      const allIds = adminComments.map(c => c.id);
      const newSet = new Set([...seenCommentIds, ...allIds]);
      setSeenCommentIds(newSet);
      localStorage.setItem('admin_seen_comment_ids', JSON.stringify([...newSet]));
    }
    if (tabId === 'messages') {
      localStorage.setItem('admin_lastseen_messages', now);
      setLastSeenMessages(now);
    }
  };


  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [videos, setVideos] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [searchTestimonial, setSearchTestimonial] = useState('');
  const [testimonialFilter, setTestimonialFilter] = useState('all');

  const [adminComments, setAdminComments] = useState([]);
  const [searchComment, setSearchComment] = useState('');


  const [contactMessages, setContactMessages] = useState([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const conversationEndRef = useRef(null);
  const [lastSeenMessages, setLastSeenMessages] = useState(
    () => localStorage.getItem('admin_lastseen_messages') || null
  );


  const [messagesSubTab, setMessagesSubTab] = useState(
    () => sessionStorage.getItem('admin_messages_subtab') || 'inbox'
  );
  const [inboxEmails, setInboxEmails] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxInitialLoading, setInboxInitialLoading] = useState(false);
  const [inboxError, setInboxError] = useState(null);
  const [selectedInboxEmail, setSelectedInboxEmail] = useState(null);
  const [inboxReplyText, setInboxReplyText] = useState('');
  const [inboxReplyLoading, setInboxReplyLoading] = useState(false);
  const [inboxReplySuccess, setInboxReplySuccess] = useState(false);

  const [inboxConversations, setInboxConversations] = useState({});
  const inboxConvEndRef = useRef(null);
  const [pinnedEmails, setPinnedEmails] = useState(new Set());
  const [archivedEmails, setArchivedEmails] = useState(new Set());
  const [readEmails, setReadEmails] = useState(() => {
    try {
      const saved = localStorage.getItem('infoacademy_read_emails');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [composeSending, setComposeSending] = useState(false);
  const [composeSent, setComposeSent] = useState(false);


  const [videoModal, setVideoModal] = useState({ open: false, video: null });


  const [videoFormOpen, setVideoFormOpen] = useState(false);
  const [videoFormValues, setVideoFormValues] = useState({ courseId: '', sectionId: '', title: '', description: '', youtubeUrl: '', thumbnailUrl: '' });
  const [videoFormLoading, setVideoFormLoading] = useState(false);


  const [videoSourceMode, setVideoSourceMode] = useState('youtube');
  const [thumbSourceMode, setThumbSourceMode] = useState('url');
  const [localVideoFile, setLocalVideoFile] = useState(null);
  const [localThumbFile, setLocalThumbFile] = useState(null);
  const [localVideoPreview, setLocalVideoPreview] = useState(null);
  const [localThumbPreview, setLocalThumbPreview] = useState(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const videoFileRef = React.useRef(null);
  const thumbFileRef = React.useRef(null);


  const [searchUser, setSearchUser] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userLevelFilter, setUserLevelFilter] = useState('all');
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const toggleSection = (key) => setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [searchCourse, setSearchCourse] = useState('');
  const [searchSection, setSearchSection] = useState('');
  const [filterSectionCourse, setFilterSectionCourse] = useState('');


  const [playlistModal, setPlaylistModal] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistApiKey, setPlaylistApiKey] = useState('AIzaSyDBbf32ELvIQScPYoQOuJ4ei05yTJeWHxs');
  const [playlistImporting, setPlaylistImporting] = useState(false);
  const [playlistResult, setPlaylistResult] = useState(null);
  const [playlistError, setPlaylistError] = useState('');
  const [searchVideo, setSearchVideo] = useState('');


  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [formModal, setFormModal] = useState({ open: false });
  const [formValues, setFormValues] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const formValuesRef = useRef({});


  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (secretInput.trim() === ADMIN_SECRET) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setCodeVerified(true);
      setCodeError('');
    } else {
      setCodeError('Code secret incorrect. Accès refusé.');
      setCodeShake(true);
      setTimeout(() => setCodeShake(false), 600);
      setSecretInput('');
    }
  };


  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);


  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setVideoModal({ open: false, video: null });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);


  useEffect(() => {
    if (codeVerified) loadData();
  }, [codeVerified]);


  useEffect(() => {
    if (activeTab === 'messages' && messagesSubTab === 'inbox' && inboxEmails.length === 0 && !inboxLoading) {
      fetchInboxEmails();
    }
  }, [activeTab, messagesSubTab]);




  useEffect(() => {
    if (!codeVerified) return;
    const interval = setInterval(() => {
      fetchInboxEmailsSilent();
    }, 10000);
    return () => clearInterval(interval);
  }, [codeVerified]);


  useEffect(() => {
    if (!codeVerified) return;
    const fetchContactPeriodically = async () => {
      try {
        const msgs = await getContactMessages();
        const contactOnly = (Array.isArray(msgs) ? msgs : []).filter(
          m => !m.source || m.source === 'CONTACT_FORM'
        ).map(m => ({
          ...m,
          id: m.id != null ? Number(m.id) : m.id,
          name: m.name || m.fromName,
          email: m.email || m.fromEmail,
          message: m.message || m.body,
          createdAt: m.createdAt || m.date,
        }));
        setContactMessages(contactOnly);
      } catch (err) {

      }
    };
    const interval = setInterval(fetchContactPeriodically, 10000);
    return () => clearInterval(interval);
  }, [codeVerified]);

  const loadData = async () => {
    setLoading(true);


    try {
      const c = await getAllCourses();
      console.log('DEBUG getAllCourses() returned:', c, 'type:', typeof c, 'isArray:', Array.isArray(c));
      setCourses(Array.isArray(c) ? c : (c?.content || c?.data || []));
    } catch (err) {
      console.error('Erreur chargement cours:', err);
    }

    try {
      const sec = await getAllSections();
      console.log('DEBUG getAllSections() returned:', sec, 'type:', typeof sec, 'isArray:', Array.isArray(sec));
      setSections(Array.isArray(sec) ? sec : (sec?.content || sec?.data || []));
    } catch (err) {
      console.error('Erreur chargement sections:', err);
    }

    try {
      const v = await getAllVideos();
      console.log('DEBUG getAllVideos() returned:', v, 'type:', typeof v, 'isArray:', Array.isArray(v));
      setVideos(Array.isArray(v) ? v : (v?.content || v?.data || []));

      try {
        const t = await getAllTestimonialsAdmin();
        setTestimonials(Array.isArray(t) ? t : []);
      } catch (err) {
        console.error('Erreur chargement témoignages:', err);
      }

      try {
        const c = await getAllCommentsAdmin();
        setAdminComments(Array.isArray(c) ? c : []);
      } catch (err) {
        console.error('Erreur chargement commentaires:', err);
      }

      try {
        const msgs = await getContactMessages();
        const contactOnly = (Array.isArray(msgs) ? msgs : []).filter(
          m => !m.source || m.source === 'CONTACT_FORM'
        ).map(m => ({
          ...m,


          id: m.id != null ? Number(m.id) : m.id,
          name: m.name || m.fromName,
          email: m.email || m.fromEmail,
          message: m.message || m.body,
          createdAt: m.createdAt || m.date,
        }));
        setContactMessages(contactOnly);
      } catch (err) {
        console.error('Erreur chargement messages contact:', err);
      }
    } catch (err) {
      console.error('Erreur chargement vidéos:', err);
    }


    try {
      const s = await getAdminStats();
      setStats(s);
    } catch (err) {
      console.error('Erreur stats admin:', err);
    }

    try {
      const u = await getAdminUsers();
      setUsers(u);
    } catch (err) {
      console.error('Erreur users admin:', err);
    }

    setLoading(false);
  };

  

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setConfirmModal({
      open: true,
      title: 'Changer le rôle',
      message: `Voulez-vous changer le rôle de cet utilisateur en ${newRole} ?`,
      danger: false,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await updateUserRole(userId, newRole);
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
          console.error('Erreur changement rôle:', err);
        }
      },
    });
  };

  const handleDeleteUser = (userId, username) => {
    setConfirmModal({
      open: true,
      title: 'Supprimer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir supprimer "${username}" ? Cette action est irréversible.`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await deleteUser(userId);
          setUsers(prev => prev.filter(u => u.id !== userId));
          const newStats = await getAdminStats();
          setStats(newStats);
        } catch (err) {
          console.error('Erreur suppression:', err);
        }
      },
    });
  };

  

  const openCourseForm = (course = null) => {
    const initialCourse = course ? { title: course.title, description: course.description } : {};
    setFormValues(initialCourse);
    formValuesRef.current = initialCourse;
    setFormModal({
      open: true,
      title: course ? 'Modifier le cours' : 'Nouveau cours',
      fields: [
        { name: 'title', label: 'Titre', placeholder: 'Ex: Introduction au Python' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Description du cours...' },
      ],
      onSubmit: async () => {
        setFormLoading(true);
        try {
          if (course) {
            await updateCourse(course.id, formValuesRef.current);
          } else {
            await createCourse(formValuesRef.current);
          }
          const [c, s] = await Promise.all([getAllCourses(), getAdminStats()]);
          setCourses(Array.isArray(c) ? c : (c?.content || c?.data || []));
          setStats(s);
          setFormModal({ open: false });
        } catch (err) {
          console.error('Erreur cours:', err);
        } finally {
          setFormLoading(false);
        }
      },
    });
  };

  const handleDeleteCourse = (courseId, title) => {
    setConfirmModal({
      open: true,
      title: 'Supprimer le cours',
      message: `Supprimer "${title}" et toutes ses sections/vidéos ? Cette action est irréversible.`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await deleteCourse(courseId);
          const [c, s] = await Promise.all([getAllCourses(), getAdminStats()]);
          setCourses(Array.isArray(c) ? c : (c?.content || c?.data || []));
          setStats(s);
        } catch (err) {
          console.error('Erreur suppression cours:', err);
        }
      },
    });
  };

  

  const handleImportPlaylist = async () => {
    if (!playlistUrl.trim()) { setPlaylistError("Veuillez entrer une URL de playlist."); return; }
    if (!playlistApiKey.trim()) { setPlaylistError("Veuillez entrer votre clé API YouTube."); return; }
    setPlaylistImporting(true);
    setPlaylistError('');
    setPlaylistResult(null);
    try {
      const result = await importYoutubePlaylist({ playlistUrl: playlistUrl.trim(), apiKey: playlistApiKey.trim() });
      setPlaylistResult(result);
      const [c] = await Promise.all([getAllCourses()]);
      setCourses(Array.isArray(c) ? c : (c?.content || c?.data || []));
    } catch (err) {
      setPlaylistError(err?.response?.data?.detail || err.message || "Erreur lors de l'import.");
    } finally {
      setPlaylistImporting(false);
    }
  };

  const closePlaylistModal = () => {
    setPlaylistModal(false);
    setPlaylistUrl('');
    setPlaylistApiKey('');
    setPlaylistResult(null);
    setPlaylistError('');
  };

  

  const openSectionForm = (section = null) => {
    const initialSection = section ? {
      title: section.title,
      content: section.content || '',
      summary: section.summary || '',
      videoUrl: section.videoUrl || '',
      courseId: section.courseId?.toString() || ''
    } : {};
    setFormValues(initialSection);
    formValuesRef.current = initialSection;
    setFormModal({
      open: true,
      title: section ? 'Modifier la section' : 'Nouvelle section',
      fields: [
        {
          name: 'courseId', label: 'Cours', type: 'select', placeholder: 'Sélectionner un cours',
          options: courses.map(c => ({ value: c.id.toString(), label: c.title }))
        },
        { name: 'title', label: 'Titre', placeholder: 'Ex: Variables et Types' },
        { name: 'content', label: 'Contenu', type: 'textarea', placeholder: 'Contenu de la section...' },
        { name: 'summary', label: 'Résumé', type: 'textarea', placeholder: 'Résumé de la section...' },
        { name: 'videoUrl', label: 'URL vidéo', placeholder: 'https://...' },
      ],
      onSubmit: async () => {
        setFormLoading(true);
        try {
          const payload = { ...formValuesRef.current, courseId: parseInt(formValuesRef.current.courseId) };
          if (section) {
            await updateSection(section.id, payload);
          } else {
            await createSection(payload);
          }
          const [sec, s] = await Promise.all([getAllSections(), getAdminStats()]);
          setSections(Array.isArray(sec) ? sec : (sec?.content || sec?.data || []));
          setStats(s);
          setFormModal({ open: false });
        } catch (err) {
          console.error('Erreur section:', err);
        } finally {
          setFormLoading(false);
        }
      },
    });
  };

  const handleDeleteSection = (sectionId, title) => {
    setConfirmModal({
      open: true,
      title: 'Supprimer la section',
      message: `Supprimer "${title}" ? Cette action est irréversible.`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await deleteSection(sectionId);
          const [sec, s] = await Promise.all([getAllSections(), getAdminStats()]);
          setSections(Array.isArray(sec) ? sec : (sec?.content || sec?.data || []));
          setStats(s);
        } catch (err) {
          console.error('Erreur suppression section:', err);
        }
      },
    });
  };

  

  const openVideoForm = () => {
    setVideoFormValues({ courseId: '', sectionId: '', title: '', description: '', youtubeUrl: '', thumbnailUrl: '' });
    setVideoSourceMode('youtube');
    setThumbSourceMode('url');
    setLocalVideoFile(null);
    setLocalThumbFile(null);
    setLocalVideoPreview(null);
    setLocalThumbPreview(null);
    setVideoUploadProgress(0);
    setVideoFormOpen(true);
  };

  const handleLocalVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalVideoFile(file);
    setLocalVideoPreview(URL.createObjectURL(file));

    if (!videoFormValues.title) {
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setVideoFormValues(prev => ({ ...prev, title: name }));
    }
  };

  const handleLocalThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalThumbFile(file);
    setLocalThumbPreview(URL.createObjectURL(file));
  };

  const handleSubmitVideoForm = async () => {
    setVideoFormLoading(true);
    setVideoUploadProgress(0);
    try {
      let finalYoutubeUrl = videoFormValues.youtubeUrl;
      let finalThumbnailUrl = videoFormValues.thumbnailUrl;


      if (videoSourceMode === 'local' && localVideoFile) {
        setVideoUploadProgress(10);
        const uploaded = await uploadVideoFile(localVideoFile, {
          title: videoFormValues.title,
          description: videoFormValues.description,
          courseId: videoFormValues.courseId || undefined,
          sectionId: videoFormValues.sectionId || undefined,
        });
        setVideoUploadProgress(70);
        finalYoutubeUrl = uploaded.youtubeUrl || uploaded.url || uploaded.videoUrl || '';

        if (uploaded.thumbnailUrl) finalThumbnailUrl = uploaded.thumbnailUrl;
      }


      if (thumbSourceMode === 'local' && localThumbFile) {
        setVideoUploadProgress(80);
        const thumbUploaded = await uploadThumbnail(localThumbFile);
        finalThumbnailUrl = thumbUploaded.url || thumbUploaded.thumbnailUrl || '';
        setVideoUploadProgress(90);
      }


      if (videoSourceMode === 'local' && localVideoFile) {

      } else {
        const payload = {
          ...videoFormValues,
          youtubeUrl: finalYoutubeUrl,
          thumbnailUrl: finalThumbnailUrl,
          courseId: videoFormValues.courseId ? parseInt(videoFormValues.courseId) : null,
          sectionId: videoFormValues.sectionId ? parseInt(videoFormValues.sectionId) : null,
        };
        await createVideo(payload);
      }

      setVideoUploadProgress(100);
      const [v, s] = await Promise.all([getAllVideos(), getAdminStats()]);
      setVideos(Array.isArray(v) ? v : (v?.content || v?.data || []));
      setStats(s);
      setVideoFormOpen(false);
    } catch (err) {
      console.error('Erreur vidéo:', err);
    } finally {
      setVideoFormLoading(false);
      setVideoUploadProgress(0);
    }
  };

  const handleDeleteVideo = (videoId, title) => {
    setConfirmModal({
      open: true,
      title: 'Supprimer la vidéo',
      message: `Supprimer "${title}" ? Cette action est irréversible.`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await deleteVideo(videoId);
          const [v, s] = await Promise.all([getAllVideos(), getAdminStats()]);
          setVideos(Array.isArray(v) ? v : (v?.content || v?.data || []));
          setStats(s);
        } catch (err) {
          console.error('Erreur suppression vidéo:', err);
        }
      },
    });
  };

  

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole =
      userRoleFilter === 'all' ? true :
        userRoleFilter === 'ADMIN' ? u.role === 'ADMIN' :
          u.role !== 'ADMIN';
    const matchesLevel =
      userLevelFilter === 'all' ? true :
        (u.level || '').toLowerCase() === userLevelFilter;
    return matchesSearch && matchesRole && matchesLevel;
  });

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(searchCourse.toLowerCase())
  );

  const filteredSections = sections.filter(s =>
    s.title?.toLowerCase().includes(searchSection.toLowerCase()) &&
    (filterSectionCourse === '' || String(s.courseId) === filterSectionCourse)
  );

  const filteredVideos = videos.filter(v =>
    v.title?.toLowerCase().includes(searchVideo.toLowerCase())
  );

  const pendingCount = testimonials.filter(t => !t.approved && !t.rejected).length;


  const newTestimonialsCount = testimonials.filter(t => {
    if (!t.createdAt) return false;
    if (!lastSeenTestimonials) return true;
    return new Date(t.createdAt) > new Date(lastSeenTestimonials);
  }).length;

  const newCommentsCount = adminComments.filter(c => !seenCommentIds.has(c.id)).length;

  const unreadMessagesCount = inboxEmails.filter(email => {
    const emailKey = String(email.id ?? email.messageNumber ?? '');
    return !(email.read || readEmails.has(emailKey));
  }).length;
  const unreadContactMessagesCount = contactMessages.filter(m => !m.read).length;
  const newMessagesCount = contactMessages.filter(m => {
    if (!m.createdAt) return false;
    if (!lastSeenMessages) return true;
    return new Date(m.createdAt) > new Date(lastSeenMessages);
  }).length;

  const filteredContactMessages = contactMessages.filter(m => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchMessage.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchMessage.toLowerCase()) ||
      m.subject?.toLowerCase().includes(searchMessage.toLowerCase()) ||
      m.message?.toLowerCase().includes(searchMessage.toLowerCase());
    const matchesFilter =
      messageFilter === 'all' ? true :
        messageFilter === 'unread' ? !m.read :
          messageFilter === 'read' ? (m.read && !m.replied) :
            messageFilter === 'replied' ? m.replied : true;
    return matchesSearch && matchesFilter;
  });
  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchTestimonial.toLowerCase()) ||
      t.text?.toLowerCase().includes(searchTestimonial.toLowerCase());
    const matchesFilter =
      testimonialFilter === 'all' ? true :
        testimonialFilter === 'pending' ? (!t.approved && !t.rejected) :
          testimonialFilter === 'approved' ? t.approved :
            testimonialFilter === 'rejected' ? t.rejected : true;
    return matchesSearch && matchesFilter;
  });

  

  const handleApproveTestimonial = async (id) => {
    try {
      const updated = await approveTestimonial(id);
      setTestimonials(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) { console.error(err); }
  };

  const handleRejectTestimonial = async (id) => {
    try {
      const updated = await rejectTestimonial(id);
      setTestimonials(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) { console.error(err); }
  };

  const handleDeleteTestimonial = (id) => {
    setConfirmModal({
      open: true,
      title: "Supprimer l'avis",
      message: "Supprimer ce témoignage ? Cette action est irréversible.",
      danger: true,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await deleteTestimonial(id);
          setTestimonials(prev => prev.filter(t => t.id !== id));
        } catch (err) { console.error(err); }
      },
    });
  };


  useEffect(() => {
    if (selectedMessage) {
      setTimeout(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedMessage?.id]);

  

  const handleViewUser = async (user) => {
    if (user.role === 'ADMIN') return;
    setUserDetailLoading(true);
    setSelectedUserDetail({ ...user, _loading: true });
    try {
      const detail = await getAdminUserDetail(user.id);
      setSelectedUserDetail(detail);
    } catch (err) {
      console.error(err);
      setSelectedUserDetail({ ...user, _error: true });
    } finally {
      setUserDetailLoading(false);
    }
  };

  const handleOpenMessage = async (msg) => {

    let enrichedMsg = { ...msg };
    const hasReplies = Array.isArray(msg.replies) && msg.replies.length > 0;
    const firstIsUser = hasReplies && msg.replies[0]?.direction === 'USER';
    if (!hasReplies || !firstIsUser) {

      const initialBubble = {
        direction: 'USER',
        senderName: msg.name || msg.fromName,
        text: msg.message || msg.body,
        sentAt: msg.createdAt || msg.date,
      };
      enrichedMsg.replies = [initialBubble, ...(msg.replies || [])];
    }
    setSelectedMessage(enrichedMsg);
    setReplyText('');
    if (!msg.read) {
      try {
        await markContactMessageRead(msg.id);
        setContactMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
      } catch (err) { console.error(err); }
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    setReplyLoading(true);
    try {
      await replyContactMessage(selectedMessage.id, replyText);
      const newReply = {
        direction: 'ADMIN',
        senderName: 'InfoAcademy',
        text: replyText,
        sentAt: new Date().toISOString(),
      };
      setContactMessages(prev => prev.map(m =>
        m.id === selectedMessage.id ? { ...m, replied: true, read: true } : m
      ));
      setSelectedMessage(prev => ({
        ...prev,
        replied: true,
        replies: [...(prev.replies || []), newReply],
      }));
      setReplyText('');

      setTimeout(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };


  const fetchInboxEmails = async () => {
    const isFirstLoad = inboxEmails.length === 0;
    if (isFirstLoad) setInboxInitialLoading(true);
    setInboxLoading(true);
    setInboxError(null);
    try {
      const res = await getInboxEmails(20);
      const emails = (Array.isArray(res) ? res : (res?.data || []));
      const gmailOnly = emails.filter(m => !m.source || m.source === 'GMAIL_INBOX');
      setInboxEmails(gmailOnly);
    } catch (err) {
      setInboxError(err?.response?.data?.message || err.message || 'Erreur de connexion Gmail');
    } finally {
      setInboxLoading(false);
      setInboxInitialLoading(false);
    }
  };


  const fetchInboxEmailsSilent = async () => {
    try {
      const res = await getInboxEmails(20);
      const emails = (Array.isArray(res) ? res : (res?.data || []));
      const gmailOnly = emails.filter(m => !m.source || m.source === 'GMAIL_INBOX');
      setInboxEmails(gmailOnly);
    } catch (_) {

    }
  };


  const forceRefreshInbox = async () => {
    setInboxLoading(true);
    setInboxError(null);

    try {
      const res = await refreshMessages(20);
      const emails = (Array.isArray(res) ? res : (res?.data || []));
      const gmailOnly = emails.filter(m => !m.source || m.source === 'GMAIL_INBOX');
      setInboxEmails(gmailOnly);
    } catch (err) {
      setInboxError(err?.response?.data?.message || err.message || 'Erreur de connexion Gmail');
    } finally {
      setInboxLoading(false);
    }
  };

  const handleInboxReply = async () => {
    if (!inboxReplyText.trim() || !selectedInboxEmail) return;
    setInboxReplyLoading(true);
    try {
      const emailKey = String(selectedInboxEmail.id ?? selectedInboxEmail.messageNumber ?? '');
      await replyToMessage({
        id: emailKey,
        source: 'GMAIL_INBOX',
        replyText: inboxReplyText,
        toEmail: selectedInboxEmail.replyToEmail ?? selectedInboxEmail.fromEmail ?? selectedInboxEmail.from,
        toName: selectedInboxEmail.replyToName ?? selectedInboxEmail.fromName ?? '',
        originalSubject: selectedInboxEmail.subject,
      });

      const adminBubble = {
        direction: 'ADMIN',
        senderName: 'InfoAcademy',
        text: inboxReplyText,
        sentAt: new Date().toISOString(),
      };
      setInboxConversations(prev => ({
        ...prev,
        [emailKey]: [...(prev[emailKey] || []), adminBubble],
      }));
      setInboxReplySuccess(true);
      setInboxReplyText('');
      setTimeout(() => {
        inboxConvEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setInboxReplySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erreur envoi réponse Gmail:', err);
    } finally {
      setInboxReplyLoading(false);
    }
  };

  const togglePinEmail = (emailKey) => {
    setPinnedEmails(prev => {
      const next = new Set(prev);
      if (next.has(emailKey)) next.delete(emailKey);
      else next.add(emailKey);
      return next;
    });
  };

  const toggleArchiveEmail = (emailKey) => {
    setArchivedEmails(prev => {
      const next = new Set(prev);
      if (next.has(emailKey)) next.delete(emailKey);
      else next.add(emailKey);
      return next;
    });
    if (selectedInboxEmail && String(selectedInboxEmail.id ?? selectedInboxEmail.messageNumber ?? '') === emailKey) {
      setSelectedInboxEmail(null);
    }
  };

  const deleteInboxEmail = async (emailKey) => {

    setInboxEmails(prev => prev.filter(e => String(e.id ?? e.messageNumber ?? '') !== emailKey));
    if (selectedInboxEmail && String(selectedInboxEmail.id ?? selectedInboxEmail.messageNumber ?? '') === emailKey) {
      setSelectedInboxEmail(null);
    }

    try {
      await apiDeleteGmailMessage(emailKey);
    } catch (err) {
      console.error('Erreur suppression email Gmail:', err);
    }
  };

  const handleSendNewEmail = async () => {
    if (!composeData.to.trim() || !composeData.subject.trim() || !composeData.body.trim()) return;
    setComposeSending(true);
    try {
      await replyToMessage({
        id: 'compose_new',
        source: 'GMAIL_INBOX',
        replyText: composeData.body,
        toEmail: composeData.to,
        toName: '',
        originalSubject: composeData.subject,
      });
      setComposeSent(true);
      setTimeout(() => {
        setShowCompose(false);
        setComposeSent(false);
        setComposeData({ to: '', subject: '', body: '' });
        forceRefreshInbox();
      }, 2000);
    } catch (err) {
      console.error('Erreur envoi email:', err);
    } finally {
      setComposeSending(false);
    }
  };


  const handleDeleteContactMessage = (id, name) => {
    setConfirmModal({
      open: true,
      title: 'Supprimer le message',
      message: `Supprimer le message de "${name}" ? Cette action est irréversible.`,
      danger: true,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await apiDeleteContactMessage(id);
          setContactMessages(prev => prev.filter(m => m.id !== id));
          if (selectedMessage?.id === id) setSelectedMessage(null);
        } catch (err) { console.error(err); }
      },
    });
  };

  

  if (!codeVerified) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-950">
        <Navbar />
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-500/[0.04] rounded-full blur-3xl" />
        </div>

        <div className="flex-1 flex items-center justify-center mt-16 relative z-10 px-4">
          <div className={`glass-card rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in ${codeShake ? 'animate-shake' : ''}`}>
            {}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl blur-lg" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/25">
                  <Lock className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            {}
            <h2 className="text-xl font-extrabold text-white text-center mb-1">Accès Administrateur</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              Entrez le code secret pour accéder au panneau d'administration
            </p>

            {/* Form */}
            <form onSubmit={handleCodeSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <KeyRound className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  Code secret
                </label>
                <input
                  type="password"
                  value={secretInput}
                  onChange={(e) => { setSecretInput(e.target.value); setCodeError(''); }}
                  placeholder="Entrez le code secret..."
                  autoFocus
                  className="w-full px-4 py-3.5 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm tracking-widest"
                />
              </div>

              {/* Error message */}
              {codeError && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{codeError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Vérifier et accéder
              </button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-6">
              <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />
              Accès restreint — Administrateurs autorisés uniquement
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ───── Loading state ───── */

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center mt-16">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Chargement du tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ───── Render ───── */

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />
      <ScrollToTop />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-3xl" />
      </div>

      <main className="flex-1 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">Administration</h1>
                <p className="text-sm text-gray-500">Gérer la plateforme d'apprentissage</p>
              </div>
            </div>
          </div>

          {}
          <div className="flex gap-1 mb-8 p-1 glass-card rounded-2xl w-full animate-fade-in" style={{ animationDelay: '100ms' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 shadow-lg shadow-indigo-500/5'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge === 'pending' && newTestimonialsCount > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white rounded-full leading-none">
                    {newTestimonialsCount}
                  </span>
                )}
                {tab.badge === 'comments' && newCommentsCount > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-indigo-500 text-white rounded-full leading-none">
                    {newCommentsCount}
                  </span>
                )}
                {tab.badge === 'messages' && unreadMessagesCount > 0 && (
                  <span className="ml-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white rounded-full leading-none">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard icon={Users} label="Utilisateurs" value={stats?.totalUsers} gradient="from-blue-500 to-cyan-500" delay={0} />
                <StatCard icon={BookOpen} label="Cours" value={stats?.totalCourses} gradient="from-indigo-500 to-purple-500" delay={50} />
                <StatCard icon={Layers} label="Sections" value={stats?.totalSections} gradient="from-emerald-500 to-teal-500" delay={100} />
                <StatCard icon={Video} label="Vidéos" value={stats?.totalVideos} gradient="from-amber-500 to-orange-500" delay={150} />
                <StatCard icon={Star} label="Avis en attente" value={pendingCount} gradient="from-yellow-500 to-amber-500" delay={300} />
                <StatCard icon={Mail} label="Messages support" value={contactMessages.length} gradient="from-rose-500 to-red-600" delay={350} />
              </div>

              {}
              <div className="grid md:grid-cols-2 gap-6">
                {}
                <div className="glass-card rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      Derniers utilisateurs
                    </h3>
                    <button onClick={() => setActiveTab('users')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                      Voir tout <Eye className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {users.slice(0, 5).map(u => (
                      <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/30 transition-all">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                          <UserCircle className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{u.username}</p>
                          <p className="text-xs text-gray-600 truncate">{u.email}</p>
                        </div>
                        {u.role === 'ADMIN' && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20">
                            ADMIN
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {}
                <div className="glass-card rounded-2xl p-5 animate-fade-in" style={{ animationDelay: '350ms' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      Cours récents
                    </h3>
                    <button onClick={() => setActiveTab('courses')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                      Voir tout <Eye className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {courses.slice(0, 5).map(c => (
                      <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/30 transition-all">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{c.title}</p>
                          <p className="text-xs text-gray-600 truncate">{c.description || 'Aucune description'}</p>
                        </div>
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <p className="text-sm text-gray-600 text-center py-4">Aucun cours créé</p>
                    )}
                  </div>
                </div>
              </div>

              {}
              {pendingCount > 0 && (
                <div className="glass-card rounded-2xl p-5 animate-fade-in border border-amber-500/20" style={{ animationDelay: '400ms' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      Avis en attente de modération
                      <span className="ml-1 px-2 py-0.5 bg-amber-500/15 text-amber-400 text-xs font-bold rounded-full border border-amber-500/25">
                        {pendingCount}
                      </span>
                    </h3>
                    <button onClick={() => { setActiveTab('testimonials'); setTestimonialFilter('pending'); }} className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                      Voir tout <Eye className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {testimonials.filter(t => !t.approved && !t.rejected).slice(0, 4).map(t => (
                      <div key={t.id} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-800/30 transition-all">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5" style={getAvatarStyle(t.name)}>
                          {t.avatar || getInitials(t.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{t.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 italic mt-0.5">"{t.text}"</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleApproveTestimonial(t.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            title="Approuver"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectTestimonial(t.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Rejeter"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {}
          {activeTab === 'messages' && (
            <div className="space-y-4 animate-fade-in">


              {}
              {messagesSubTab === 'inbox' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">Emails reçus directement sur votre adresse Gmail</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowArchived(v => !v)}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-medium transition-all ${showArchived ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25' : 'bg-gray-700/30 border-gray-700/50 text-gray-400 hover:bg-gray-700/50'}`}
                      >
                        <Archive className="w-3.5 h-3.5" />
                        {showArchived ? 'Masquer archivés' : 'Archivés'}
                        {archivedEmails.size > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300">{archivedEmails.size}</span>}
                      </button>
                      <button
                        onClick={() => { setShowCompose(true); setComposeSent(false); setComposeData({ to: '', subject: '', body: '' }); setSelectedInboxEmail(null); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs font-medium text-emerald-300 hover:bg-emerald-500/25 transition-all"
                      >
                        <PenSquare className="w-3.5 h-3.5" />
                        Nouveau message
                      </button>
                      <button
                        onClick={forceRefreshInbox}
                        disabled={inboxLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-xs font-medium text-indigo-300 hover:bg-indigo-500/25 transition-all disabled:opacity-50"
                      >
                        {inboxLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Actualiser
                      </button>
                    </div>
                  </div>

                  {inboxError && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {inboxError}
                    </div>
                  )}

                  {inboxInitialLoading && !inboxError && inboxEmails.length === 0 && (
                    <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Connexion à Gmail…</span>
                    </div>
                  )}

                  {inboxLoading && inboxEmails.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Actualisation en cours…
                    </div>
                  )}

                  {!inboxLoading && !inboxError && inboxEmails.length === 0 && (
                    <div className="glass-card rounded-2xl py-16 flex flex-col items-center justify-center gap-3">
                      <Mail className="w-10 h-10 text-gray-700" />
                      <p className="text-gray-500 text-sm">Aucun email dans la boîte de réception</p>
                      <button onClick={fetchInboxEmails} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Charger les emails</button>
                    </div>
                  )}

                  {inboxEmails.length > 0 && (
                    <div className="grid lg:grid-cols-5 gap-4">
                      {}
                      <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto pr-1">
                        {[...inboxEmails]
                          .filter(e => {
                            const k = String(e.id ?? e.messageNumber ?? '');
                            return showArchived ? archivedEmails.has(k) : !archivedEmails.has(k);
                          })
                          .sort((a, b) => {
                            const ka = String(a.id ?? a.messageNumber ?? '');
                            const kb = String(b.id ?? b.messageNumber ?? '');
                            return (pinnedEmails.has(kb) ? 1 : 0) - (pinnedEmails.has(ka) ? 1 : 0);
                          })
                          .map((email, idx) => {
                            const emailKey = String(email.id ?? email.messageNumber ?? idx);
                            const isSelected = selectedInboxEmail
                              ? String(selectedInboxEmail.id ?? selectedInboxEmail.messageNumber) === emailKey
                              : false;

                            const preview = email.body
                              ? email.body.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80)
                              : '';
                            return (
                              <div
                                key={emailKey}
                                onClick={() => {
                                  setSelectedInboxEmail(email);
                                  setReadEmails(prev => {
                                    const next = new Set(prev);
                                    next.add(emailKey);
                                    try { localStorage.setItem('infoacademy_read_emails', JSON.stringify([...next])); } catch { }
                                    return next;
                                  });
                                  setInboxReplyText('');
                                  setInboxReplySuccess(false);

                                  setInboxConversations(prev => {

                                    return {
                                      ...prev,
                                      [emailKey]: parseThreadIntoBubbles(email),
                                    };
                                  });

                                  setTimeout(() => inboxConvEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                                }}
                                className={`glass-card rounded-xl p-4 cursor-pointer transition-all hover:border-gray-600/60 ${isSelected ? 'border-indigo-500/40 bg-indigo-500/5' : !(email.read || readEmails.has(emailKey)) ? 'border-l-2 border-l-indigo-400 bg-indigo-500/[0.03]' : 'opacity-75'
                                  } ${pinnedEmails.has(emailKey) ? 'border-yellow-500/30' : ''}`}
                              >
                                <div className="flex items-start gap-3">
                                  {(() => {
                                    const isRead = email.read || readEmails.has(emailKey); return (<>
                                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isRead ? 'bg-gray-800/60' : 'bg-indigo-500/15'}`}>
                                        <Mail className={`w-4 h-4 ${isRead ? 'text-gray-500' : 'text-indigo-400'}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                          <p className={`text-sm truncate ${!isRead ? 'text-white font-bold' : 'text-gray-400 font-normal'}`}>
                                            {email.fromName || email.from}
                                          </p>
                                          <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {pinnedEmails.has(emailKey) && <Pin className="w-3 h-3 text-yellow-400" />}
                                            {!isRead
                                              ? <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
                                              : <MailOpen className="w-3 h-3 text-gray-600 flex-shrink-0" />
                                            }
                                          </div>
                                        </div>
                                        <p className={`text-xs truncate mb-1 ${!isRead ? 'text-indigo-300 font-medium' : 'text-gray-500'}`}>{email.subject}</p>
                                        <p className="text-xs text-gray-600 truncate">{preview}</p>
                                        <div className="flex items-center justify-between mt-1.5">
                                          <span className="text-[10px] text-gray-700 truncate max-w-[120px]">{email.fromEmail || email.from}</span>
                                          <div className="flex items-center gap-2">
                                            {isRead
                                              ? <span className="text-[10px] text-gray-600 italic">Lu</span>
                                              : <span className="text-[10px] font-semibold text-indigo-400">Nouveau</span>
                                            }
                                            <span className="text-[10px] text-gray-700">
                                              {email.date ? new Date(email.date).toLocaleDateString('fr-FR') : '—'}
                                            </span>
                                          </div>
                                        </div>
                                        {}
                                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-800/50" onClick={e => e.stopPropagation()}>
                                          <button
                                            title={pinnedEmails.has(emailKey) ? 'Désépingler' : 'Épingler'}
                                            onClick={() => togglePinEmail(emailKey)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${pinnedEmails.has(emailKey) ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-gray-800/60 text-gray-500 hover:text-yellow-300 hover:bg-yellow-500/10'}`}
                                          >
                                            <Pin className="w-3 h-3" />
                                            {pinnedEmails.has(emailKey) ? 'Épinglé' : 'Épingler'}
                                          </button>
                                          <button
                                            title={archivedEmails.has(emailKey) ? 'Désarchiver' : 'Archiver'}
                                            onClick={() => toggleArchiveEmail(emailKey)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${archivedEmails.has(emailKey) ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-gray-800/60 text-gray-500 hover:text-amber-300 hover:bg-amber-500/10'}`}
                                          >
                                            <Archive className="w-3 h-3" />
                                            Archiver
                                          </button>
                                          <button
                                            title="Supprimer"
                                            onClick={() => deleteInboxEmail(emailKey)}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-gray-800/60 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            Supprimer
                                          </button>
                                        </div>
                                      </div>
                                    </>);
                                  })()}
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {}
                      <div className="lg:col-span-3">
                        {selectedInboxEmail ? (() => {
                          const emailKey = String(selectedInboxEmail.id ?? selectedInboxEmail.messageNumber ?? '');
                          const conversation = inboxConversations[emailKey] || [];
                          return (
                            <div className="glass-card rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: '520px', maxHeight: '75vh' }}>
                              {}
                              <div className="px-5 py-4 border-b border-gray-800/50 flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-bold text-white truncate mb-1">{selectedInboxEmail.subject}</h3>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {selectedInboxEmail.fromName || selectedInboxEmail.fromEmail || 'Inconnu'}</span>
                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedInboxEmail.fromEmail || selectedInboxEmail.from}</span>
                                    {selectedInboxEmail.date && (
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(selectedInboxEmail.date).toLocaleString('fr-FR')}</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => setSelectedInboxEmail(null)}
                                  className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-700/50 transition-all flex-shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {}
                              <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
                                {conversation.length === 0 && (
                                  <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-gray-600">Chargement de la conversation…</p>
                                  </div>
                                )}
                                {conversation.map((bubble, idx) => {
                                  const isAdmin = bubble.direction === 'ADMIN';
                                  const timeStr = bubble.sentAt
                                    ? new Date(bubble.sentAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                                    : '';
                                  return (
                                    <div key={idx} className={`flex gap-3 items-end ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                      {}
                                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isAdmin ? 'bg-indigo-500/25' : 'bg-gray-700/60'}`}>
                                        {isAdmin
                                          ? <Shield className="w-4 h-4 text-indigo-400" />
                                          : <User className="w-4 h-4 text-gray-400" />}
                                      </div>
                                      {}
                                      <div className={`max-w-[72%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                          <p className={`text-xs font-semibold ${isAdmin ? 'text-indigo-400' : 'text-gray-400'}`}>
                                            {isAdmin ? 'Admin (InfoAcademy)' : bubble.senderName}
                                          </p>
                                          {timeStr && <span className="text-[10px] text-gray-600">{timeStr}</span>}
                                        </div>
                                        <div className={`px-4 py-3 border ${isAdmin
                                          ? 'bg-indigo-500/15 border-indigo-500/25 rounded-2xl rounded-tr-sm'
                                          : 'bg-gray-800/70 border-gray-700/40 rounded-2xl rounded-tl-sm'
                                          }`}>
                                          {isAdmin ? (
                                            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{bubble.text}</p>
                                          ) : (() => {
                                            const parsed = parseContactNotification(bubble.rawHtml || bubble.text);
                                            if (parsed) return <ContactNotificationCard {...parsed} />;
                                            if (bubble.isHtml) return <EmailBody body={bubble.rawHtml} bodyType="html" />;
                                            return <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{bubble.text}</p>;
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                {}
                                <div ref={inboxConvEndRef} />
                              </div>

                              {}
                              <div className="px-5 py-4 border-t border-gray-800/50 bg-gray-900/40">
                                {inboxReplySuccess && (
                                  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
                                    <CheckCheck className="w-4 h-4" /> Réponse envoyée avec succès !
                                  </div>
                                )}
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Reply className="w-3.5 h-3.5" /> Répondre à {selectedInboxEmail.replyToEmail || selectedInboxEmail.fromEmail || selectedInboxEmail.from}
                                </p>
                                <textarea
                                  value={inboxReplyText}
                                  onChange={(e) => setInboxReplyText(e.target.value)}
                                  placeholder="Écrivez votre réponse…"
                                  rows={3}
                                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"
                                />
                                <div className="flex items-center justify-between mt-2">
                                  <p className="text-xs text-gray-600">Envoyé via Gmail SMTP</p>
                                  <button
                                    onClick={handleInboxReply}
                                    disabled={!inboxReplyText.trim() || inboxReplyLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {inboxReplyLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi…</> : <><Send className="w-3.5 h-3.5" /> Envoyer</>}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })() : showCompose ? (
                          
                          <div className="glass-card rounded-2xl overflow-hidden flex flex-col border border-emerald-500/20" style={{ minHeight: '520px', maxHeight: '75vh' }}>
                            {}
                            <div className="px-5 py-4 border-b border-gray-800/50 flex items-center justify-between">
                              <p className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                                <PenSquare className="w-4 h-4" /> Nouveau message
                              </p>
                              <button onClick={() => setShowCompose(false)} className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-700/50 transition-all">
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {composeSent && (
                              <div className="mx-5 mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
                                <CheckCheck className="w-4 h-4" /> Email envoyé avec succès !
                              </div>
                            )}

                            {}
                            <div className="border-b border-gray-800/50 px-5 py-3.5 flex items-center gap-3">
                              <span className="text-xs font-semibold text-gray-500 w-12 flex-shrink-0">À</span>
                              <input
                                value={composeData.to}
                                onChange={e => setComposeData(p => ({ ...p, to: e.target.value }))}
                                placeholder="Destinataire..."
                                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                              />
                            </div>
                            <div className="border-b border-gray-800/50 px-5 py-3.5 flex items-center gap-3">
                              <span className="text-xs font-semibold text-gray-500 w-12 flex-shrink-0">Sujet</span>
                              <input
                                value={composeData.subject}
                                onChange={e => setComposeData(p => ({ ...p, subject: e.target.value }))}
                                placeholder="Sujet du message..."
                                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                              />
                            </div>

                            {}
                            <div className="flex-1 px-5 py-4">
                              <textarea
                                value={composeData.body}
                                onChange={e => setComposeData(p => ({ ...p, body: e.target.value }))}
                                placeholder="Écrivez votre message..."
                                className="w-full h-full min-h-[200px] bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none"
                              />
                            </div>

                            {}
                            <div className="px-5 py-4 border-t border-gray-800/50 flex items-center gap-3">
                              <button
                                onClick={handleSendNewEmail}
                                disabled={composeSending || !composeData.to.trim() || !composeData.subject.trim() || !composeData.body.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {composeSending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi…</> : <><Send className="w-3.5 h-3.5" /> Envoyer</>}
                              </button>
                              <button
                                onClick={() => { setShowCompose(false); setComposeData({ to: '', subject: '', body: '' }); }}
                                className="ml-auto p-2.5 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Annuler"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="glass-card rounded-2xl flex flex-col items-center justify-center gap-3 text-center" style={{ minHeight: '520px' }}>
                            <div className="w-16 h-16 bg-gray-800/60 rounded-2xl flex items-center justify-center">
                              <Mail className="w-7 h-7 text-gray-600" />
                            </div>
                            <p className="text-gray-500 text-sm">Sélectionnez un email pour voir la conversation</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {}
            </div>
          )}
          {activeTab === 'users' && !selectedUserDetail && (
            <div className="space-y-4 animate-fade-in">
              {}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => { setSearchUser(e.target.value); setShowAllUsers(false); }}
                    placeholder="Rechercher un utilisateur..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-1 p-1 bg-gray-900/60 border border-gray-800/60 rounded-xl">
                  {[
                    { value: 'all', label: 'Tous' },
                    { value: 'ADMIN', label: '👑 Admins' },
                    { value: 'USER', label: 'Utilisateurs' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setUserRoleFilter(opt.value); setShowAllUsers(false); if (opt.value !== 'USER') setUserLevelFilter('all'); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${userRoleFilter === opt.value
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}</span>
              </div>

              {userRoleFilter === 'USER' && <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Niveau :</span>
                <div className="flex items-center gap-1 p-1 bg-gray-900/60 border border-gray-800/60 rounded-xl">
                  {[
                    { value: 'all', label: 'Tous' },
                    { value: 'débutant', label: '🟢 Débutant' },
                    { value: 'intermédiaire', label: '🟡 Intermédiaire' },
                    { value: 'avancé', label: '🔴 Avancé' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setUserLevelFilter(opt.value); setShowAllUsers(false); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${userLevelFilter === opt.value
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>}

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/60">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Utilisateur</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Email</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Rôle</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Niveau</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Inscrit le</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {(showAllUsers ? filteredUsers : filteredUsers.slice(0, 8)).map(u => (
                        <tr key={u.id} onClick={() => handleViewUser(u)} className={`hover:bg-gray-800/20 transition-colors ${u.role === 'ADMIN' ? 'cursor-default' : 'cursor-pointer'}`}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                                {u.profilePicture ? (
                                  <img src={`http://localhost:8080/uploads/avatars/${u.profilePicture}`} alt="" className="w-9 h-9 rounded-xl object-cover" />
                                ) : (
                                  <UserCircle className="w-5 h-5 text-indigo-400" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-white">{u.username}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-400">{u.email}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${u.role === 'ADMIN'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-gray-800/50 text-gray-400 border-gray-700/50'
                              }`}>
                              {u.role === 'ADMIN' ? '👑 Admin' : 'Utilisateur'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-400 capitalize">{u.role === 'ADMIN' ? '—' : (u.level || '—')}</span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRoleToggle(u.id, u.role); }}
                                className="p-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                                title={u.role === 'ADMIN' ? 'Rétrograder' : 'Promouvoir admin'}
                              >
                                <Crown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id, u.username); }}
                                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length > 8 && (
                  <div className="flex items-center justify-center py-4 border-t border-gray-800/40">
                    <button
                      onClick={() => setShowAllUsers(prev => !prev)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all"
                    >
                      {showAllUsers ? (
                        <><ChevronUp className="w-4 h-4" /> Masquer ({filteredUsers.length - 8} utilisateurs)</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" /> Voir tout ({filteredUsers.length - 8} de plus)</>
                      )}
                    </button>
                  </div>
                )}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun utilisateur trouvé</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {}
          {activeTab === 'users' && selectedUserDetail && (
            <div className="animate-fade-in space-y-6">
              {}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 border border-gray-800/60 transition-all"
                >
                  <ChevronUp className="w-4 h-4 -rotate-90" /> Retour
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    {selectedUserDetail.profilePicture
                      ? <img src={`http://localhost:8080/uploads/avatars/${selectedUserDetail.profilePicture}`} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                      : <UserCircle className="w-7 h-7 text-indigo-400" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedUserDetail.username}</h2>
                    <p className="text-sm text-gray-400">{selectedUserDetail.email}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${selectedUserDetail.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-gray-800/50 text-gray-400 border-gray-700/50'}`}>
                      {selectedUserDetail.role === 'ADMIN' ? '👑 Admin' : 'Utilisateur'}
                    </span>
                    {selectedUserDetail.role !== 'ADMIN' && selectedUserDetail.level && (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">{selectedUserDetail.level}</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedUserDetail._loading || userDetailLoading ? (
                <div className="flex items-center justify-center py-32">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                </div>
              ) : selectedUserDetail._error ? (
                <p className="text-center text-gray-500 py-16">Erreur lors du chargement des données.</p>
              ) : (
                <>
                  {}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Quiz', value: selectedUserDetail.totalQuizzes ?? 0, gradient: 'from-rose-500 to-pink-600', icon: Target },
                      { label: 'Exercices', value: selectedUserDetail.totalExercises ?? 0, gradient: 'from-amber-500 to-orange-500', icon: BookOpen },
                      { label: 'Conversations', value: selectedUserDetail.totalChats ?? 0, gradient: 'from-violet-500 to-fuchsia-600', icon: MessageSquare },
                      { label: 'Topics maîtrisés', value: selectedUserDetail.totalProgressTopics ?? 0, gradient: 'from-emerald-500 to-teal-500', icon: TrendingUp },
                    ].map(s => (
                      <div key={s.label} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${s.gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <s.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-3xl font-extrabold text-white">{s.value}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {}
                  <div className="grid md:grid-cols-2 gap-6">
                    {}
                    <div className="glass-card rounded-2xl p-6">
                      <button
                        onClick={() => toggleSection('progression')}
                        className="w-full text-base font-bold text-white mb-4 flex items-center justify-between gap-2"
                      >
                        <span className="flex items-center gap-2"><BarChart2 className="w-5 h-5 text-emerald-400" /> Progression par topic</span>
                        {collapsedSections.progression ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
                      </button>
                      {!collapsedSections.progression && (selectedUserDetail.progress?.length ? selectedUserDetail.progress.map(p => {
                        const raw = p.masteryScore || 0;
                        const pct = raw <= 1 ? raw * 100 : raw;
                        const clamped = Math.min(100, Math.max(0, pct));
                        return (
                          <div key={p.topic} className="mb-4 last:mb-0">
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="text-gray-300 capitalize font-medium">{p.topic}</span>
                              <span className="text-emerald-400 font-bold">{Math.round(clamped)}%</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                                style={{ width: `${clamped}%` }}
                              />
                            </div>
                          </div>
                        );
                      }) : <p className="text-sm text-gray-600 italic">Aucune progression enregistrée</p>)}
                    </div>

                    {}
                    <div className="glass-card rounded-2xl p-6">
                      <button
                        onClick={() => toggleSection('compte')}
                        className="w-full text-base font-bold text-white mb-4 flex items-center justify-between gap-2"
                      >
                        <span className="flex items-center gap-2"><User className="w-5 h-5 text-gray-400" /> Informations du compte</span>
                        {collapsedSections.compte ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
                      </button>
                      {!collapsedSections.compte && (
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'ID', value: `#${selectedUserDetail.id}`, mono: true },
                            { label: 'Rôle', value: selectedUserDetail.role },
                            { label: 'Niveau', value: selectedUserDetail.level || '—', capitalize: true },
                            { label: 'Inscrit le', value: selectedUserDetail.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleDateString('fr-FR') : '—' },
                            { label: 'Email', value: selectedUserDetail.email, full: true },
                          ].map(item => (
                            <div key={item.label} className={`${item.full ? 'col-span-2' : ''} bg-gray-800/40 rounded-xl p-3`}>
                              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                              <p className={`text-sm text-white font-medium truncate ${item.mono ? 'font-mono' : ''} ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {}
                    <div className="glass-card rounded-2xl p-6">
                      <button
                        onClick={() => toggleSection('quiz')}
                        className="w-full text-base font-bold text-white mb-4 flex items-center justify-between gap-2"
                      >
                        <span className="flex items-center gap-2"><Target className="w-5 h-5 text-rose-400" /> Quiz récents</span>
                        {collapsedSections.quiz ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
                      </button>
                      {!collapsedSections.quiz && (selectedUserDetail.recentQuizzes?.length ? (
                        <div className="space-y-3">
                          {selectedUserDetail.recentQuizzes.map((q, i) => (
                            <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-800/40 hover:bg-gray-800/60 transition-colors">
                              <div>
                                <p className="text-sm text-white font-medium capitalize">{q.topic}</p>
                                <p className="text-xs text-gray-500 capitalize mt-0.5">{q.level}</p>
                              </div>
                              <span className={`text-sm font-bold px-3 py-1 rounded-lg ${((q.score / q.totalQuestions) >= 0.7) ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                                {q.score}/{q.totalQuestions}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-600 italic">Aucun quiz</p>)}
                    </div>

                    {}
                    <div className="glass-card rounded-2xl p-6">
                      <button
                        onClick={() => toggleSection('exercices')}
                        className="w-full text-base font-bold text-white mb-4 flex items-center justify-between gap-2"
                      >
                        <span className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-amber-400" /> Exercices récents</span>
                        {collapsedSections.exercices ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
                      </button>
                      {!collapsedSections.exercices && (selectedUserDetail.recentExercises?.length ? (
                        <div className="space-y-3">
                          {selectedUserDetail.recentExercises.map(e => (
                            <div key={e.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-800/40 hover:bg-gray-800/60 transition-colors">
                              <div>
                                <p className="text-sm text-white font-medium capitalize">{e.topic}</p>
                                <p className="text-xs text-gray-500 capitalize mt-0.5">{e.level}</p>
                              </div>
                              <span className="text-xs text-gray-500">{e.createdAt ? new Date(e.createdAt).toLocaleDateString('fr-FR') : '—'}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-600 italic">Aucun exercice</p>)}
                    </div>

                    {}
                    <div className="glass-card rounded-2xl p-6 md:col-span-2">
                      <button
                        onClick={() => toggleSection('conversations')}
                        className="w-full text-base font-bold text-white mb-4 flex items-center justify-between gap-2"
                      >
                        <span className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-violet-400" /> Conversations chat</span>
                        {collapsedSections.conversations ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
                      </button>
                      {!collapsedSections.conversations && (selectedUserDetail.recentChats?.length ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedUserDetail.recentChats.map(c => (
                            <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-800/40 hover:bg-gray-800/60 transition-colors">
                              <p className="text-sm text-gray-300 truncate">{c.title || 'Sans titre'}</p>
                              <span className="text-xs text-gray-600 flex-shrink-0 ml-2">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : '—'}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-600 italic">Aucune conversation</p>)}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}



          {}
          {activeTab === 'courses' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchCourse}
                    onChange={(e) => setSearchCourse(e.target.value)}
                    placeholder="Rechercher un cours..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm"
                  />
                </div>
                <button
                  onClick={() => openCourseForm()}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" /> Nouveau cours
                </button>
                <button
                  onClick={() => setPlaylistModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/35 hover:scale-105 active:scale-95 transition-all"
                >
                  <Youtube className="w-4 h-4" /> Importer une playlist
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(showAllCourses ? filteredCourses : filteredCourses.slice(0, 9)).map(c => (
                  <div key={c.id} className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openCourseForm(c)}
                          className="p-1.5 rounded-lg text-gray-600 opacity-0 group-hover:opacity-100 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          className="p-1.5 rounded-lg text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-white mb-1 line-clamp-1">{c.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{c.description || 'Aucune description'}</p>
                    <div className="mt-3 pt-3 border-t border-gray-800/40 flex items-center gap-2 text-xs text-gray-600">
                      <Layers className="w-3 h-3" />
                      ID: {c.id}
                    </div>
                  </div>
                ))}
                {filteredCourses.length > 9 && (
                  <div className="flex justify-center py-4 border-t border-gray-800/40">
                    <button onClick={() => setShowAllCourses(p => !p)} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all">
                      {showAllCourses ? <><ChevronUp className="w-4 h-4" /> Masquer ({filteredCourses.length - 9} cours)</> : <><ChevronDown className="w-4 h-4" /> Voir tout ({filteredCourses.length - 9} de plus)</>}
                    </button>
                  </div>
                )}
                {filteredCourses.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun cours trouvé</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {}
          {activeTab === 'sections' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchSection}
                    onChange={(e) => setSearchSection(e.target.value)}
                    placeholder="Rechercher une section..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm"
                  />
                </div>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <select
                    value={filterSectionCourse}
                    onChange={(e) => setFilterSectionCourse(e.target.value)}
                    className="pl-9 pr-8 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-sm text-white outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all appearance-none cursor-pointer min-w-[180px]"
                  >
                    <option value="">Tous les cours</option>
                    {courses.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
                <button
                  onClick={() => openSectionForm()}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" /> Nouvelle section
                </button>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/60">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Section</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Cours</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Vidéo</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {(showAllSections ? filteredSections : filteredSections.slice(0, 9)).map(s => (
                        <tr key={s.id} className="hover:bg-gray-800/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg flex items-center justify-center">
                                <Layers className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{s.title}</p>
                                <p className="text-xs text-gray-600 line-clamp-1 max-w-xs">{s.summary || s.content || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-400">
                            {courses.find(c => c.id === s.courseId)?.title || `Cours #${s.courseId}`}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {s.videoUrl ? (
                              <span className="text-emerald-400 text-xs">✓ Oui</span>
                            ) : (
                              <span className="text-gray-600 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => openSectionForm(s)}
                                className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSection(s.id, s.title)}
                                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredSections.length > 9 && (
                  <div className="flex justify-center py-4 border-t border-gray-800/40">
                    <button onClick={() => setShowAllSections(p => !p)} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all">
                      {showAllSections ? <><ChevronUp className="w-4 h-4" /> Masquer ({filteredSections.length - 9} sections)</> : <><ChevronDown className="w-4 h-4" /> Voir tout ({filteredSections.length - 9} de plus)</>}
                    </button>
                  </div>
                )}
                {filteredSections.length === 0 && (
                  <div className="text-center py-12">
                    <Layers className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune section trouvée</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {}

          {activeTab === 'videos' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchVideo}
                    onChange={(e) => setSearchVideo(e.target.value)}
                    placeholder="Rechercher une vidéo..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm"
                  />
                </div>
                <button
                  onClick={() => openVideoForm()}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" /> Nouvelle vidéo
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(showAllVideos ? filteredVideos : filteredVideos.slice(0, 9)).map(v => {

                  const isLocal = v.youtubeUrl && (v.youtubeUrl.startsWith('/uploads/') || v.youtubeUrl.startsWith('http://localhost'));
                  const isYoutube = v.youtubeUrl && (v.youtubeUrl.includes('youtube.com') || v.youtubeUrl.includes('youtu.be'));


                  let ytThumb = v.thumbnailUrl;
                  if (!ytThumb && isYoutube) {
                    const match = v.youtubeUrl.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
                    if (match) ytThumb = `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
                  }


                  const toEmbed = (url) => {
                    if (!url) return null;
                    if (url.includes('embed')) return url;
                    const s = url.match(/youtu\.be\/([^?&]+)/);
                    if (s) return `https://www.youtube.com/embed/${s[1]}`;
                    const l = url.match(/[?&]v=([^&]+)/);
                    if (l) return `https://www.youtube.com/embed/${l[1]}`;
                    return url;
                  };

                  const canPlay = isLocal || isYoutube;

                  return (
                    <div key={v.id} className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 group">
                      {}
                      <div className="relative h-36 bg-gray-800/40 overflow-hidden">
                        {ytThumb ? (
                          <img src={ytThumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : isLocal ? (
                          
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                            <Video className="w-10 h-10 text-gray-600" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-10 h-10 text-gray-700" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {}
                        {canPlay && (
                          <button
                            onClick={() => setVideoModal({ open: true, video: v, embedUrl: isYoutube ? toEmbed(v.youtubeUrl) : null, localUrl: isLocal ? `http://localhost:8080${v.youtubeUrl}` : null })}
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all shadow-lg">
                              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                            </div>
                          </button>
                        )}

                        {}
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          <button
                            onClick={() => handleDeleteVideo(v.id, v.title)}
                            className="p-1.5 rounded-lg bg-black/50 text-gray-300 hover:text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {}
                        <div className="absolute top-2 left-2">
                          {isYoutube && (
                            <span className="text-[10px] bg-red-600/80 text-white px-1.5 py-0.5 rounded backdrop-blur-sm font-medium">YT</span>
                          )}
                          {isLocal && (
                            <span className="text-[10px] bg-indigo-600/80 text-white px-1.5 py-0.5 rounded backdrop-blur-sm font-medium">LOCAL</span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">{v.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{v.description || 'Aucune description'}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600">
                          <span>Cours #{v.courseId}</span>
                          {v.sectionId && <span>• Section #{v.sectionId}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredVideos.length > 9 && (
                  <div className="flex justify-center py-4 border-t border-gray-800/40">
                    <button onClick={() => setShowAllVideos(p => !p)} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all">
                      {showAllVideos ? <><ChevronUp className="w-4 h-4" /> Masquer ({filteredVideos.length - 9} vidéos)</> : <><ChevronDown className="w-4 h-4" /> Voir tout ({filteredVideos.length - 9} de plus)</>}
                    </button>
                  </div>
                )}
                {filteredVideos.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Video className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune vidéo trouvée</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {}
          {activeTab === 'testimonials' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchTestimonial}
                    onChange={(e) => setSearchTestimonial(e.target.value)}
                    placeholder="Rechercher un avis..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm"
                  />
                </div>
                {}
                <div className="flex items-center gap-1.5">
                  {[
                    { key: 'all', label: 'Tous', count: testimonials.length },
                    { key: 'pending', label: 'En attente', count: testimonials.filter(t => !t.approved && !t.rejected).length, color: 'amber' },
                    { key: 'approved', label: 'Approuvés', count: testimonials.filter(t => t.approved).length, color: 'emerald' },
                    { key: 'rejected', label: 'Rejetés', count: testimonials.filter(t => t.rejected).length, color: 'red' },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setTestimonialFilter(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${testimonialFilter === f.key
                        ? f.color === 'amber' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : f.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : f.color === 'red' ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-gray-500 hover:text-gray-300 border border-transparent hover:border-gray-700/60'
                        }`}
                    >
                      {f.label}
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${testimonialFilter === f.key ? 'bg-white/15' : 'bg-gray-800'
                        }`}>{f.count}</span>
                    </button>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{filteredTestimonials.length} avis</span>
              </div>

              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/60">
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Auteur</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Témoignage</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Note</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Statut</th>
                        <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Date</th>
                        <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {(showAllTestimonials ? filteredTestimonials : filteredTestimonials.slice(0, 9)).map(t => (
                        <tr key={t.id} className="hover:bg-gray-800/20 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={getAvatarStyle(t.name)}>
                                {t.avatar || getInitials(t.name)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{t.name}</p>
                                <p className="text-xs text-gray-600">{t.role || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 max-w-xs">
                            <p className="text-sm text-gray-400 line-clamp-2 italic">"{t.text}"</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {t.approved ? (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                ✓ Approuvé
                              </span>
                            ) : t.rejected ? (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full border bg-red-500/10 text-red-400 border-red-500/20">
                                ✕ Rejeté
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20">
                                ⏳ En attente
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">
                            {t.createdAt ? new Date(t.createdAt).toLocaleDateString('fr-FR') : '—'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 justify-end">
                              {!t.approved && (
                                <button
                                  onClick={() => handleApproveTestimonial(t.id)}
                                  className="p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                  title="Approuver"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {!t.rejected && (
                                <button
                                  onClick={() => handleRejectTestimonial(t.id)}
                                  className="p-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                                  title="Rejeter"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteTestimonial(t.id)}
                                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredTestimonials.length > 9 && (
                  <div className="flex justify-center py-4 border-t border-gray-800/40">
                    <button
                      onClick={() => setShowAllTestimonials(p => !p)}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all"
                    >
                      {showAllTestimonials
                        ? <><ChevronUp className="w-4 h-4" /> Masquer ({filteredTestimonials.length - 9} avis)</>
                        : <><ChevronDown className="w-4 h-4" /> Voir tout ({filteredTestimonials.length - 9} de plus)</>
                      }
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}


          {}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-lg font-bold text-white">Gestion des commentaires</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchComment}
                    onChange={e => setSearchComment(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-9 pr-4 py-2 bg-gray-900/60 border border-gray-800/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 w-56"
                  />
                </div>
              </div>

              <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800/60">
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Auteur</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commentaire</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cible</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Likes</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                        <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {adminComments
                        .filter(c =>
                          searchComment === '' ||
                          c.content?.toLowerCase().includes(searchComment.toLowerCase()) ||
                          c.authorUsername?.toLowerCase().includes(searchComment.toLowerCase())
                        )
                        .slice(0, showAllComments ? undefined : 9)
                        .map(comment => (
                          <tr key={comment.id} className="hover:bg-gray-800/20 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md"
                                  style={comment.authorAvatar ? {} : getAvatarStyle(comment.authorUsername)}
                                >
                                  {comment.authorAvatar
                                    ? <img src={`http://localhost:8080/uploads/avatars/${comment.authorAvatar}`} alt="" className="w-9 h-9 rounded-xl object-cover" />
                                    : getInitials(comment.authorUsername)}
                                </div>
                                <span className="text-white font-medium text-xs">{comment.authorUsername}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 max-w-xs">
                              <p className="text-gray-300 text-xs line-clamp-2">{comment.content}</p>
                              {comment.edited && <span className="text-xs text-gray-600">(modifié)</span>}
                            </td>
                            <td className="px-5 py-3.5">
                              {comment.sectionId ? (
                                <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">Section #{comment.sectionId}</span>
                              ) : comment.courseId ? (
                                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">Cours #{comment.courseId}</span>
                              ) : (
                                <span className="text-xs text-gray-600">—</span>
                              )}
                              {comment.parentId && (
                                <span className="ml-1 text-xs text-gray-600">↩ réponse</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs text-gray-400">{comment.likesCount || 0} ❤️</span>
                            </td>
                            <td className="px-5 py-3.5">
                              {comment.pinned ? (
                                <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">📌 Épinglé</span>
                              ) : (
                                <span className="text-xs text-gray-600">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      await toggleCommentPin(comment.id);
                                      const updated = await getAllCommentsAdmin();
                                      setAdminComments(Array.isArray(updated) ? updated : []);
                                    } catch (e) { console.error(e); }
                                  }}
                                  className="p-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                                  title={comment.pinned ? 'Désépingler' : 'Épingler'}
                                >
                                  <Pin className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setConfirmModal({
                                    open: true,
                                    title: 'Supprimer le commentaire',
                                    message: `Supprimer le commentaire de "${comment.authorUsername}" ?`,
                                    danger: true,
                                    onConfirm: async () => {
                                      try {
                                        await apiDeleteComment(comment.id);
                                        setAdminComments(prev => prev.filter(c => c.id !== comment.id));
                                        setConfirmModal({ open: false });
                                      } catch (e) { console.error(e); }
                                    }
                                  })}
                                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {(() => {
                  const filtered = adminComments.filter(c => searchComment === '' || c.content?.toLowerCase().includes(searchComment.toLowerCase()) || c.authorUsername?.toLowerCase().includes(searchComment.toLowerCase())); return filtered.length > 9 && (
                    <div className="flex justify-center py-4 border-t border-gray-800/40">
                      <button onClick={() => setShowAllComments(p => !p)} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/20 transition-all">
                        {showAllComments ? <><ChevronUp className="w-4 h-4" /> Masquer ({filtered.length - 9} commentaires)</> : <><ChevronDown className="w-4 h-4" /> Voir tout ({filtered.length - 9} de plus)</>}
                      </button>
                    </div>
                  );
                })()}
                {adminComments.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun commentaire</p>
                  </div>
                )}
              </div>
            </div>
          )}


        </div>
      </main>

      {}
      {videoFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-5 max-w-lg w-full mx-4 shadow-2xl max-h-[96vh] overflow-y-auto custom-scroll">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Nouvelle vidéo</h3>
              <button onClick={() => setVideoFormOpen(false)} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/50 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">

              {}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Cours</label>
                  <div className="relative">
                    <select
                      value={videoFormValues.courseId}
                      onChange={e => setVideoFormValues(prev => ({ ...prev, courseId: e.target.value, sectionId: '' }))}
                      className="w-full px-3 py-2.5 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm appearance-none"
                    >
                      <option value="">Sélectionner</option>
                      {courses.map(c => <option key={c.id} value={c.id.toString()}>{c.title}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Section</label>
                  <div className="relative">
                    <select
                      value={videoFormValues.sectionId}
                      onChange={e => setVideoFormValues(prev => ({ ...prev, sectionId: e.target.value }))}
                      disabled={!videoFormValues.courseId}
                      className="w-full px-3 py-2.5 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {videoFormValues.courseId ? 'Optionnel' : 'Choisir cours'}
                      </option>
                      {sections
                        .filter(s => s.courseId?.toString() === videoFormValues.courseId)
                        .map(s => <option key={s.id} value={s.id.toString()}>{s.title}</option>)
                      }
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Titre</label>
                <input
                  type="text"
                  value={videoFormValues.title}
                  onChange={e => setVideoFormValues(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Introduction aux listes"
                  className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm"
                />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={videoFormValues.description}
                  onChange={e => setVideoFormValues(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de la vidéo..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm resize-none"
                />
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Source de la vidéo</label>
                {}
                <div className="flex rounded-xl overflow-hidden border border-gray-800/60 mb-2">
                  <button
                    type="button"
                    onClick={() => { setVideoSourceMode('youtube'); setLocalVideoFile(null); setLocalVideoPreview(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-all ${videoSourceMode === 'youtube' ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' : 'bg-gray-900/60 text-gray-500 hover:text-gray-300'}`}
                  >
                    <Youtube className="w-4 h-4" /> URL YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => { setVideoSourceMode('local'); setVideoFormValues(prev => ({ ...prev, youtubeUrl: '' })); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${videoSourceMode === 'local' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'bg-gray-900/60 text-gray-500 hover:text-gray-300'}`}
                  >
                    <Video className="w-4 h-4" /> Fichier local
                  </button>
                </div>

                {videoSourceMode === 'youtube' ? (
                  <input
                    type="text"
                    value={videoFormValues.youtubeUrl}
                    onChange={e => setVideoFormValues(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-red-500/40 focus:ring-2 focus:ring-red-500/15 transition-all text-sm"
                  />
                ) : (
                  <div>
                    <input
                      ref={videoFileRef}
                      type="file"
                      accept="video/*"
                      onChange={handleLocalVideoChange}
                      className="hidden"
                    />
                    {localVideoFile ? (
                      <div className="rounded-xl overflow-hidden border border-indigo-500/30 bg-gray-900/60">
                        <video src={localVideoPreview} className="w-full max-h-36 object-cover" controls />
                        <div className="px-3 py-2 flex items-center justify-between">
                          <span className="text-xs text-gray-400 truncate">{localVideoFile.name}</span>
                          <button type="button" onClick={() => { setLocalVideoFile(null); setLocalVideoPreview(null); }} className="ml-2 text-gray-600 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => videoFileRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center gap-1 text-gray-500 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                      >
                        <Video className="w-6 h-6" />
                        <span className="text-sm">Cliquez pour choisir une vidéo</span>
                        <span className="text-xs">MP4, WebM, AVI, MOV…</span>
                      </button>
                    )}
                    {videoFormLoading && videoUploadProgress > 0 && videoUploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Upload en cours…</span><span>{videoUploadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300" style={{ width: `${videoUploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Miniature (optionnel)</label>
                {}
                <div className="flex rounded-xl overflow-hidden border border-gray-800/60 mb-2">
                  <button
                    type="button"
                    onClick={() => { setThumbSourceMode('url'); setLocalThumbFile(null); setLocalThumbPreview(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium transition-all ${thumbSourceMode === 'url' ? 'bg-indigo-500/20 text-indigo-400 border-b-2 border-indigo-500' : 'bg-gray-900/60 text-gray-500 hover:text-gray-300'}`}
                  >
                    <Link className="w-3.5 h-3.5" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => { setThumbSourceMode('local'); setVideoFormValues(prev => ({ ...prev, thumbnailUrl: '' })); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium transition-all ${thumbSourceMode === 'local' ? 'bg-indigo-500/20 text-indigo-400 border-b-2 border-indigo-500' : 'bg-gray-900/60 text-gray-500 hover:text-gray-300'}`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Fichier local
                  </button>
                </div>

                {thumbSourceMode === 'url' ? (
                  <input
                    type="text"
                    value={videoFormValues.thumbnailUrl}
                    onChange={e => setVideoFormValues(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 transition-all text-sm"
                  />
                ) : (
                  <div>
                    <input
                      ref={thumbFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLocalThumbChange}
                      className="hidden"
                    />
                    {localThumbFile ? (
                      <div className="rounded-xl overflow-hidden border border-indigo-500/30 bg-gray-900/60">
                        <img src={localThumbPreview} alt="preview" className="w-full max-h-28 object-cover" />
                        <div className="px-3 py-2 flex items-center justify-between">
                          <span className="text-xs text-gray-400 truncate">{localThumbFile.name}</span>
                          <button type="button" onClick={() => { setLocalThumbFile(null); setLocalThumbPreview(null); }} className="ml-2 text-gray-600 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => thumbFileRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center gap-1 text-gray-500 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all"
                      >
                        <Eye className="w-5 h-5" />
                        <span className="text-sm">Choisir une image</span>
                        <span className="text-xs">JPG, PNG, WebP…</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setVideoFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitVideoForm}
                  disabled={videoFormLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {videoFormLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {videoModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setVideoModal({ open: false, video: null })}
        >
          <div
            className="relative w-full max-w-3xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/60"
            onClick={e => e.stopPropagation()}
          >
            {}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{videoModal.video?.title}</h3>
                  {videoModal.video?.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{videoModal.video.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setVideoModal({ open: false, video: null })}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {}
            <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
              {videoModal.embedUrl ? (
                
                <iframe
                  src={`${videoModal.embedUrl}?autoplay=1`}
                  title={videoModal.video?.title}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoModal.localUrl ? (
                
                <video
                  src={videoModal.localUrl}
                  controls
                  autoPlay
                  className="absolute inset-0 w-full h-full"
                  style={{ objectFit: 'contain' }}
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : null}
            </div>

            {}
            <div className="px-5 py-3 flex items-center gap-3 text-xs text-gray-600">
              <span>Cours #{videoModal.video?.courseId}</span>
              {videoModal.video?.sectionId && <span>• Section #{videoModal.video.sectionId}</span>}
              <span className="ml-auto">Appuyez sur Échap ou cliquez en dehors pour fermer</span>
            </div>
          </div>
        </div>
      )}

      {}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        danger={confirmModal.danger}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ open: false })}
      />

      <FormModal
        open={formModal.open}
        title={formModal.title}
        fields={formModal.fields || []}
        values={formValues}
        onChange={(name, value) => {
          setFormValues(prev => {
            const next = { ...prev, [name]: value };
            formValuesRef.current = next;
            return next;
          });
        }}
        onSubmit={formModal.onSubmit}
        onCancel={() => setFormModal({ open: false })}
        loading={formLoading}
      />

      {}
      {playlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-950 border border-gray-800/60 rounded-2xl shadow-2xl w-full max-w-lg">
            {}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Youtube className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">Importer une playlist YouTube</h2>
                  <p className="text-gray-500 text-xs mt-0.5">Crée un cours + une section par vidéo</p>
                </div>
              </div>
              <button onClick={closePlaylistModal} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {}
            <div className="px-6 py-5 space-y-4">
              {}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">URL de la playlist</label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={playlistUrl}
                    onChange={e => setPlaylistUrl(e.target.value)}
                    placeholder="https://www.youtube.com/playlist?list=PLxxxx"
                    disabled={playlistImporting || !!playlistResult}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-red-500/40 focus:ring-2 focus:ring-red-500/15 transition-all text-sm disabled:opacity-50"
                  />
                </div>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Clé API YouTube Data v3
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={playlistApiKey}
                    onChange={e => setPlaylistApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    disabled={playlistImporting || !!playlistResult}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900/60 border border-gray-800/60 rounded-xl text-white placeholder-gray-600 outline-none focus:border-red-500/40 focus:ring-2 focus:ring-red-500/15 transition-all text-sm disabled:opacity-50"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Obtenez une clé gratuite sur{' '}
                  <a href="https://console.developers.google.com" target="_blank" rel="noreferrer"
                    className="text-red-400 hover:underline">console.developers.google.com</a>
                </p>
              </div>

              {}
              {playlistError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{playlistError}</span>
                </div>
              )}

              {}
              {playlistResult && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-green-400 font-medium text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Import réussi !
                  </div>
                  <p className="text-white text-sm font-semibold">{playlistResult.courseTitle}</p>
                  <p className="text-gray-400 text-xs">{playlistResult.sectionsCreated} section(s) créée(s)</p>
                  {playlistResult.sectionTitles?.length > 0 && (
                    <ul className="mt-2 max-h-32 overflow-y-auto space-y-1">
                      {playlistResult.sectionTitles.map((t, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Play className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="line-clamp-1">{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {}
            <div className="px-6 pb-5 flex justify-end gap-2">
              <button
                onClick={closePlaylistModal}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all"
              >
                {playlistResult ? 'Fermer' : 'Annuler'}
              </button>
              {!playlistResult && (
                <button
                  onClick={handleImportPlaylist}
                  disabled={playlistImporting}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/35 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {playlistImporting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Import en cours…</>
                  ) : (
                    <><Youtube className="w-4 h-4" /> Importer</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;