import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const pData = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-800 text-sm">
        <p className="font-bold mb-1">{pData.date}</p>
        <p className="text-emerald-400">Experiments: {pData.experiments}</p>
        <p className="text-violet-400">Quizzes: {pData.quizzes}</p>
      </div>
    );
  }
  return null;
};

const ActivityHeatmap = ({ records, quizAttempts }) => {
  // Aggregate data for the last 30 days
  const data = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 29);
    
    // Initialize array of last 30 days
    const days = eachDayOfInterval({ start, end }).map(date => ({
      date: format(date, 'MMM dd'),
      rawDate: format(date, 'yyyy-MM-dd'),
      activityScore: 0,
      experiments: 0,
      quizzes: 0
    }));

    // Add experiments
    records.forEach(rec => {
      if (rec.completion_date) {
        const d = format(new Date(rec.completion_date), 'yyyy-MM-dd');
        const day = days.find(day => day.rawDate === d);
        if (day) {
          day.experiments += 1;
          day.activityScore += 10;
        }
      }
    });

    // Add quizzes
    quizAttempts.forEach(quiz => {
      if (quiz.attempted_at) {
        const d = format(new Date(quiz.attempted_at), 'yyyy-MM-dd');
        const day = days.find(day => day.rawDate === d);
        if (day) {
          day.quizzes += 1;
          day.activityScore += 5;
        }
      }
    });

    return days;
  }, [records, quizAttempts]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Activity Heatmap</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your learning momentum over the last 30 days</p>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} minTickGap={20} />
            <YAxis hide={true} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            <Bar dataKey="activityScore" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.activityScore === 0 ? '#f1f5f9' : entry.activityScore > 10 ? '#8b5cf6' : '#a78bfa'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
