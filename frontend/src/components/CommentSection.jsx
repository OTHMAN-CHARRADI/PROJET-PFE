import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import {
    MessageSquare, Heart, Reply, Trash2, Edit3, Pin,
    ChevronDown, ChevronUp, Send, X, AlertCircle,
    Loader2, MoreVertical, Shield, Sparkles
} from 'lucide-react';
import api from '../service/Api';


const fetchComments = (type, id) => api.get(`/api/comments/${type}/${id}`).then(r => r.data);
const postComment = (data) => api.post('/api/comments', data).then(r => r.data);
const putComment = (id, content) => api.put(`/api/comments/${id}`, { content }).then(r => r.data);
const deleteComment = (id) => api.delete(`/api/comments/${id}`).then(r => r.data);
const likeComment = (id) => api.post(`/api/comments/${id}/like`).then(r => r.data);
const pinComment = (id) => api.post(`/api/comments/${id}/pin`).then(r => r.data);


const timeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} j`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const avatarInitials = (username) => (username ? username.substring(0, 2).toUpperCase() : '?');

const AVATAR_COLORS = [
    'from-indigo-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-cyan-500 to-blue-500',
    'from-rose-500 to-pink-500',
    'from-purple-500 to-fuchsia-500',
];
const avatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

const buildAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    const path = avatar.startsWith('/') ? avatar : `/uploads/avatars/${avatar}`;
    return `http://localhost:8080${path}`;
};


const Avatar = ({ user, size = 'md' }) => {
    const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-10 h-10 text-sm' : 'w-9 h-9 text-sm';
    const [imgError, setImgError] = useState(false);
    const avatarUrl = buildAvatarUrl(user?.authorAvatar);
    if (avatarUrl && !imgError) {
        return (
            <img
                src={avatarUrl}
                alt={user.authorUsername}
                className={`${sz} rounded-full object-cover flex-shrink-0 ring-2 ring-gray-800`}
                onError={() => setImgError(true)}
            />
        );
    }
    return (
        <div className={`${sz} rounded-full bg-gradient-to-br ${avatarColor(user?.authorId)} flex items-center justify-center text-white font-bold flex-shrink-0 ring-2 ring-gray-800`}>
            {avatarInitials(user?.authorUsername)}
        </div>
    );
};


const CommentInput = ({ placeholder, onSubmit, onCancel, autoFocus = false, initialValue = '', compact = false }) => {
    const [text, setText] = useState(initialValue);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const ref = useRef(null);

    useEffect(() => { if (autoFocus && ref.current) ref.current.focus(); }, [autoFocus]);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try { await onSubmit(text.trim()); setText(''); }
        finally { setLoading(false); }
    };

    return (
        <div className="flex-1">
            <div className={`relative rounded-xl border transition-all duration-200 ${focused ? 'border-indigo-500/60 ring-1 ring-indigo-500/20 bg-gray-800/70' : 'border-gray-700/50 bg-gray-800/40'}`}>
                <textarea
                    ref={ref}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
                        if (e.key === 'Escape' && onCancel) onCancel();
                    }}
                    placeholder={placeholder || 'Écrire un commentaire...'}
                    rows={compact && !focused ? 1 : 2}
                    className="w-full bg-transparent px-4 py-3 pr-12 text-sm text-gray-200 placeholder-gray-500 focus:outline-none resize-none transition-all"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!text.trim() || loading}
                    className="absolute right-2 bottom-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700/60 disabled:cursor-not-allowed rounded-lg text-white transition-all"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-[11px] text-gray-600">Ctrl+Entrée pour envoyer</span>
                {onCancel && (
                    <button onClick={onCancel} className="text-[11px] text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
                        <X className="w-3 h-3" /> Annuler
                    </button>
                )}
            </div>
        </div>
    );
};


