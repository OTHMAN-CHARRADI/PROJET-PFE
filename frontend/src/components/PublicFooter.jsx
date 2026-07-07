import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, LifeBuoy, Mail, Bug, BookOpen, MessageCircle } from 'lucide-react';
import ContactModal from './ContactModal';
import FooterLiveChat from './FooterLiveChat';

const PublicFooter = () => {
    const [showContact, setShowContact] = useState(false);
    const [showChat, setShowChat] = useState(false);

    return (
        <>
            <footer className="border-t border-gray-800/50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

                        {}
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">InfoAcademy</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-4">
                                Votre assistant pédagogique IA pour maîtriser l'informatique, la programmation et les structures de données.
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Service opérationnel
                            </div>
                        </div>

                        {/* Plateforme */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-4">Plateforme</h4>
                            <ul className="space-y-2.5">
                                <li><Link to="/features" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">Fonctionnalités</Link></li>
                                <li><Link to="/topics" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">Sujets couverts</Link></li>
                                <li><Link to="/how-it-works" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">Comment ça marche</Link></li>
                                <li><Link to="/reviews" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">Témoignages</Link></li>
                            </ul>
                        </div>

                        {/* Accès */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-4">Accès</h4>
                            <ul className="space-y-2.5">
                                <li><Link to="/register" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">Créer un compte</Link></li>
                                <li><Link to="/login" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">Se connecter</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                                <LifeBuoy className="w-4 h-4 text-indigo-400" />
                                Support
                            </h4>
                            <ul className="space-y-2.5">
                                <li>
                                    <Link to="/faq" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-400 transition-colors group">
                                        <BookOpen className="w-3.5 h-3.5 text-gray-700 group-hover:text-indigo-400 transition-colors" />
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    {/* Nous contacter → ouvre le modal formulaire */}
                                    <button
                                        onClick={() => setShowContact(true)}
                                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-400 transition-colors group w-full text-left"
                                    >
                                        <Mail className="w-3.5 h-3.5 text-gray-700 group-hover:text-indigo-400 transition-colors" />
                                        Nous contacter
                                    </button>
                                </li>
                                <li>
                                    <Link to="/report" className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-400 transition-colors group">
                                        <Bug className="w-3.5 h-3.5 text-gray-700 group-hover:text-indigo-400 transition-colors" />
                                        Signaler un bug
                                    </Link>
                                </li>
                                <li>
                                    {/* Assistant IA → ouvre le live chat */}
                                    <button
                                        onClick={() => setShowChat((v) => !v)}
                                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-400 transition-colors group w-full text-left"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5 text-gray-700 group-hover:text-violet-400 transition-colors" />
                                        Assistant IA
                                        {showChat && (
                                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                                        )}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-gray-600 text-sm">
                            © {new Date().getFullYear()} InfoAcademy — Assistant Pédagogique IA. Tous droits réservés.
                        </p>

                    </div>
                </div>
            </footer>

            {/* Modal formulaire de contact */}
            {showContact && <ContactModal onClose={() => setShowContact(false)} />}

            {/* Live chat assistant IA */}
            {showChat && <FooterLiveChat onClose={() => setShowChat(false)} />}
        </>
    );
};

export default PublicFooter;
