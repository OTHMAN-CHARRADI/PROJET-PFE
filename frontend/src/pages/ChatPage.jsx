import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ChatBubble from '../components/ChatBubble';
import {
  sendMessage, saveStreamedMessage, getChatHistory, deleteChatHistory,
  listConversations, createConversation, renameConversation,
  deleteConversation, getConversationMessages, uploadChatFile
} from '../service/Api';
import {
  Bot, Trash2, Loader2, Plus, MessageCircle, Sparkles, Code2,
  BookOpen, Lightbulb, ArrowUp, Pencil, Check, X, MoreVertical,
  Paperclip, FileText, Image, FileCode, File, Upload, Search,
  GraduationCap, Brain, Cpu, Hash, Archive, ArchiveRestore, ChevronDown
} from 'lucide-react';

const AVATAR_BASE_URL = 'http://localhost:8080/uploads/avatars/';

const QUICK_PROMPTS = [
  { icon: Code2, label: 'Explique les pointeurs en C', color: 'from-blue-500 to-cyan-500', desc: 'Programmation C' },
  { icon: Lightbulb, label: 'Différence entre stack et heap', color: 'from-amber-500 to-orange-500', desc: 'Mémoire' },
  { icon: BookOpen, label: 'Génère un exercice Python', color: 'from-emerald-500 to-teal-500', desc: 'Python' },
  { icon: Sparkles, label: "Définir le polymorphisme", color: 'from-purple-500 to-pink-500', desc: 'POO' },
  { icon: Brain, label: 'Explique le tri rapide', color: 'from-rose-500 to-red-500', desc: 'Algorithmes' },
  { icon: Cpu, label: 'Comment fonctionne une API REST ?', color: 'from-indigo-500 to-violet-500', desc: 'Web' },
];

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'];
const CODE_EXTS = ['.py', '.java', '.c', '.cpp', '.h', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.sql', '.json', '.xml', '.yaml', '.yml', '.sh', '.rb', '.go', '.rs', '.swift', '.kt', '.dart', '.php', '.vue', '.svelte'];

const getFileIcon = (filename) => {
  const ext = '.' + filename.split('.').pop().toLowerCase();
  if (IMAGE_EXTS.includes(ext)) return Image;
  if (CODE_EXTS.includes(ext)) return FileCode;
  if (ext === '.pdf') return FileText;
  return File;
};

const getFileColor = (filename) => {
  const ext = '.' + filename.split('.').pop().toLowerCase();
  if (IMAGE_EXTS.includes(ext)) return 'from-pink-500 to-rose-500';
  if (CODE_EXTS.includes(ext)) return 'from-emerald-500 to-teal-500';
  if (ext === '.pdf') return 'from-red-500 to-orange-500';
  return 'from-gray-500 to-gray-600';
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);


  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });


  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const dragCounterRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    loadConversations();
  }, []);


  useEffect(() => {
    const newParam = searchParams.get('new');
    if (newParam) {
      setActiveConvId(null);
      setMessages([]);
      setInput('');
      setAttachedFiles([]);
    }
  }, [searchParams]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadConversations = async () => {
    try {
      const convos = await listConversations();
      setConversations(convos);
    } catch (err) {
      console.error('Erreur chargement conversations:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectConversation = async (convId) => {
    setActiveConvId(convId);
    setMessages([]);
    setMenuOpenId(null);
    setAttachedFiles([]);
    try {
      const msgs = await getConversationMessages(convId);
      setMessages(msgs);
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    }
  };

  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
    setInput('');
    setMenuOpenId(null);
    setAttachedFiles([]);
  };



  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addFiles = (files) => {
    const MAX_SIZE = 10 * 1024 * 1024;
    const newFiles = files.filter(f => {
      if (f.size > MAX_SIZE) {
        alert(`Le fichier "${f.name}" dépasse la limite de 10 Mo.`);
        return false;
      }

      if (attachedFiles.some(af => af.name === f.name && af.size === f.size)) {
        return false;
      }
      return true;
    });


    const filesWithPreview = newFiles.map(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      const isImage = IMAGE_EXTS.includes(ext);
      return {
        file: f,
        name: f.name,
        size: f.size,
        isImage,
        preview: isImage ? URL.createObjectURL(f) : null,
      };
    });

    setAttachedFiles(prev => [...prev, ...filesWithPreview]);
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };


  useEffect(() => {
    return () => {
      attachedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);



  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer?.items?.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      addFiles(files);
    }
  }, [attachedFiles]);



  const handleSend = async (text) => {
    const msg = (text || input).trim();
    const hasFiles = attachedFiles.length > 0;
    if ((!msg && !hasFiles) || loading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const attachmentMeta = attachedFiles.map(f => ({
      name: f.name, size: f.size, isImage: f.isImage, preview: f.preview,
    }));
    const userMsg = { role: 'user', content: msg, created_at: new Date().toISOString(), attachments: attachmentMeta };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const filesToUpload = [...attachedFiles];
    setAttachedFiles([]);

    try {

      let uploadedUrls = [];
      if (filesToUpload.length > 0) {
        setUploadingFiles(true);
        const results = await Promise.all(filesToUpload.map(f => uploadChatFile(f.file)));
        uploadedUrls = results.map(r => r.url);
        setUploadingFiles(false);
      }


      let history = [];
      if (activeConvId) {
        try {
          const msgs = await getConversationMessages(activeConvId);
          history = msgs.slice(-10).map(m => ({ role: m.role, content: m.content }));
        } catch (_) { }
      }




      const streamPayload = {
        message: msg || (uploadedUrls.length > 0 ? 'Analyse ce fichier joint.' : ''),
        level: user?.level || 'débutant',
        conversation_history: history,
        attached_files: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      };

      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(streamPayload),
      });

      if (!response.ok) throw new Error(`Erreur stream: ${response.status}`);


      const botMsgIndex = Date.now();
      setMessages(prev => [...prev, { role: 'assistant', content: '', _id: botMsgIndex, created_at: new Date().toISOString() }]);
      setLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              fullContent += parsed.token;

              setMessages(prev => prev.map(m =>
                m._id === botMsgIndex ? { ...m, content: fullContent } : m
              ));
            }
          } catch (_) { }
        }
      }


      setMessages(prev => prev.map(m =>
        m._id === botMsgIndex ? { ...m, _id: null } : m
      ));


      try {
        const saved = await saveStreamedMessage(
          msg,
          fullContent,
          activeConvId,
          uploadedUrls.length > 0 ? uploadedUrls : null
        );

        if (!activeConvId && saved.conversation_id) {
          setActiveConvId(saved.conversation_id);
        }
      } catch (saveErr) {
        console.warn('Sauvegarde BDD échouée:', saveErr);
      }


      await loadConversations();

    } catch (err) {
      console.error('Chat stream error:', err);
      setUploadingFiles(false);
      const errorMsg = err.message || "Erreur lors de l'envoi du message.";
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${errorMsg}`, created_at: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRenameConversation = async (convId) => {
    if (!editingTitle.trim()) return;
    try {
      await renameConversation(convId, editingTitle.trim());
      setEditingId(null);
      setEditingTitle('');
      await loadConversations();
    } catch (err) {
      console.error('Erreur renommage:', err);
    }
  };

  const handleDeleteAllConversations = async () => {
    setDeletingAll(true);
    try {
      await deleteChatHistory();
      setActiveConvId(null);
      setMessages([]);
      setConversations([]);
    } catch (err) {
      console.error('Erreur suppression toutes conversations:', err);
    } finally {
      setDeletingAll(false);
      setShowDeleteAllConfirm(false);
    }
  };

  const handleDeleteConversation = async (convId) => {
    try {
      await deleteConversation(convId);
      if (activeConvId === convId) {
        setActiveConvId(null);
        setMessages([]);
      }
      setMenuOpenId(null);
      await loadConversations();
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  const startEditing = (conv) => {
    setEditingId(conv.id);
    setEditingTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  const isEmpty = messages.length === 0;
  const canSend = input.trim() || attachedFiles.length > 0;

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [archivedIds, setArchivedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('archivedConvIds') || '[]'); }
    catch { return []; }
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const saveArchivedIds = (ids) => {
    setArchivedIds(ids);
    localStorage.setItem('archivedConvIds', JSON.stringify(ids));
  };

  const handleArchiveConversation = (convId) => {
    const newIds = [...archivedIds, convId];
    saveArchivedIds(newIds);
    if (activeConvId === convId) { setActiveConvId(null); setMessages([]); }
    setMenuOpenId(null);
    setShowArchived(false);
  };

  const handleUnarchiveConversation = (convId) => {
    saveArchivedIds(archivedIds.filter(id => id !== convId));
    setMenuOpenId(null);
  };

  const filteredConversations = conversations.filter(
    c => !archivedIds.includes(c.id) && c.title?.toLowerCase().includes(sidebarSearch.toLowerCase())
  );
  const archivedConversations = conversations.filter(
    c => archivedIds.includes(c.id) && c.title?.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  const formatConvDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diff < 172800000) return 'Hier';
    if (diff < 604800000) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const hour = new Date().getHours();
  const greetingText = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <Navbar />

      <div className="flex flex-1 mt-16 overflow-hidden">

        {}
        <div className="w-72 bg-gray-900/70 backdrop-blur-xl border-r border-gray-800/50 flex flex-col flex-shrink-0">

          {}
          <div className="p-4 border-b border-gray-800/40">
            <div className="flex items-center gap-3 mb-4">
              {user?.profilePicture ? (
                <img
                  src={`http://localhost:8080/uploads/avatars/${user.profilePicture}`}
                  alt={user.username}
                  className="w-10 h-10 rounded-xl object-cover border border-gray-700/50 shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {(user?.username || 'U').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                <p className="text-[11px] text-gray-500">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleNewConversation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Nouvelle conversation
              </button>
              {conversations.length > 0 && (
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-800/70 border border-gray-700/40 text-gray-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                  title="Supprimer toutes les conversations"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {}
          {conversations.length > 2 && (
            <div className="px-3 pt-3 pb-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={e => setSidebarSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-gray-800/40 rounded-xl text-xs text-white placeholder-gray-600 outline-none focus:border-indigo-500/30 transition-all"
                />
              </div>
            </div>
          )}

          {}
          <div className="flex-1 overflow-y-auto py-2 px-2 custom-scroll">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-600">Chargement...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-14 h-14 bg-gray-800/60 rounded-2xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-gray-700" />
                </div>
                <p className="text-sm font-medium text-gray-500">{sidebarSearch ? 'Aucun résultat' : 'Aucune conversation'}</p>
                <p className="text-xs text-gray-700 mt-1">{sidebarSearch ? 'Essayez un autre terme' : 'Commencez par poser une question'}</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative flex items-center rounded-xl transition-all duration-200 ${activeConvId === conv.id
                      ? 'bg-indigo-500/10 border border-indigo-500/20 shadow-sm shadow-indigo-500/5'
                      : 'hover:bg-gray-800/50 border border-transparent'
                      }`}
                  >
                    {editingId === conv.id ? (
                      <div className="flex items-center gap-1 w-full p-1.5">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameConversation(conv.id);
                            if (e.key === 'Escape') { setEditingId(null); setEditingTitle(''); }
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white outline-none focus:border-indigo-500/50 min-w-0"
                        />
                        <button
                          onClick={() => handleRenameConversation(conv.id)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/15 transition-all flex-shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingTitle(''); }}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-700 transition-all flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSelectConversation(conv.id)}
                          className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left min-w-0"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeConvId === conv.id ? 'bg-indigo-500/15' : 'bg-gray-800/60'
                            }`}>
                            <Hash className={`w-3.5 h-3.5 ${activeConvId === conv.id ? 'text-indigo-400' : 'text-gray-600'
                              }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm block truncate ${activeConvId === conv.id ? 'text-white font-medium' : 'text-gray-400'
                              }`}>
                              {conv.title}
                            </span>
                            {conv.updated_at && (
                              <span className="text-[10px] text-gray-600">{formatConvDate(conv.updated_at)}</span>
                            )}
                          </div>
                        </button>

                        <div className="relative flex-shrink-0 pr-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (menuOpenId === conv.id) { setMenuOpenId(null); return; }
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                              setMenuOpenId(conv.id);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${menuOpenId === conv.id
                              ? 'text-white bg-gray-700'
                              : 'text-gray-600 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-gray-700'
                              }`}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          {archivedConversations.length > 0 && (
            <div className="px-2 pb-2 border-t border-gray-800/40">
              <button
                onClick={() => setShowArchived(v => !v)}
                className="flex items-center gap-2 w-full px-3 py-2.5 mt-1 text-xs text-gray-500 hover:text-gray-400 transition-all rounded-xl hover:bg-gray-800/30"
              >
                <Archive className="w-3.5 h-3.5" />
                <span className="flex-1 text-left font-medium">Archivées ({archivedConversations.length})</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showArchived ? 'rotate-180' : ''}`} />
              </button>
              {showArchived && (
                <div className="space-y-0.5 mt-0.5">
                  {archivedConversations.map((conv) => (
                    <div key={conv.id} className="group relative flex items-center rounded-xl hover:bg-gray-800/40 border border-transparent transition-all">
                      <button
                        onClick={() => handleSelectConversation(conv.id)}
                        className="flex-1 flex items-center gap-2.5 px-3 py-2 text-left min-w-0"
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-800/60">
                          <Archive className="w-3 h-3 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs block truncate text-gray-500">{conv.title}</span>
                          {conv.updated_at && (
                            <span className="text-[10px] text-gray-700">{formatConvDate(conv.updated_at)}</span>
                          )}
                        </div>
                      </button>
                      <div className="relative flex-shrink-0 pr-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (menuOpenId === conv.id) { setMenuOpenId(null); return; }
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                            setMenuOpenId(conv.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-600 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-gray-700 transition-all"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {}
          <div className="px-3 py-3 border-t border-gray-800/40">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/30">
              <GraduationCap className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <p className="text-[10px] text-gray-500 leading-tight">
                Propulsé par <span className="text-indigo-400 font-medium">InfoAcademy IA</span>
              </p>
            </div>
          </div>
        </div>

        {}
        <div
          className="flex-1 flex flex-col min-w-0 relative overflow-hidden"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {}
          {isDragging && (
            <div className="absolute inset-0 z-50 flex items-center justify-center drag-overlay">
              <div className="flex flex-col items-center gap-4 pointer-events-none">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-bounce-subtle">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-white mb-1">Déposez vos fichiers ici</p>
                  <p className="text-sm text-gray-400">Images, code source, documents PDF…</p>
                </div>
              </div>
            </div>
          )}

          {}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-20 left-1/4 w-[500px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] bg-purple-500/[0.03] rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-3xl" />
          </div>

          {}
          <div className="flex-1 overflow-y-auto relative z-10">
            {isEmpty ? (

              <div className="flex flex-col items-center justify-center h-full px-6 py-4">
                <div className="max-w-2xl w-full text-center">

                  {}
                  <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl blur-xl animate-glow-pulse" />
                    <div className="absolute -inset-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl blur-lg animate-glow-pulse" style={{ animationDelay: '1s' }} />
                    <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {}
                  <h2 className="text-xl font-extrabold text-white mb-1 tracking-tight">
                    {greetingText}, {user?.username || 'là'} <span className="inline-block animate-bounce-slow">👋</span>
                  </h2>
                  <p className="text-gray-400 mb-1 text-sm">
                    Comment puis-je vous aider aujourd'hui ?
                  </p>
                  <p className="text-gray-600 mb-4 text-xs max-w-md mx-auto">
                    Posez une question, partagez du code ou un fichier — je suis votre assistant IA pédagogique.
                  </p>

                  {/* Quick prompts grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {QUICK_PROMPTS.map((qp, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(qp.label)}
                        className="group flex flex-col items-start gap-1.5 p-3 bg-gray-900/60 border border-gray-800/50 rounded-2xl text-left hover:border-indigo-500/30 hover:bg-gray-900/80 hover:shadow-lg hover:shadow-indigo-500/5 hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
                        style={{ animationDelay: `${i * 0.06}s` }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className={`w-7 h-7 bg-gradient-to-br ${qp.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                            <qp.icon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                            {qp.desc}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors leading-snug">
                          {qp.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Messages List ── */
              <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
                {messages.map((msg, i) => (
                  <ChatBubble
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.created_at}
                    username={user?.username}
                    profilePicture={user?.profilePicture}
                    attachments={msg.attachments}
                    isStreaming={!!msg._id && i === messages.length - 1}
                    onEdit={(text) => {
                      setInput(text);
                      setTimeout(() => {
                        if (textareaRef.current) {
                          textareaRef.current.style.height = 'auto';
                          textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
                          textareaRef.current.focus();
                        }
                      }, 0);
                    }}
                  />
                ))}
                {loading && (
                  <div className="flex gap-3 mb-4 animate-fade-in">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass-card rounded-2xl rounded-bl-sm px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
                          <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
                          <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
                        </div>
                        <span className="text-xs text-gray-500 animate-pulse">
                          {uploadingFiles ? '📎 Upload des fichiers…' : 'InfoAcademy réfléchit…'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Input Area ── */}
          <div className="relative z-10 flex-shrink-0">
            {/* Gradient fade above input */}
            <div className="h-8 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />

            <div className="bg-gray-950 px-4 sm:px-6 pb-4">
              {/* Attached Files Preview */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 max-w-3xl mx-auto">
                  {attachedFiles.map((f, i) => {
                    const IconComponent = getFileIcon(f.name);
                    const colorClass = getFileColor(f.name);
                    return (
                      <div
                        key={i}
                        className="file-chip group flex items-center gap-2 pl-1.5 pr-2 py-1.5 glass-card rounded-xl animate-fade-in"
                      >
                        {f.isImage && f.preview ? (
                          <img
                            src={f.preview}
                            alt={f.name}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className={`w-8 h-8 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-300 font-medium truncate max-w-[120px]">{f.name}</p>
                          <p className="text-[10px] text-gray-600">{formatFileSize(f.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          className="w-5 h-5 flex items-center justify-center rounded-full text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="max-w-3xl mx-auto">
                {/* Main input card */}
                <div className="relative bg-gray-900 border border-gray-800/80 rounded-2xl shadow-xl shadow-black/30 focus-within:border-indigo-500/50 focus-within:shadow-indigo-500/10 transition-all duration-300">

                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez votre question..."
                    rows={1}
                    className="w-full px-4 pt-4 pb-2 bg-transparent text-white placeholder-gray-600 outline-none resize-none text-sm leading-relaxed"
                    style={{ maxHeight: '160px' }}
                  />

                  {/* Bottom toolbar */}
                  <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-3">

                    {/* Left: attachment button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all duration-200 text-xs font-medium"
                        title="Joindre un fichier"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Joindre</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.py,.java,.c,.cpp,.h,.js,.jsx,.ts,.tsx,.html,.css,.scss,.sql,.txt,.md,.json,.xml,.csv,.yaml,.yml,.sh,.rb,.go,.rs,.swift,.kt,.dart,.php,.vue,.svelte,.pdf"
                      />
                    </div>

                    {/* Center: keyboard hints */}
                    <div className="hidden sm:flex items-center gap-2 flex-1 justify-center">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-700">
                        <kbd className="px-1.5 py-0.5 bg-gray-800/80 border border-gray-700/60 rounded-md text-[10px] font-mono text-gray-500">↵</kbd>
                        <span>Envoyer</span>
                      </div>
                      <span className="w-px h-3 bg-gray-800 rounded-full" />
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-700">
                        <kbd className="px-1.5 py-0.5 bg-gray-800/80 border border-gray-700/60 rounded-md text-[10px] font-mono text-gray-500">⇧↵</kbd>
                        <span>Saut de ligne</span>
                      </div>
                    </div>

                    {/* Right: send button */}
                    <button
                      onClick={() => handleSend()}
                      disabled={!canSend || loading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 ${canSend && !loading
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95'
                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                    >
                      {loading
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Envoi...</span></>
                        : <><ArrowUp className="w-3.5 h-3.5" /><span>Envoyer</span></>
                      }
                    </button>
                  </div>
                </div>

                <p className="text-center text-[10px] text-gray-800 mt-2">
                  InfoAcademy peut faire des erreurs. Vérifiez les informations importantes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {menuOpenId && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
      )}

      {/* Fixed dropdown portal — escapes overflow constraints */}
      {menuOpenId && (() => {
        const isArchived = archivedIds.includes(menuOpenId);
        const conv = conversations.find(c => c.id === menuOpenId);
        if (!conv) return null;
        const menuHeight = isArchived ? 96 : 128;
        const spaceBelow = window.innerHeight - menuPos.top;
        const top = spaceBelow < menuHeight + 8
          ? menuPos.top - menuHeight - 40
          : menuPos.top;
        return (
          <div
            className="fixed z-[9999] w-44 bg-gray-800 border border-gray-700/60 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in"
            style={{ top, right: menuPos.right }}
            onClick={e => e.stopPropagation()}
          >
            {isArchived ? (
              <>
                <button
                  onClick={() => handleUnarchiveConversation(conv.id)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                >
                  <ArchiveRestore className="w-3.5 h-3.5" />
                  Désarchiver
                </button>
                <div className="h-px bg-gray-700/50 mx-2" />
                <button
                  onClick={() => handleDeleteConversation(conv.id)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => startEditing(conv)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Renommer
                </button>
                <button
                  onClick={() => handleArchiveConversation(conv.id)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                >
                  <Archive className="w-3.5 h-3.5" />
                  Archiver
                </button>
                <div className="h-px bg-gray-700/50 mx-2" />
                <button
                  onClick={() => handleDeleteConversation(conv.id)}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </>
            )}
          </div>
        );
      })()}
      {/* ── Confirm Delete All Modal ── */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/15 border border-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Supprimer toutes les conversations</p>
                <p className="text-xs text-gray-500 mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''} seront supprimées</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Cette action est irréversible. Tout votre historique de chat sera définitivement supprimé.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                disabled={deletingAll}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700/40 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAllConversations}
                disabled={deletingAll}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-sm font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deletingAll ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Suppression...</>
                ) : (
                  <><Trash2 className="w-3.5 h-3.5" />Tout supprimer</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;