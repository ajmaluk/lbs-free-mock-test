import { ArrowRight, MessageCircle, BookOpen, FileText, Users, Clock, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const HIGHLIGHTS = [
  { icon: FileText, label: 'Recorded Video Classes', desc: 'Recorded classes for all topics' },
  { icon: BookOpen, label: 'Mock Tests', desc: 'Full-length timed mock exams' },
  { icon: Users, label: 'Quizzes', desc: 'Topic-wise quizzes to test your knowledge' },
  { icon: Clock, label: 'Leaderboard and ranks', desc: 'Rank among all students who took the test' }
 
  
];

export default function CoursePromoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden mb-6"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
    >
      {/* Glow blobs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        {/* Badge row */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-[11px] font-black text-blue-300 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> CET MCA 2027
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-[11px] font-black text-emerald-300 uppercase tracking-wider">
            <Zap className="w-3 h-3" /> Only ₹350
          </span>
          <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-[11px] font-black text-red-300 uppercase tracking-wider">
            🔥 Limited Seats
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left text */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-3 tracking-tight">
              Crack LBS MCA Entrance with{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}>
                CET MCA 2027 CRASH COURSE
              </span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed mb-6 max-w-lg">
              A crash course crafted by <strong className="text-white">Computer Applications students at CET Trivandrum</strong> — covering PYQs, mock tests, quizzes, and structured recorded video classes and notes . Start your preparation the smart way.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://lbscourse.cetmca.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-xl"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
              >
                Join Crash Course <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="https://lbscourse.cetmca.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-all"
              >
                Learn More
              </a>
              <a
                href="https://wa.me/919400834007"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Right: highlight cards */}
          <div className="grid grid-cols-2 gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-blue-300" />
                </div>
                <p className="text-white font-black text-sm leading-tight mb-1">{label}</p>
                <p className="text-slate-400 text-xs font-medium leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