const CommentItem = ({ comment, currentUser, isAdmin, onUpdate, depth = 0, highlighted = false, targetCommentId = null }) => {
    const [showReplies, setShowReplies] = useState(true);
    const [replying, setReplying] = useState(false);
    const [editing, setEditing] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [flash, setFlash] = useState(highlighted);
    const menuRef = useRef(null);
    const itemRef = useRef(null);

    useEffect(() => {
        if (highlighted && itemRef.current) {
            const t1 = setTimeout(() => {
                itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            setFlash(true);
            const t2 = setTimeout(() => setFlash(false), 2500);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [highlighted]);

    const isOwner = currentUser?.id === comment.authorId;
    const isLiked = comment.likedByUserIds?.includes(currentUser?.id);

    useEffect(() => {
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLike = async () => {
        try { const updated = await likeComment(comment.id); onUpdate(updated, 'update'); }
        catch (e) { console.error(e); }
    };

    const handleDelete = async () => {
        if (!window.confirm('Supprimer ce commentaire ?')) return;
        try { await deleteComment(comment.id); onUpdate(comment, 'delete'); }
        catch (e) { console.error(e); }
        setMenuOpen(false);
    };

    const handlePin = async () => {
        try { const updated = await pinComment(comment.id); onUpdate(updated, 'update'); }
        catch (e) { console.error(e); }
        setMenuOpen(false);
    };

    const handleEdit = async (newContent) => {
        try { const updated = await putComment(comment.id, newContent); onUpdate(updated, 'update'); setEditing(false); }
        catch (e) { console.error(e); }
    };

    const handleReply = async (content) => {
        try {
            const req = { content, parentId: comment.id };
            if (comment.courseId) req.courseId = comment.courseId;
            if (comment.sectionId) req.sectionId = comment.sectionId;
            const newReply = await postComment(req);
            onUpdate(newReply, 'reply', comment.id);
            setReplying(false);
        } catch (e) { console.error(e); }
    };

    return (
        <div ref={itemRef} data-comment-id={comment.id}>
            <div className={`group relative rounded-xl transition-all duration-500 p-3
                ${comment.pinned ? 'bg-amber-500/5 border border-amber-500/15' : 'hover:bg-gray-800/30'}
                ${flash ? 'bg-indigo-500/10 ring-1 ring-indigo-500/30' : ''}
                ${depth > 0 ? '' : ''}
            `}>
                {comment.pinned && (
                    <div className="flex items-center gap-1.5 text-amber-400/70 text-xs font-medium mb-2 pl-1">
                        <Pin className="w-3 h-3" />
                        Épinglé par l'admin
                    </div>
                )}

                <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                        <Avatar user={comment} size={depth > 0 ? 'sm' : 'md'} />
                        {/* Thread line */}
                        {(comment.replies?.length > 0 || replying) && depth === 0 && showReplies && (
                            <div className="flex-1 w-px bg-gray-700/50 min-h-[12px]" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0 pb-1">
                        {/* Header */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-white leading-none">{comment.authorUsername}</span>
                            {isAdmin && comment.authorUsername && (
                                <span className="text-[10px] font-medium text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded-md">Admin</span>
                            )}
                            {comment.edited && <span className="text-[11px] text-gray-600 italic">modifié</span>}
                            <span className="text-[11px] text-gray-600 ml-auto">{timeAgo(comment.createdAt)}</span>
                        </div>

                        {/* Content */}
                        {editing ? (
                            <CommentInput
                                placeholder="Modifier votre commentaire..."
                                initialValue={comment.content}
                                autoFocus
                                onSubmit={handleEdit}
                                onCancel={() => setEditing(false)}
                            />
                        ) : (
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                                {comment.content}
                            </p>
                        )}

                        {/* Actions */}
                        {!editing && (
                            <div className="flex items-center gap-1 mt-2">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${isLiked
                                        ? 'text-rose-400 bg-rose-500/10'
                                        : 'text-gray-500 hover:text-rose-400 hover:bg-rose-500/8'
                                        }`}
                                >
                                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                                    {comment.likesCount > 0 && <span className="font-medium">{comment.likesCount}</span>}
                                </button>

                                {depth < 1 && (
                                    <button
                                        onClick={() => setReplying(!replying)}
                                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${replying
                                            ? 'text-indigo-400 bg-indigo-500/10'
                                            : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/8'
                                            }`}
                                    >
                                        <Reply className="w-3.5 h-3.5" />
                                        Répondre
                                    </button>
                                )}

                                {comment.replies?.length > 0 && depth === 0 && (
                                    <button
                                        onClick={() => setShowReplies(!showReplies)}
                                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700/40 transition-all"
                                    >
                                        {showReplies
                                            ? <><ChevronUp className="w-3.5 h-3.5" /> Masquer</>
                                            : <><ChevronDown className="w-3.5 h-3.5" /> {comment.replies.length} réponse{comment.replies.length > 1 ? 's' : ''}</>
                                        }
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Reply input */}
                        {replying && (
                            <div className="mt-3 flex gap-2.5">
                                <div className="w-px bg-gray-700/50 self-stretch ml-1 flex-shrink-0" />
                                <CommentInput
                                    placeholder={`Répondre à ${comment.authorUsername}...`}
                                    autoFocus
                                    onSubmit={handleReply}
                                    onCancel={() => setReplying(false)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Menu */}
                    {(isOwner || isAdmin) && !editing && (
                        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity self-start mt-1" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-700/50 transition-all"
                            >
                                <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 top-8 z-50 min-w-[150px] bg-gray-900/95 backdrop-blur border border-gray-700/60 rounded-xl shadow-2xl py-1.5">
                                    {isOwner && (
                                        <button
                                            onClick={() => { setEditing(true); setMenuOpen(false); }}
                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-all"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                                            Modifier
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button
                                            onClick={handlePin}
                                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-300 hover:bg-gray-800/60 hover:text-white transition-all"
                                        >
                                            <Pin className="w-3.5 h-3.5 text-amber-400" />
                                            {comment.pinned ? 'Désépingler' : 'Épingler'}
                                        </button>
                                    )}
                                    <div className="border-t border-gray-700/40 my-1" />
                                    <button
                                        onClick={handleDelete}
                                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Supprimer
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Replies */}
            {showReplies && comment.replies?.length > 0 && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l-2 border-gray-800/60 pl-4">
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            currentUser={currentUser}
                            isAdmin={isAdmin}
                            onUpdate={onUpdate}
                            depth={depth + 1}
                            highlighted={targetCommentId && reply.id === targetCommentId}
                            targetCommentId={targetCommentId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Main CommentSection ──────────────────────────────── */
const CommentSection = ({ type, targetId, palette }) => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const targetCommentId = searchParams.get('commentId') ? Number(searchParams.get('commentId')) : null;
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [count, setCount] = useState(0);
    const [collapsed, setCollapsed] = useState(!targetCommentId);

    const isAdmin = user?.role === 'ADMIN';

    const p = palette || {
        card: 'from-indigo-500 to-violet-500',
        text: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
    };

    useEffect(() => { loadComments(); }, [type, targetId]);

    const loadComments = async () => {
        setLoading(true); setError('');
        try {
            const data = await fetchComments(type, targetId);
            setComments(data || []);
            setCount(countAll(data || []));
        } catch { setError('Impossible de charger les commentaires.'); }
        finally { setLoading(false); }
    };

    const countAll = (list) => list.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

    const handleAdd = async (content) => {
        try {
            const req = { content };
            if (type === 'course') req.courseId = Number(targetId);
            if (type === 'section') req.sectionId = Number(targetId);
            const created = await postComment(req);
            setComments(prev => [created, ...prev]);
            setCount(c => c + 1);
        } catch (e) {
            const detail = e.response?.data?.detail || e.response?.data || e.message;
            alert(`Erreur ${e.response?.status} : ${detail}`);
        }
    };

    const handleUpdate = (updated, action, parentId) => {
        if (action === 'delete') {
            setComments(prev =>
                prev.filter(c => c.id !== updated.id)
                    .map(c => ({ ...c, replies: c.replies?.filter(r => r.id !== updated.id) || [] }))
            );
            setCount(c => c - 1);
        } else if (action === 'update') {
            setComments(prev => prev.map(c => {
                if (c.id === updated.id) return { ...updated, replies: c.replies };
                return { ...c, replies: c.replies?.map(r => r.id === updated.id ? updated : r) || [] };
            }));
        } else if (action === 'reply') {
            setComments(prev => prev.map(c =>
                c.id === parentId ? { ...c, replies: [...(c.replies || []), updated] } : c
            ));
            setCount(c => c + 1);
        }
    };

    return (
        <div className="mt-8">
            {/* ── Header card ── */}
            <div
                className="flex items-center gap-3 mb-3 cursor-pointer group select-none"
                onClick={() => setCollapsed(c => !c)}
            >
                <div className={`w-8 h-8 ${p.bg} border ${p.border} rounded-xl flex items-center justify-center`}>
                    <MessageSquare className={`w-4 h-4 ${p.text}`} />
                </div>
                <h3 className="text-white font-semibold text-base">Commentaires</h3>
                {count > 0 && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.bg} ${p.text} border ${p.border}`}>
                        {count}
                    </span>
                )}
                {isAdmin && (
                    <span className="flex items-center gap-1 text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                        <Shield className="w-3 h-3" /> Admin
                    </span>
                )}
                <button
                    className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/40 px-3 py-1.5 rounded-lg transition-all"
                    onClick={(e) => { e.stopPropagation(); setCollapsed(c => !c); }}
                >
                    {collapsed ? <><ChevronDown className="w-3.5 h-3.5" /> Afficher</> : <><ChevronUp className="w-3.5 h-3.5" /> Réduire</>}
                </button>
            </div>

            {/* ── Body ── */}
            {!collapsed && (
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/60 rounded-2xl overflow-hidden">
                    {/* Top gradient bar */}
                    <div className={`h-0.5 bg-gradient-to-r ${p.card}`} />

                    <div className="p-5 space-y-6">

                        {/* ── New comment input ── */}
                        {user ? (
                            <div className="flex gap-3 items-start">
                                <Avatar user={{ authorId: user.id, authorUsername: user.username, authorAvatar: user.profilePicture }} size="lg" />
                                <CommentInput
                                    placeholder="Partagez votre avis sur ce contenu..."
                                    onSubmit={handleAdd}
                                    compact
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-5 text-center">
                                <div className="w-12 h-12 bg-gray-800/60 rounded-2xl flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-gray-600" />
                                </div>
                                <p className="text-sm text-gray-500">Connectez-vous pour laisser un commentaire.</p>
                            </div>
                        )}

                        {/* ── Error ── */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                            </div>
                        )}

                        {/* ── Loading ── */}
                        {loading && (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                            </div>
                        )}

                        {/* ── Empty state ── */}
                        {!loading && comments.length === 0 && !error && (
                            <div className="flex flex-col items-center gap-3 py-10 text-center">
                                <div className="w-14 h-14 bg-gray-800/50 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-400">Aucun commentaire pour l'instant.</p>
                                    <p className="text-xs text-gray-600 mt-1">Soyez le premier à partager votre avis !</p>
                                </div>
                            </div>
                        )}

                        {}
                        {!loading && comments.length > 0 && (
                            <div className="space-y-1">
                                {comments.map((comment, idx) => (
                                    <div key={comment.id}>
                                        {idx > 0 && <div className="border-t border-gray-800/50 my-2" />}
                                        <CommentItem
                                            comment={comment}
                                            currentUser={user ? { id: user.id, ...user } : null}
                                            isAdmin={isAdmin}
                                            onUpdate={handleUpdate}
                                            highlighted={targetCommentId && comment.id === targetCommentId}
                                            targetCommentId={targetCommentId}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentSection;