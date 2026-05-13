import { ArrowRight, MessageCircle, CheckCircle2, Clock, Users, BookOpen, Star, Zap, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: BookOpen, title: 'Recorded Classes', desc: 'full recorded video classes based on all topics' },
  { icon: Zap, title: 'Full Mock Tests', desc: 'full-length timed mock tests with instant analysis' },
  { icon: Users, title: 'Quizzes', desc: 'topic-wise quizzes to test your knowledge' },
  { icon: Clock, title: 'Leaderboard and ranks', desc: 'rank among all students who took the test' },
  { icon: Star, title: 'Previous Year Questions', desc: 'Previous Year Question banks for practice' },
  { icon: CheckCircle2, title: 'Addtional Notes', desc: 'Additional notes to improve your knowledge' },
];

const TESTIMONIALS = [
  { name: 'Anjana A.', quote: 'this platform is very helpful' },
  { name: 'Ansa Syman', quote: 'Good classes' },
  { name: 'ARATHI A R', quote: 'Recordings and all the lectures are so hepful app management is also good' },
];

export default function CourseDetails() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-6"
    >
      {/* Course features */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-3">
              <Star className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
              <span className="text-xs font-black text-blue-600 uppercase tracking-wider">CET MCA 2027 Crash Course</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Everything You Need to Crack LBS MCA
            </h2>
          </div>
          <div className="shrink-0 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-center">
            <p className="text-2xl font-black text-emerald-600">₹350</p>
            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">One-time fee</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">{title}</p>
                <p className="text-xs text-slate-500 font-medium leading-snug mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Urgency bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 mb-5">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-red-500 text-lg">🔥</span>
            <div>
              <p className="text-red-700 font-black text-sm">Limited Seats Available — Admissions Closing Soon!</p>
              <p className="text-red-500 text-xs font-semibold">Join 200+ students already enrolled in CET MCA 2027 batch</p>
            </div>
          </div>
          <a
            href="https://lbscourse.cetmca.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-black text-sm hover:bg-red-600 transition-all shadow-md"
          >
            Reserve Seat <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Batch info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Batch', value: 'CET MCA 2027' },
            { label: 'Duration', value: 'TILL THE EXAM' },
            { label: 'Mode', value: 'Online' },
            { label: 'Fee', value: '₹350 Only' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-5">
        <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Student Reviews
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-500 rounded-full flex items-center justify-center text-white font-black text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{t.name}</p>
                </div>
              </div>
              <p className="text-slate-600 text-xs font-medium leading-relaxed italic">"{t.quote}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b, #0f172a)' }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Ready to Improve Your Rank?</h3>
          <p className="text-slate-300 text-sm font-medium mb-5 max-w-md mx-auto">
            Join <strong className="text-white">CET MCA 2027 Mentorship</strong> — the most affordable and effective crash course for LBS MCA preparation.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://lbscourse.cetmca.in/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-black text-sm text-white shadow-xl hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              Enroll Now — ₹350 <ArrowRight className="w-4 h-4" />
            </a>
            <a href="https://wa.me/919400834007" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-black text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a href="tel:+919400834007"
              className="flex items-center gap-2 px-7 py-3 rounded-xl font-black text-sm bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all">
              <Phone className="w-4 h-4" /> Call Us
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
