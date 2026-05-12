import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Props { score: number; total: number; }

function getRank(score: number, total: number) {
  const pct = (score / total) * 100;
  if (pct >= 80) return {
    range: '1 – 150', chance: 'Very High', label: 'Excellent', probPct: 92,
    color: 'emerald', msg: 'Outstanding! You have a strong chance at top MCA colleges including CET Trivandrum.',
    colleges: ['CET Trivandrum', 'GEC thrissur', 'MEC kothamangalam', 'TKM college of engineering kollam'],
    tip: 'Maintain this level with regular mock tests and you\'re set for CET!'
  };
  if (pct >= 60) return {
    range: '150 – 450', chance: 'High', label: 'Very Good', probPct: 74,
    color: 'blue', msg: 'Great performance! You\'re on track for a good MCA college.',
    colleges: ['Other government colleges'],
    tip: 'Focus on CS and Maths to push into the top 150 rank bracket.'
  };
  if (pct >= 50) return {
    range: '450 – 900', chance: 'Moderate', label: 'Good', probPct: 52,
    color: 'amber', msg: 'Decent score! With targeted preparation you can significantly improve your rank.',
    colleges: ['Decent Self financing MCA colleges'],
    tip: 'Join our crash course to plug the gaps and improve by 15–20% in 4 weeks.'
  };
  if (pct >= 35) return {
    range: '900 – 2000', chance: 'Low-Moderate', label: 'Average', probPct: 30,
    color: 'orange', msg: 'You need focused preparation to secure a seat. Don\'t worry — improvement is very achievable!',
    colleges: ['Self-Financing Colleges', 'Private MCA Colleges'],
    tip: 'Structured mentorship from our crash course can double your score.'
  };
  return {
    range: '2000+', chance: 'Low', label: 'Needs Work', probPct: 10,
    color: 'red', msg: 'Start early and prepare strategically. Many students improved dramatically in just 30 days!',
    colleges: [],
    tip: 'Our crash course is specifically designed for students starting from scratch.'
  };
}

const COLOR: Record<string, { bg: string; border: string; text: string; bar: string; icon: string }> = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500', icon: 'text-emerald-500' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    bar: 'bg-blue-500',    icon: 'text-blue-500' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   bar: 'bg-amber-500',   icon: 'text-amber-500' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-700',  bar: 'bg-orange-500',  icon: 'text-orange-500' },
  red:     { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-700',     bar: 'bg-red-400',     icon: 'text-red-500' },
};

export default function RankPrediction({ score, total }: Props) {
  const r = getRank(score, total);
  const c = COLOR[r.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-lg">Rank Prediction & Admission Analysis</h3>
          <p className="text-slate-400 text-xs font-semibold">Based on LBS MCA historical cutoff data</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Rank card */}
        <div className={`${c.bg} ${c.border} border rounded-2xl p-5`}>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Estimated LBS MCA Rank</p>
          <p className={`text-3xl sm:text-4xl font-black ${c.text} mb-3 tracking-tight`}>{r.range}</p>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 ${c.bg} ${c.border} border rounded-full`}>
            <span className={`text-xs font-black ${c.text}`}>{r.label} Performance</span>
          </div>
        </div>

        {/* Probability card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Admission Probability</p>
          <div className="flex items-end gap-2 mb-3">
            <p className="text-3xl font-black text-slate-900">{r.probPct}%</p>
            <p className={`text-sm font-bold ${c.text} pb-1`}>{r.chance}</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${r.probPct}%` }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
              className={`h-full rounded-full ${c.bar}`}
            />
          </div>
        </div>

        {/* Message */}
        <div className="md:col-span-2 flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-slate-700 text-sm font-semibold leading-relaxed mb-2">{r.msg}</p>
            <p className="text-blue-600 text-sm font-bold">{r.tip}</p>
          </div>
        </div>

        {/* College chances */}
        {r.colleges.length > 0 && (
          <div className="md:col-span-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Colleges Within Reach</p>
            <div className="flex flex-wrap gap-2">
              {r.colleges.map(col => (
                <span key={col} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {col}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA inside rank section */}
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50">
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-blue-800 text-sm font-semibold leading-relaxed">
              Improve your rank with our <strong>CET MCA 2027 Crash Course</strong> — structured preparation, PYQs, and MOCK TESTS for just ₹350.
            </p>
          </div>
          <a
            href="https://lbscourse.cetmca.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
          >
            Enroll Now <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
