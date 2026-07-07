import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Bot, Copy, Check, FileText, FileCode, Image, File, Pencil } from 'lucide-react';
import { useState } from 'react';

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


const parseAttachments = (content) => {
  if (!content) return { text: content, attachments: [] };
  const match = content.match(/<!--ATTACHMENTS:(.*?)-->/);
  if (!match) return { text: content, attachments: [] };
  try {
    const attachments = JSON.parse(match[1]);
    const text = content.replace(/\n?<!--ATTACHMENTS:.*?-->/, '').trim();
    return { text, attachments };
  } catch {
    return { text: content, attachments: [] };
  }
};

const AVATAR_BASE_URL = 'http://localhost:8080/uploads/avatars/';

const ChatBubble = ({ role, content, timestamp, username, profilePicture, attachments: propAttachments, isStreaming, onEdit }) => {
  const isUser = role === 'user';
  const [copiedBlock, setCopiedBlock] = useState(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [hovered, setHovered] = useState(false);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedBlock(index);
    setTimeout(() => setCopiedBlock(null), 2000);
  };

  const handleCopyFull = () => {
    navigator.clipboard.writeText(content || '');
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const userInitials = username ? username.slice(0, 2).toUpperCase() : 'U';

  let codeBlockIndex = 0;

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };


  let displayContent = content;
  let displayAttachments = propAttachments || [];

  if (isUser && !propAttachments) {
    const parsed = parseAttachments(content);
    displayContent = parsed.text;
    displayAttachments = parsed.attachments.map(a => ({
      name: a.name,
      isImage: a.type === 'image',
      url: a.url,
    }));
  }

  const renderAttachments = () => {
    if (!displayAttachments || displayAttachments.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2.5">
        {displayAttachments.map((att, idx) => {

          if (att.isImage && att.preview) {
            return (
              <button
                key={idx}
                onClick={() => setLightboxUrl(att.preview)}
                className="relative rounded-xl overflow-hidden border border-white/10 hover:border-indigo-500/40 transition-all hover:scale-[1.02]"
              >
                <img
                  src={att.preview}
                  alt={att.name}
                  className="w-32 h-24 object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-2 py-1">
                  <p className="text-[10px] text-white/80 truncate">{att.name}</p>
                </div>
              </button>
            );
          }


          if (att.isImage && att.url) {
            const imgUrl = `http://localhost:8000${att.url}`;
            return (
              <button
                key={idx}
                onClick={() => setLightboxUrl(imgUrl)}
                className="relative rounded-xl overflow-hidden border border-white/10 hover:border-indigo-500/40 transition-all hover:scale-[1.02]"
              >
                <img
                  src={imgUrl}
                  alt={att.name}
                  className="w-32 h-24 object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-2 py-1">
                  <p className="text-[10px] text-white/80 truncate">{att.name}</p>
                </div>
              </button>
            );
          }


          const IconComponent = getFileIcon(att.name || 'file');
          const colorClass = getFileColor(att.name || 'file');
          return (
            <div
              key={idx}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10"
            >
              <div className={`w-7 h-7 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs text-gray-300 truncate max-w-[100px]">{att.name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className={`flex gap-3 mb-5 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {}
        {isUser ? (
          profilePicture ? (
            <img
              src={`${AVATAR_BASE_URL}${profilePicture}`}
              alt={username || 'User'}
              className="w-9 h-9 rounded-xl object-cover flex-shrink-0 shadow-lg shadow-indigo-500/20 border border-gray-700/50"
            />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg shadow-indigo-500/20">
              {userInitials}
            </div>
          )
        ) : (
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}

        {}
        <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
          {}
          <p className={`text-[11px] font-semibold mb-1.5 ${isUser ? 'text-right text-gray-500' : 'text-left text-gray-500'}`}>
            {isUser ? (username || 'Vous') : 'InfoAcademy'}
          </p>

          <div
            className={`px-5 py-3.5 ${isUser
              ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl rounded-tr-sm text-white shadow-lg shadow-indigo-500/10'
              : 'glass-card rounded-2xl rounded-tl-sm text-gray-200'
              }`}
          >
            {isUser ? (
              <>
                {displayContent && (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{displayContent}</p>
                )}
                {renderAttachments()}
              </>
            ) : (
              <div className="markdown-content text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const currentIndex = codeBlockIndex;

                      if (!inline && match) {
                        codeBlockIndex++;
                        const codeString = String(children).replace(/\n$/, '');
                        return (
                          <div className="relative my-3 rounded-xl overflow-hidden border border-gray-700/30">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/90 border-b border-gray-700/30">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                                </div>
                                <span className="text-xs text-gray-500 font-mono ml-1">{match[1]}</span>
                              </div>
                              <button
                                onClick={() => handleCopy(codeString, currentIndex)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-gray-700/50"
                              >
                                {copiedBlock === currentIndex ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-green-400" />
                                    <span className="text-green-400">Copié</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copier</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: '1rem 1.25rem',
                                background: 'rgba(10, 15, 30, 0.9)',
                                fontSize: '0.82rem',
                                lineHeight: '1.6',
                              }}
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }

                      if (!inline) {
                        codeBlockIndex++;
                        const codeString = String(children).replace(/\n$/, '');
                        return (
                          <div className="relative my-3 rounded-xl overflow-hidden border border-gray-700/30">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/90 border-b border-gray-700/30">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                                </div>
                                <span className="text-xs text-gray-500 font-mono ml-1">code</span>
                              </div>
                              <button
                                onClick={() => handleCopy(codeString, currentIndex)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-gray-700/50"
                              >
                                {copiedBlock === currentIndex ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-green-400" />
                                    <span className="text-green-400">Copié</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copier</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={oneDark}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: '1rem 1.25rem',
                                background: 'rgba(10, 15, 30, 0.9)',
                                fontSize: '0.82rem',
                                lineHeight: '1.6',
                              }}
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-[2px] h-4 bg-indigo-400 ml-0.5 align-middle animate-pulse rounded-full" />
                )}
              </div>
            )}
          </div>
          {}
          {timestamp && (
            <p className={`text-[10px] text-gray-600 mt-1.5 ${isUser ? 'text-right' : 'text-left'}`}>
              {formatTime(timestamp)}
            </p>
          )}

          {}
          {hovered && !isStreaming && (
            <div className={`flex items-center gap-1 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser ? (

                <button
                  onClick={handleCopyFull}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/40 text-xs text-gray-400 hover:text-white hover:bg-gray-700/80 transition-all"
                  title="Copier la réponse"
                >
                  {copiedFull ? (
                    <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copié</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /><span>Copier la réponse</span></>
                  )}
                </button>
              ) : (

                <>
                  <button
                    onClick={handleCopyFull}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/40 text-xs text-gray-400 hover:text-white hover:bg-gray-700/80 transition-all"
                    title="Copier le message"
                  >
                    {copiedFull ? (
                      <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copié</span></>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /><span>Copier</span></>
                    )}
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => onEdit(displayContent)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/40 text-xs text-gray-400 hover:text-white hover:bg-indigo-600/40 hover:border-indigo-500/40 transition-all"
                      title="Modifier le message"
                    >
                      <Pencil className="w-3.5 h-3.5" /><span>Modifier</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="Preview"
            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ChatBubble;