import { useState } from 'react';
import {
    ChevronDown, BookOpen, MessageCircle, Brain, BarChart3,
    CreditCard, Shield, Zap, Code2, HelpCircle
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '../components/PublicFooter';
import ContactModal from '../components/ContactModal';

const categories = [
    { id: 'general', label: 'Général', icon: HelpCircle, color: 'from-indigo-500 to-purple-500' },
    { id: 'compte', label: 'Compte', icon: Shield, color: 'from-emerald-500 to-teal-500' },
    { id: 'cours', label: 'Cours', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
    { id: 'chat', label: 'Assistant IA', icon: MessageCircle, color: 'from-violet-500 to-purple-500' },
    { id: 'quiz', label: 'Quiz & Exercices', icon: Brain, color: 'from-orange-500 to-amber-500' },
    { id: 'progress', label: 'Progression', icon: BarChart3, color: 'from-pink-500 to-rose-500' },
];

const faqs = [

    {
        cat: 'general',
        q: "Qu'est-ce qu'InfoAcademy ?",
        a: "InfoAcademy est une plateforme d'apprentissage en informatique propulsée par l'IA. Elle propose des cours vidéo, un assistant pédagogique IA, des quiz adaptatifs et des exercices pratiques pour maîtriser la programmation et l'informatique à votre rythme.",
    },
    {
        cat: 'general',
        q: "InfoAcademy est-il gratuit ?",
        a: "Oui ! InfoAcademy propose un accès gratuit à la majorité des fonctionnalités : cours, assistant IA, quiz et exercices. Un plan premium est disponible pour accéder à des contenus avancés et à des fonctionnalités exclusives.",
    },
    {
        cat: 'general',
        q: "Quels sujets sont couverts ?",
        a: "La plateforme couvre plus de 200 sujets : Python, JavaScript, Java, C/C++, React, SQL, Algorithmique, POO, Git, Docker, Cybersécurité, Machine Learning, Node.js, et bien plus encore. De nouveaux sujets sont ajoutés régulièrement.",
    },
    {
        cat: 'general',
        q: "InfoAcademy convient-il aux débutants ?",
        a: "Absolument. La plateforme s'adapte automatiquement à votre niveau, que vous soyez débutant complet ou développeur expérimenté. L'assistant IA ajuste ses explications et la difficulté des exercices selon votre progression.",
    },
    {
        cat: 'general',
        q: "Quelle technologie alimente l'assistant IA ?",
        a: "InfoAcademy utilise des modèles de langage de dernière génération (LLM) via OpenRouter, ce qui permet de basculer automatiquement vers le modèle le plus rapide et le plus fiable disponible. Les modèles utilisés incluent Gemini Flash, LLaMA 4 et DeepSeek.",
    },
    {
        cat: 'general',
        q: "InfoAcademy est-il disponible en plusieurs langues ?",
        a: "L'interface est en français et l'assistant IA répond par défaut en français. Toutefois, si vous posez vos questions en anglais, Infobot s'adapte et répond dans la langue utilisée. D'autres langues sont prévues dans les prochaines versions.",
    },
    {
        cat: 'general',
        q: "Sur quels appareils puis-je utiliser InfoAcademy ?",
        a: "InfoAcademy fonctionne sur tout appareil disposant d'un navigateur web moderne : ordinateur, tablette ou smartphone. Aucune installation n'est nécessaire. L'interface est entièrement responsive.",
    },
    {
        cat: 'general',
        q: "Y a-t-il une application mobile InfoAcademy ?",
        a: "Pas encore d'application mobile native, mais le site est entièrement optimisé pour les mobiles et peut être ajouté à votre écran d'accueil comme une PWA (Progressive Web App) sur Android et iOS.",
    },
    {
        cat: 'general',
        q: "Comment contacter le support ?",
        a: "Plusieurs options s'offrent à vous : le formulaire « Nous contacter » dans le footer, l'assistant IA qui peut répondre à la plupart des questions sur la plateforme, ou l'email de support accessible depuis la page de contact.",
    },
    {
        cat: 'general',
        q: "InfoAcademy propose-t-il des certifications ?",
        a: "La plateforme ne délivre pas encore de certifications officielles reconnues. Cependant, chaque quiz complété et chaque exercice réussi est consigné dans votre profil de progression, constituant un portfolio de vos compétences.",
    },


    {
        cat: 'compte',
        q: "Comment créer un compte ?",
        a: "Cliquez sur « Créer un compte » depuis la page d'accueil ou rendez-vous sur /register. Remplissez le formulaire avec votre nom d'utilisateur, email et mot de passe. L'inscription est instantanée et gratuite.",
    },
    {
        cat: 'compte',
        q: "J'ai oublié mon mot de passe, que faire ?",
        a: "Sur la page de connexion, cliquez sur « Mot de passe oublié » et entrez votre adresse email. Vous recevrez un lien de réinitialisation. Si vous ne recevez pas l'email, vérifiez votre dossier spam ou contactez notre support.",
    },
    {
        cat: 'compte',
        q: "Comment modifier mon profil ou ma photo ?",
        a: "Accédez à « Mon espace » puis « Profil ». Vous pouvez y modifier votre nom d'utilisateur, votre email, votre mot de passe et télécharger une photo de profil (formats JPG, PNG acceptés).",
    },
    {
        cat: 'compte',
        q: "Comment supprimer mon compte ?",
        a: "Dans les paramètres de votre profil, faites défiler jusqu'à la section « Zone de danger ». Cliquez sur « Supprimer mon compte », confirmez votre mot de passe. Cette action est irréversible et supprime toutes vos données.",
    },
    {
        cat: 'compte',
        q: "Puis-je avoir plusieurs comptes ?",
        a: "Non, les conditions d'utilisation n'autorisent qu'un seul compte par personne. Si vous rencontrez un problème avec votre compte principal, contactez le support pour une assistance personnalisée.",
    },
    {
        cat: 'compte',
        q: "Mon mot de passe est-il sécurisé ?",
        a: "Oui. Les mots de passe sont hachés avec BCrypt avant d'être stockés en base de données. InfoAcademy ne conserve jamais votre mot de passe en clair. Nous vous recommandons d'utiliser un mot de passe d'au moins 8 caractères combinant lettres, chiffres et symboles.",
    },
    {
        cat: 'compte',
        q: "Comment changer mon adresse email ?",
        a: "Rendez-vous dans votre profil (« Mon espace » → « Profil »), modifiez le champ email et confirmez avec votre mot de passe actuel. Un email de vérification sera envoyé à la nouvelle adresse.",
    },
    {
        cat: 'compte',
        q: "Mes données personnelles sont-elles protégées ?",
        a: "Oui. InfoAcademy collecte uniquement les données nécessaires au bon fonctionnement de la plateforme (nom, email, progression). Vos données ne sont jamais vendues à des tiers. Vous pouvez demander la suppression complète de vos données à tout moment.",
    },


    {
        cat: 'cours',
        q: "Comment accéder aux cours ?",
        a: "Une fois connecté, rendez-vous dans la section « Cours » depuis le menu principal. Vous pouvez filtrer par sujet, niveau ou technologie. Cliquez sur un cours pour accéder à ses sections et vidéos.",
    },
    {
        cat: 'cours',
        q: "Les cours sont-ils accessibles hors ligne ?",
        a: "Actuellement, les cours nécessitent une connexion internet. Nous travaillons sur une fonctionnalité de téléchargement hors ligne qui sera disponible dans une prochaine mise à jour.",
    },
    {
        cat: 'cours',
        q: "Puis-je reprendre un cours là où je l'avais arrêté ?",
        a: "Oui, votre progression est automatiquement sauvegardée. Chaque cours garde en mémoire la dernière section et vidéo que vous avez regardée, vous permettant de reprendre exactement là où vous vous étiez arrêté.",
    },
    {
        cat: 'cours',
        q: "Comment sont organisés les cours ?",
        a: "Chaque cours est divisé en sections thématiques, elles-mêmes composées de vidéos et de ressources. La navigation se fait de haut en bas : Cours → Sections → Vidéos. Un assistant IA contextuel est disponible à chaque niveau.",
    },
    {
        cat: 'cours',
        q: "Puis-je laisser des commentaires sur un cours ?",
        a: "Oui. Une section de commentaires est disponible sous chaque cours et chaque section. Vous pouvez poser des questions, partager vos retours ou interagir avec d'autres étudiants. Les commentaires peuvent être likés et épinglés par les instructeurs.",
    },
    {
        cat: 'cours',
        q: "Les cours sont-ils mis à jour régulièrement ?",
        a: "Oui. Le contenu est mis à jour en continu pour rester à jour avec les dernières versions des langages et frameworks. Les mises à jour importantes sont notifiées dans votre espace personnel.",
    },
    {
        cat: 'cours',
        q: "Comment est déterminé le niveau d'un cours ?",
        a: "Chaque cours indique un niveau recommandé (débutant, intermédiaire, avancé). Ce niveau est défini par l'instructeur en fonction des prérequis nécessaires. L'assistant IA peut vous aider à estimer si un cours est adapté à votre niveau actuel.",
    },
    {
        cat: 'cours',
        q: "Puis-je regarder plusieurs vidéos d'une même section dans n'importe quel ordre ?",
        a: "Oui, vous êtes libre de naviguer entre les vidéos dans l'ordre que vous souhaitez. Cependant, nous recommandons de suivre l'ordre proposé pour une meilleure compréhension des concepts, surtout pour les cours structurés de façon progressive.",
    },


    {
        cat: 'chat',
        q: "Comment fonctionne l'assistant IA ?",
        a: "L'assistant IA (Infobot) est disponible dans chaque cours, quiz et exercice. Il comprend le contexte de ce que vous étudiez et adapte ses réponses à votre niveau. Vous pouvez lui poser des questions, demander des exemples de code ou des explications supplémentaires.",
    },
    {
        cat: 'chat',
        q: "L'assistant IA donne-t-il directement les réponses aux exercices ?",
        a: "Non, par conception. Dans le contexte des quiz et exercices, Infobot est configuré pour vous guider par étapes sans révéler la solution complète. Il vous aide à raisonner et à comprendre, ce qui favorise un apprentissage durable.",
    },
    {
        cat: 'chat',
        q: "L'assistant IA mémorise-t-il nos conversations ?",
        a: "L'historique de conversation est conservé dans la page Chat dédiée. Dans les assistants contextuels (cours, quiz, exercice), la conversation repart à zéro à chaque nouvelle session, mais vous pouvez la réinitialiser manuellement avec le bouton dédié.",
    },
    {
        cat: 'chat',
        q: "L'assistant IA peut-il générer du code ?",
        a: "Oui. Infobot génère des exemples de code dans tous les langages couverts par la plateforme, avec coloration syntaxique et explications ligne par ligne. Il peut aussi vous aider à déboguer votre propre code si vous le lui soumettez.",
    },
    {
        cat: 'chat',
        q: "Combien de messages puis-je envoyer à l'assistant IA ?",
        a: "Il n'y a pas de limite fixe sur le nombre de messages. L'assistant IA est disponible 24h/24, 7j/7. En cas de forte charge sur les serveurs, un léger délai de réponse peut apparaître.",
    },
    {
        cat: 'chat',
        q: "L'assistant IA peut-il se tromper ?",
        a: "Oui, comme tout système d'IA, Infobot peut occasionnellement faire des erreurs, notamment sur des sujets très pointus ou des versions récentes de frameworks. Nous vous recommandons de toujours vérifier les informations critiques avec la documentation officielle.",
    },
    {
        cat: 'chat',
        q: "Puis-je utiliser le chat IA pour des sujets hors informatique ?",
        a: "L'assistant de la page Chat principale peut répondre à des questions générales. Cependant, les assistants contextuels (dans les cours, quiz et exercices) sont spécialisés et recentrent automatiquement la conversation sur le sujet en cours d'apprentissage.",
    },
    {
        cat: 'chat',
        q: "Comment réinitialiser une conversation avec l'assistant IA ?",
        a: "Dans n'importe quel panneau de chat, cliquez sur l'icône de réinitialisation (flèche circulaire) dans l'en-tête. Cela efface l'historique visible et repart avec un contexte propre. Sur la page Chat principale, vous pouvez aussi supprimer l'intégralité de votre historique.",
    },


    {
        cat: 'quiz',
        q: "Comment fonctionnent les quiz ?",
        a: "Chaque quiz génère automatiquement 10 à 20 questions sur le sujet choisi, adaptées à votre niveau. À la fin, vous obtenez un score détaillé avec des explications pour chaque question. Vos résultats sont sauvegardés dans votre historique.",
    },
    {
        cat: 'quiz',
        q: "Comment fonctionnent les exercices pratiques ?",
        a: "Les exercices sont générés dynamiquement par l'IA selon le sujet et la difficulté que vous choisissez. Chaque exercice comprend un énoncé, des indices progressifs et une correction commentée. Vous pouvez en générer autant que vous voulez.",
    },
    {
        cat: 'quiz',
        q: "Puis-je refaire un quiz ?",
        a: "Oui, vous pouvez refaire un quiz autant de fois que vous le souhaitez. Les questions sont régénérées à chaque fois, ce qui vous évite de mémoriser les réponses et vous force à vraiment comprendre les concepts.",
    },
    {
        cat: 'quiz',
        q: "Les questions de quiz sont-elles toujours différentes ?",
        a: "Oui. Les questions sont générées à la volée par l'IA à chaque nouveau quiz. Même pour un sujet identique, vous aurez des formulations, des exemples et des contextes différents d'une session à l'autre.",
    },
    {
        cat: 'quiz',
        q: "Puis-je choisir le niveau de difficulté d'un quiz ?",
        a: "Oui. Avant de lancer un quiz, vous pouvez sélectionner le niveau de difficulté (débutant, intermédiaire, avancé). Par défaut, le niveau est celui détecté depuis votre progression. Vous pouvez toujours le modifier manuellement.",
    },
    {
        cat: 'quiz',
        q: "Que se passe-t-il si je ferme la page en plein milieu d'un quiz ?",
        a: "Si vous quittez un quiz en cours, la session est perdue et le quiz ne sera pas comptabilisé dans votre historique. Nous recommandons de terminer chaque quiz en une seule session pour que vos résultats soient correctement enregistrés.",
    },
    {
        cat: 'quiz',
        q: "Les exercices ont-ils une solution officielle ?",
        a: "Oui. Après avoir soumis votre tentative, une correction complète et commentée générée par l'IA est affichée. Elle explique non seulement la solution correcte, mais aussi pourquoi les autres approches fonctionnent ou non.",
    },
    {
        cat: 'quiz',
        q: "Puis-je demander de l'aide pendant un exercice ?",
        a: "Oui, l'assistant IA contextuel est disponible pendant toute la durée d'un exercice. Il vous guidera avec des indices progressifs sans vous donner directement la solution, pour que vous puissiez trouver par vous-même.",
    },


    {
        cat: 'progress',
        q: "Comment suivre ma progression ?",
        a: "Rendez-vous dans « Ma progression » depuis le menu. Vous y trouverez vos scores par sujet, votre historique de quiz et d'exercices, vos points forts et axes d'amélioration, ainsi qu'un graphique d'évolution dans le temps.",
    },
    {
        cat: 'progress',
        q: "Qu'est-ce que le niveau et comment évolue-t-il ?",
        a: "Votre niveau (débutant, intermédiaire, avancé) évolue automatiquement en fonction de vos performances sur les quiz et exercices. Plus vous pratiquez et réussissez, plus le niveau s'ajuste pour vous proposer du contenu adapté.",
    },
    {
        cat: 'progress',
        q: "Puis-je réinitialiser mon niveau ?",
        a: "Oui, depuis la page de progression, un bouton « Réinitialiser le niveau » vous permet de repartir à zéro. Votre historique de quiz et d'exercices est conservé, seul le niveau de difficulté est remis à débutant.",
    },
    {
        cat: 'progress',
        q: "Combien de temps faut-il pour progresser ?",
        a: "Cela dépend de votre rythme et de vos objectifs. En pratiquant 30 minutes par jour, la plupart des étudiants constatent une amélioration notable en 2 à 4 semaines sur un sujet donné. La constance est plus importante que la durée des sessions.",
    },
    {
        cat: 'progress',
        q: "Puis-je voir ma progression par sujet spécifique ?",
        a: "Oui. La page de progression affiche un détail par sujet : nombre de quiz effectués, score moyen, meilleur score et date de dernière activité. Un graphique radar vous montre vos points forts et vos axes d'amélioration d'un coup d'œil.",
    },
    {
        cat: 'progress',
        q: "Mon historique de quiz est-il conservé indéfiniment ?",
        a: "Oui, tous vos résultats sont conservés tant que votre compte est actif. Vous pouvez accéder à l'historique complet de vos quiz, consulter vos réponses passées et voir l'évolution de vos scores dans le temps.",
    },
    {
        cat: 'progress',
        q: "Comment sont calculés les scores de progression ?",
        a: "Le score de progression est calculé en pondérant vos résultats récents plus fortement que les anciens, pour refléter votre niveau actuel plutôt que votre niveau de départ. Un score de 80 % sur les 5 derniers quiz compte plus qu'un 40 % obtenu il y a 3 mois.",
    },
];

const FaqItem = ({ faq, isOpen, onToggle }) => (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-gray-800/60 bg-gray-900/40 hover:border-gray-700/60'}`}>
        <button
            onClick={onToggle}
            className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
        >
            <span className={`text-sm font-medium leading-relaxed ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                {faq.q}
            </span>
            <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-400' : 'text-gray-600'}`} />
        </button>
        {isOpen && (
            <div className="px-5 pb-4">
                <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
            </div>
        )}
    </div>
);

const FaqPage = () => {
    const [activeCategory, setActiveCategory] = useState('general');
    const [openIndex, setOpenIndex] = useState(null);
    const [showContact, setShowContact] = useState(false);

    const filtered = faqs.filter((f) => f.cat === activeCategory);
    const activeCat = categories.find((c) => c.id === activeCategory);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <PublicNavbar />

            {}
            <section className="relative pt-28 pb-16 px-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 to-transparent pointer-events-none" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Centre d'aide
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        Questions <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">fréquentes</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Tout ce que vous devez savoir sur InfoAcademy.
                        Vous ne trouvez pas la réponse ?{' '}
                        <button onClick={() => setShowContact(true)} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                            Contactez-nous.
                        </button>
                    </p>
                </div>
            </section>

            {/* Main */}
            <section className="max-w-4xl mx-auto px-6 pb-24">
                {/* Category tabs */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const active = cat.id === activeCategory;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat.id); setOpenIndex(null); }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active
                                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Section title */}
                <div className="flex items-center gap-3 mb-5">
                    {activeCat && (
                        <>
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeCat.color} flex items-center justify-center`}>
                                <activeCat.icon className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">{activeCat.label}</h2>
                            <span className="text-xs text-gray-600 bg-gray-800/60 px-2 py-0.5 rounded-full">{filtered.length} questions</span>
                        </>
                    )}
                </div>

                {/* FAQ list */}
                <div className="space-y-2">
                    {filtered.map((faq, i) => (
                        <FaqItem
                            key={i}
                            faq={faq}
                            isOpen={openIndex === i}
                            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                        />
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 text-center">
                    <MessageCircle className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-1">Vous n'avez pas trouvé votre réponse ?</h3>
                    <p className="text-sm text-gray-400 mb-4">Notre équipe est disponible pour vous aider rapidement.</p>
                    <button
                        onClick={() => setShowContact(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Nous contacter
                    </button>
                </div>
            </section>

            {showContact && <ContactModal onClose={() => setShowContact(false)} />}

            <PublicFooter />
        </div>
    );
};

export default FaqPage;