import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Area, AreaChart } from 'recharts';
import { TrendingUp, Target } from 'lucide-react';


const cleanProgressTopic = (topic = '') => {
  const first = topic.split(' : ')[0].trim();
  return first || topic;
};

const ProgressChart = ({ quizHistory, topicProgress }) => {

  const lineData = quizHistory
    ?.filter(q => q.score !== null && q.total_questions)
    .map((q, i) => ({
      name: q.taken_at ? new Date(q.taken_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : `Quiz ${i + 1}`,
      score: Math.round((q.score / q.total_questions) * 100),
      topic: cleanProgressTopic(q.topic),
    }))
    .reverse() || [];

  const radarData = topicProgress?.map(tp => {
    const clean = cleanProgressTopic(tp.topic);
    return {
      subject: clean.length > 12 ? clean.substring(0, 12) + '…' : clean,
      fullName: clean,
      score: Math.round(tp.mastery_score),
    };
  }) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-4 shadow-2xl shadow-black/40">
          <p className="text-white text-sm font-semibold mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            <p className="text-indigo-300 text-sm font-medium">{payload[0].value}%</p>
          </div>
          {payload[0].payload.topic && (
            <p className="text-gray-500 text-xs mt-1">{payload[0].payload.topic}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const RadarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-4 shadow-2xl shadow-black/40">
          <p className="text-white text-sm font-semibold mb-1">{payload[0].payload.fullName}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            <p className="text-indigo-300 text-sm font-medium">{payload[0].value}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/60 p-6 hover:border-gray-700/60 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Évolution des scores</h3>
            <p className="text-xs text-gray-500">{lineData.length} quiz enregistrés</p>
          </div>
        </div>

        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#1f2937' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={{ stroke: '#1f2937' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="url(#lineGrad)"
                strokeWidth={3}
                fill="url(#areaGradient)"
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 5, stroke: '#1e1b4b' }}
                activeDot={{ r: 7, fill: '#a78bfa', stroke: '#1e1b4b', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-3">
              <TrendingUp className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">Aucun quiz complété pour le moment</p>
            <p className="text-gray-600 text-xs mt-1">Lancez un quiz pour voir vos scores ici</p>
          </div>
        )}
      </div>

      {}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/60 p-6 hover:border-gray-700/60 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Maîtrise par sujet</h3>
            <p className="text-xs text-gray-500">{radarData.length} sujet{radarData.length !== 1 ? 's' : ''} analysé{radarData.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1f2937" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: '#4b5563', fontSize: 9 }}
              />
              <Radar
                name="Maîtrise"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Tooltip content={<RadarTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-3">
              <Target className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">Aucune donnée de progression disponible</p>
            <p className="text-gray-600 text-xs mt-1">Complétez des quiz pour débloquer ce graphique</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressChart;