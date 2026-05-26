import { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CheckCircle2, Award, FlaskConical, Dna, Magnet } from 'lucide-react';
import { EXPERIMENT_CATALOG } from '../data/experiments';

const AchievementTimeline = ({ records, quizAttempts }) => {
  const events = useMemo(() => {
    const combined = [];
    
    records.forEach(rec => {
      if (rec.completion_date) {
        combined.push({
          id: `exp-${rec.experiment_id}`,
          type: 'experiment',
          title: `Completed ${rec.title}`,
          subject: rec.subject,
          date: new Date(rec.completion_date),
          description: 'Successfully finished experiment simulation',
          xp: 50
        });
      }
    });

    quizAttempts.forEach(quiz => {
      if (quiz.attempted_at) {
        const expData = EXPERIMENT_CATALOG.find(e => e.id === quiz.experiment_id);
        const isPerfect = quiz.score === quiz.total_questions;
        combined.push({
          id: quiz.id,
          type: 'quiz',
          title: `Quiz: ${expData ? expData.title : 'Experiment'}`,
          subject: quiz.subject,
          date: new Date(quiz.attempted_at),
          description: `Scored ${quiz.score}/${quiz.total_questions}`,
          xp: isPerfect ? (quiz.score * 10 + 50) : (quiz.score * 10),
          isPerfect
        });
      }
    });

    return combined.sort((a, b) => b.date - a.date);
  }, [records, quizAttempts]);

  const getSubjectIcon = (subject, type) => {
    if (type === 'quiz') return <Award className="w-5 h-5 text-white" />;
    
    switch (subject?.toLowerCase()) {
      case 'biology': return <Dna className="w-5 h-5 text-white" />;
      case 'chemistry': return <FlaskConical className="w-5 h-5 text-white" />;
      case 'physics': return <Magnet className="w-5 h-5 text-white" />;
      default: return <CheckCircle2 className="w-5 h-5 text-white" />;
    }
  };

  const getSubjectColor = (subject, type, isPerfect) => {
    if (type === 'quiz' && isPerfect) return 'bg-amber-500';
    if (type === 'quiz') return 'bg-violet-500';

    switch (subject?.toLowerCase()) {
      case 'biology': return 'bg-rose-500';
      case 'chemistry': return 'bg-emerald-500';
      case 'physics': return 'bg-blue-500';
      default: return 'bg-indigo-500';
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Journey Data Yet</h3>
        <p className="text-slate-500 mt-2">Complete your first experiment to start your timeline!</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 md:ml-6 space-y-8 pb-8">
      {events.map((event, index) => (
        <motion.div 
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: index * 0.1 > 1 ? 0.1 : index * 0.1 }}
          className="relative pl-8 md:pl-10"
        >
          {/* Timeline Node */}
          <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-950 ${getSubjectColor(event.subject, event.type, event.isPerfect)}`}>
            {getSubjectIcon(event.subject, event.type)}
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-md font-bold text-slate-800 dark:text-white">
                {event.title}
              </h4>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full whitespace-nowrap ml-3">
                {format(event.date, 'MMM dd, h:mm a')}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              {event.description}
            </p>
            {event.xp > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold">
                <span>+{event.xp} XP Earned</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AchievementTimeline;
