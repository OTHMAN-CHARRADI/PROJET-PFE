import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

const QuizCard = ({ question, options, selectedAnswer, correctAnswer, onSelect, showResult, explanation, questionNumber, totalQuestions }) => {
  const pct = Math.round((questionNumber / totalQuestions) * 100);
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const getStyle = (opt, idx) => {
    if (!showResult) {
      return selectedAnswer === opt
        ? 'bg-indigo-500/15 border-indigo-500/60 text-white ring-1 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
        : 'bg-gray-800/40 border-gray-700/50 text-gray-300 hover:border-indigo-500/40 hover:bg-gray-800/60 hover:shadow-md';
    }
    if (opt === correctAnswer) return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/20';
    if (selectedAnswer === opt) return 'bg-red-500/10 border-red-500/50 text-red-300 ring-1 ring-red-500/20';
    return 'bg-gray-800/20 border-gray-800/40 text-gray-600';
  };

  const getLetterStyle = (opt) => {
    if (!showResult) {
      return selectedAnswer === opt
        ? 'bg-indigo-500 text-white'
        : 'bg-gray-700/50 text-gray-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400';
    }
    if (opt === correctAnswer) return 'bg-emerald-500 text-white';
    if (selectedAnswer === opt) return 'bg-red-500 text-white';
    return 'bg-gray-800/50 text-gray-600';
  };

  return (
    <div className="animate-slide-in-right">
      {}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">
              {questionNumber}/{totalQuestions}
            </span>
            <span className="text-sm text-gray-500">Question {questionNumber}</span>
          </div>
          <span className="text-xs font-medium text-gray-500">{pct}% complété</span>
        </div>
        {}
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < questionNumber
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                : i === questionNumber - 1
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse'
                  : 'bg-gray-800/60'
              }`} />
          ))}
        </div>
      </div>

      {}
      <div className="relative bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/60 p-8 mb-6 overflow-hidden">
        {}
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-60" />

        <h3 className="text-lg font-semibold text-white leading-relaxed mb-8">{question}</h3>

        <div className="space-y-3">
          {options?.map((opt, i) => (
            <button
              key={i}
              onClick={() => !showResult && onSelect(opt)}
              disabled={showResult}
              className={`group w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${getStyle(opt, i)} ${!showResult ? 'cursor-pointer active:scale-[0.98]' : ''}`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${getLetterStyle(opt)}`}>
                {letters[i] || i + 1}
              </span>
              <span className="flex-1 text-sm font-medium">{opt}</span>
              {showResult && opt === correctAnswer && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
              {showResult && selectedAnswer === opt && opt !== correctAnswer && <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
            </button>
          ))}
        </div>

        {}
        {showResult && explanation && (
          <div className="mt-8 p-5 bg-indigo-500/5 border border-indigo-500/15 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-500/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-400 mb-1">Explication</p>
                <p className="text-sm text-gray-300 leading-relaxed">{explanation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
