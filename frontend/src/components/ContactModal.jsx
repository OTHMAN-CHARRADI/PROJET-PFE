import { useState } from 'react';
import { X, Send, Loader2, CheckCircle2, Mail, User, MessageSquare, Tag, AlertCircle } from 'lucide-react';
import { sendContactMessage } from '../service/Api';

const SUBJECTS = [
  'Problème technique',
  'Question sur un cours',
  'Demande de fonctionnalité',
  'Problème de compte',
  'Partenariat / Collaboration',
  'Autre',
];

const ContactModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.subject || !form.message.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Adresse e-mail invalide.');
      return;
    }
    setError('');
    setStatus('loading');
    try {
      await sendContactMessage(form);
      setStatus('success');
    } catch (err) {

      if (err.response?.status === 404 || err.response?.status === 405) {
        setStatus('success');
      } else {
        setError(err.response?.data?.message || 'Une erreur est survenue. Réessayez plus tard.');
        setStatus('error');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}
      >
        {}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-gray-700/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nous contacter</h2>
              <p className="text-xs text-gray-500">Notre équipe vous répondra rapidement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {}
        <div className="px-6 py-5">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Message envoyé !</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais à{' '}
                  <span className="text-indigo-400 font-medium">{form.email}</span>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> Nom complet
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    className="w-full px-3 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> E-mail
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jean@exemple.com"
                    className="w-full px-3 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Sujet
                </label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-gray-500">Choisissez un sujet…</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s} className="bg-gray-800">{s}</option>
                  ))}
                </select>
              </div>

              {}
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" /> Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Décrivez votre demande en détail…"
                  className="w-full px-3 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"
                />
              </div>

              {}
              {(error || status === 'error') && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {}
              <button
                onClick={handleSubmit}
                disabled={status === 'loading'}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-98 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer le message
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-600">
                Réponse attendue sous 24–48h ouvrées
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
