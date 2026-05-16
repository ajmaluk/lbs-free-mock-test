import { useState, useEffect, useRef } from 'react';
import type { TestResult, Question, Category } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, ArrowRight, Play, Pause,
  Check, X, Minus, Clock, TrendingUp,
  MessageCircle, CheckCircle2
} from 'lucide-react';
import CoursePromoBanner from './result/CoursePromoBanner';
import RankPrediction from './result/RankPrediction';
import CourseDetails from './result/CourseDetails';

interface Props { result: TestResult; questions: Question[]; }

/* ─── Video Card ─────────────────────────────────────── */
const VIDEOS = [
  { id: 1, title: 'CS Fundamentals: Memory Management', src: '/videos/amarjith.mp4'},
  { id: 2, title: 'English Grammar & Rhetoric', src: '/videos/akshay.mp4' },
  { id: 3, title: 'Mathematics: Conic Sections', src: '/videos/jumna.mp4' },
  { id: 4, title: 'GK: Current Affairs', src: '/videos/abhinav.mp4' },
  { id: 5, title: 'Aptitude: Percentages', src: '/videos/sourav.mp4' },
];

function VideoCard({ video, activeId, setActiveId }: { video: typeof VIDEOS[0]; activeId: number | null; setActiveId: (id: number | null) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const playing = activeId === video.id;

  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setActiveId(video.id);
      else if (activeId === video.id) setActiveId(null);
    }, { threshold: 0.6 });
    if (boxRef.current) obs.observe(boxRef.current);
    return () => obs.disconnect();
  }, [video.id, activeId, setActiveId]);

  useEffect(() => {
    if (!ref.current) return;
    if (activeId === video.id) {
      ref.current.play().catch(() => undefined);
    } else {
      ref.current.pause();
    }
  }, [activeId, video.id]);

  const toggle = () => {
    if (playing) {
      setActiveId(null);
    } else {
      setActiveId(video.id);
    }
  };

  return (
    <div ref={boxRef} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="relative aspect-video bg-slate-900 cursor-pointer" onClick={toggle}>
        <video ref={ref} src={video.src} loop playsInline preload="metadata" className="w-full h-full object-cover opacity-90" />
        <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity ${playing ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-11 h-11 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            {playing ? <Pause className="w-4 h-4 fill-slate-900" /> : <Play className="w-4 h-4 fill-slate-900 ml-0.5" />}
          </div>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-800 leading-tight flex-1">{video.title}</p>
        <a href="https://lbscourse.cetmca.in/" target="_blank" rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-black hover:bg-blue-700 transition-all">
          Join
        </a>
      </div>
    </div>
  );
}

/* ─── Exit Confirm Modal ─────────────────────────────── */
function ExitModal({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative z-10 bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-slate-100">
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Wait! Don't leave yet</h3>
          <p className="text-slate-500 text-sm font-medium mb-5 leading-relaxed">
            You haven't checked our <strong className="text-blue-600">CET MCA 2027 Crash Course</strong>. Improve your rank with just ₹350!
          </p>
          <div className="flex flex-col gap-2">
            <a href="https://lbscourse.cetmca.in/" target="_blank" rel="noopener noreferrer"
              className="w-full py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              View Crash Course <ArrowRight className="w-4 h-4" />
            </a>
            {/* <button onClick={onConfirm}
              className="w-full py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">
              No thanks, retake test
            </button> */}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Animated Counter ───────────────────────────────── */
function AnimCounter({ to, duration = 1.5 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * to));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const af = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(af);
  }, [to, duration]);
  return <>{val}</>;
}

/* ─── Main Result Page ───────────────────────────────── */
export default function ResultPage({ result, questions }: Props) {
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

  if (!result?.categoryScores || !result?.userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl max-w-sm w-full border border-slate-100">
          <AlertCircle className="text-red-500 w-14 h-14 mx-auto mb-5" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-7 font-medium">We couldn't load your results.</p>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">Reload</button>
        </div>
      </div>
    );
  }

  const total = result.totalQuestions || questions.length || 120;
  const accuracy = Math.round((result.totalScore / total) * 100);
  const correct = result.totalScore;
  const wrong = Object.keys(result.answers).length - correct;
  const skipped = total - Object.keys(result.answers).length;
  const timeTaken = result.timeTaken ?? 0;

  const scores = Object.entries(result.categoryScores) as [Category, number][];
  const weakCategory = scores.reduce((a, b) => {
    const tA = result.categoryTotals?.[a[0]] ?? 1;
    const tB = result.categoryTotals?.[b[0]] ?? 1;
    return (a[1] / tA) < (b[1] / tB) ? a : b;
  })[0];

  const perfLevel = accuracy >= 80 ? { label: 'Excellent', color: 'emerald' }
    : accuracy >= 65 ? { label: 'Very Good', color: 'blue' }
    : accuracy >= 50 ? { label: 'Good', color: 'amber' }
    : accuracy >= 35 ? { label: 'Average', color: 'orange' }
    : { label: 'Needs Work', color: 'red' };

  // const handleRetake = () => setShowExitModal(true);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-['Inter']">

      {/* Exit Modal */}
      <AnimatePresence>
        {showExitModal && <ExitModal onCancel={() => setShowExitModal(false)} />}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">

        {/* ① Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">Test Completed</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Results for <span className="text-blue-600">{result.userData.name}</span><span> </span>
              <span className='text-red-500 font-'>,Scroll Down To View Your Score</span>
            </h1>
          </div>
        </div>

        {/* ② Course Promo Banner — BEFORE result card */}
        <CoursePromoBanner />

        {/* ③ Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-6"
        >
          {/* Score hero */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center border-b border-slate-100">
            {/* Big score */}
            <div className="relative flex-shrink-0">
              <svg className="w-32 h-32" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={accuracy >= 65 ? '#10b981' : accuracy >= 45 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - accuracy / 100)}`}
                  transform="rotate(-90 60 60)"
                  initial={{ strokeDashoffset: `${2 * Math.PI * 50}` }}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - accuracy / 100)}` }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                />
                <text x="60" y="55" textAnchor="middle" className="font-black" fontSize="22" fontWeight="900" fill="#0f172a">
                  <AnimCounter to={result.totalScore} />
                </text>
                <text x="60" y="72" textAnchor="middle" fontSize="11" fill="#94a3b8">/{total}</text>
              </svg>
            </div>

            <div className="flex-1">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-3 ${
                perfLevel.color === 'emerald' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                perfLevel.color === 'blue'    ? 'bg-blue-50 border-blue-200 text-blue-700' :
                perfLevel.color === 'amber'   ? 'bg-amber-50 border-amber-200 text-amber-700' :
                'bg-red-50 border-red-200 text-red-700'
              }`}>
                <span className="text-xs font-black uppercase tracking-widest">{perfLevel.label}</span>
              </div>
              <p className="text-2xl font-black text-slate-900 mb-1">{accuracy}% Accuracy</p>
              <p className="text-slate-500 text-sm font-medium">
                {accuracy >= 65 ? "Great job! You're well-prepared for LBS MCA." :
                 accuracy >= 45 ? "Keep going! Focused prep will boost your score significantly." :
                 "Don't worry — with the right mentorship, improvement is very achievable!"}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100">
            {[
              { icon: Check, label: 'Correct', value: correct, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: X,     label: 'Wrong',   value: wrong,   color: 'text-red-500',     bg: 'bg-red-50' },
              { icon: Minus, label: 'Skipped', value: skipped, color: 'text-slate-500',   bg: 'bg-slate-50' },
              { icon: Clock, label: 'Time',    value: `${Math.floor(timeTaken/60)}m`, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} className={`${bg} p-4 text-center`}>
                <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {scores.map(([cat, score]) => {
              const max = result.categoryTotals?.[cat] ?? 1;
              const pct = Math.round((score / max) * 100);
              const isWeak = cat === weakCategory;
              return (
                <div key={cat} className={`p-3.5 rounded-2xl border ${isWeak ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    {cat} {isWeak && <span className="text-red-500">⚠</span>}
                  </p>
                  <p className="text-lg font-black text-slate-900">{score}<span className="text-slate-300 text-xs font-bold">/{max}</span></p>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>

          {/* Weak area nudge */}
          <div className="mx-5 sm:mx-6 mb-5 flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <TrendingUp className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-sm text-blue-800 font-semibold flex-1">
              Your weakest area is <strong>{weakCategory}</strong>. Our crash course covers it in depth.
            </p>
            <a href="https://lbscourse.cetmca.in/" target="_blank" rel="noopener noreferrer"
              className="shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all">
              Fix it
            </a>
          </div>
        </motion.div>

        {/* ④ Rank Prediction */}
        <RankPrediction score={result.totalScore} total={total} />

        {/* ⑤ Course Details */}
        <CourseDetails />

        {/* ⑥ Preview Videos */}
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-800 mb-3">📹 Free Lesson Previews</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VIDEOS.map(v => <VideoCard key={v.id} video={v} activeId={activeVideoId} setActiveId={setActiveVideoId} />)}
          </div>
        </div>

        {/* ⑦ Detailed Analysis */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-wider shrink-0">Detailed Analysis</h2>
            <div className="h-px bg-slate-200 flex-1" />
          </div>
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const ua = result.answers[q.id];
              const isCorrect = ua === q.correctAnswer;
              const isSkipped = ua === undefined;
              return (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${isCorrect ? 'bg-emerald-100 text-emerald-600' : isSkipped ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.category}</span>
                        {isCorrect && <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><Check className="w-3 h-3" />CORRECT</span>}
                        {!isCorrect && !isSkipped && <span className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><X className="w-3 h-3" />INCORRECT</span>}
                        {isSkipped && <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full"><Minus className="w-3 h-3" />SKIPPED</span>}
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 leading-snug">{q.question}</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-10">
                    {q.options.map((opt, oi) => {
                      const isC = oi === q.correctAnswer, isS = oi === ua;
                      return (
                        <div key={oi} className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2.5 ${isC ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : isS ? 'bg-red-50 border-red-200 text-red-900' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black border shrink-0 ${isC ? 'bg-emerald-500 border-emerald-500 text-white' : isS ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                            {String.fromCharCode(65 + oi)}
                          </div>
                          <span className="leading-snug">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl">
        {/* Mini urgency strip */}
        <div className="bg-red-500 py-1.5 text-center">
          <p className="text-white text-xs font-black tracking-wide">🔥 Limited Seats — CET MCA 2027 Crash Course — Only ₹350!</p>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex flex-wrap justify-center gap-2.5">
          {/* <button onClick={handleRetake} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-600 font-black text-sm hover:bg-slate-50 transition-all">
            <RefreshCw className="w-4 h-4" /> Retake
          </button> */}
          <a href="https://wa.me/919400834007" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <a href="https://lbscourse.cetmca.in/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-black text-sm shadow-lg hover:-translate-y-0.5 transition-all"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
            Enroll — ₹350 <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
