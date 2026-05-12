import { useState, useEffect, useCallback } from 'react';
import type { UserData, TestResult, Question, Category } from '../types';
import { ArrowRight, ArrowLeft, Send, User, CheckCircle2, Bookmark, Clock, Map, X } from 'lucide-react';
import { saveResult } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  questions: Question[];
  userData: UserData;
  onComplete: (result: TestResult) => void;
  onExit: () => void;
}

const TEST_DURATION = 120 * 60; // 2 hours

// Category metadata
const CAT_META: Record<Category, { total: number; color: string }> = {
  CS:       { total: 50, color: 'text-blue-600' },
  Maths:    { total: 25, color: 'text-purple-600' },
  Aptitude: { total: 25, color: 'text-emerald-600' },
  English:  { total: 15, color: 'text-amber-600' },
  GK:       { total: 5,  color: 'text-rose-600' },
};
const CATEGORIES: Category[] = ['CS', 'Maths', 'Aptitude', 'English', 'GK'];

function calculateScore(questions: Question[], answers: Record<string, number>) {
  const categoryScores: Record<Category, number> = { CS: 0, Maths: 0, Aptitude: 0, English: 0, GK: 0 };
  const categoryTotals: Record<Category, number> = { CS: 50, Maths: 25, Aptitude: 25, English: 15, GK: 5 };
  let totalScore = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correctAnswer) {
      categoryScores[q.category]++;
      totalScore++;
    }
  });
  return { totalScore, categoryScores, categoryTotals };
}

export default function QuizEngine({ questions, userData, onComplete, onExit }: Props) {
  const [currentIdx, setCurrentIdx] = useState(() => {
    const s = localStorage.getItem('lbs_quiz_current_idx');
    return s ? Math.min(parseInt(s), questions.length - 1) : 0;
  });
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const s = localStorage.getItem('lbs_quiz_answers');
    return s ? JSON.parse(s) : {};
  });
  const [markedForReview, setMarkedForReview] = useState<string[]>(() => {
    const s = localStorage.getItem('lbs_quiz_marked');
    return s ? JSON.parse(s) : [];
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const s = localStorage.getItem('lbs_quiz_time');
    return s ? parseInt(s) : TEST_DURATION;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const activeCategory = questions[currentIdx]?.category ?? 'CS';
  const currentQuestion = questions[currentIdx];

  // Persist state
  useEffect(() => { localStorage.setItem('lbs_quiz_current_idx', currentIdx.toString()); }, [currentIdx]);
  useEffect(() => { localStorage.setItem('lbs_quiz_answers', JSON.stringify(answers)); }, [answers]);
  useEffect(() => { localStorage.setItem('lbs_quiz_marked', JSON.stringify(markedForReview)); }, [markedForReview]);
  useEffect(() => { localStorage.setItem('lbs_quiz_time', timeLeft.toString()); }, [timeLeft]);

  // Timer
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    const { totalScore, categoryScores, categoryTotals } = calculateScore(questions, answers);
    const finalResult: TestResult = {
      userData, totalScore, totalQuestions: questions.length,
      categoryScores, categoryTotals, answers, markedForReview,
      timeTaken: TEST_DURATION - timeLeft,
      createdAt: new Date().toISOString(),
    };
    saveResult(finalResult);
    onComplete(finalResult);
    setIsSubmitting(false);
  }, [isSubmitting, questions, answers, userData, markedForReview, timeLeft, onComplete]);

  useEffect(() => {
    if (timeLeft <= 0) { handleFinalSubmit(); return; }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, handleFinalSubmit]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' && currentIdx < questions.length - 1) setCurrentIdx(p => p + 1);
      if (e.key === 'ArrowLeft' && currentIdx > 0) setCurrentIdx(p => p - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIdx, questions.length]);

  const handleExit = async () => {
    if (isExiting) return;
    setIsExiting(true);
    const { totalScore, categoryScores, categoryTotals } = calculateScore(questions, answers);
    const finalResult: TestResult = {
      userData, totalScore, totalQuestions: questions.length,
      categoryScores, categoryTotals, answers, markedForReview,
      timeTaken: TEST_DURATION - timeLeft,
      createdAt: new Date().toISOString(),
    };
    saveResult(finalResult);
    onExit();
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 300; // < 5 minutes

  const getStatus = (q: Question, idx: number) => {
    if (markedForReview.includes(q.id)) return 'review';
    if (answers[q.id] !== undefined) return 'answered';
    if (idx < currentIdx) return 'skipped';
    return 'unattempted';
  };

  const handleCategoryJump = (cat: Category) => {
    const idx = questions.findIndex(q => q.category === cat);
    if (idx !== -1) setCurrentIdx(idx);
  };

  const toggleMark = () => {
    setMarkedForReview(prev =>
      prev.includes(currentQuestion.id)
        ? prev.filter(id => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  };

  const clearAnswer = () => {
    setAnswers(prev => { const n = { ...prev }; delete n[currentQuestion.id]; return n; });
  };

  const answeredCount = Object.keys(answers).length;
  const catAnswered = (cat: Category) =>
    questions.filter(q => q.category === cat && answers[q.id] !== undefined).length;

  // Question Navigator Panel (shared between sidebar and mobile drawer)
  const QuestionNavigator = () => (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Navigator</h3>
        <div className="bg-blue-50 px-2.5 py-1 rounded-lg text-[10px] font-black text-blue-600 border border-blue-100">
          {answeredCount}/{questions.length}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[
          { label: 'Answered', color: 'bg-emerald-500' },
          { label: 'Skipped', color: 'bg-red-400' },
          { label: 'Review', color: 'bg-amber-500' },
          { label: 'Unvisited', color: 'bg-slate-200' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
            <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryJump(cat)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all border ${
              activeCategory === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'
            }`}
          >
            {cat} <span className="opacity-70">{catAnswered(cat)}/{CAT_META[cat].total}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-y-auto flex-1 pr-1 no-scrollbar">
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, i) => {
            if (q.category !== activeCategory) return null;
            const status = getStatus(q, i);
            const isCurrent = i === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => { setCurrentIdx(i); setShowMobileNav(false); }}
                className={`h-9 rounded-lg text-[11px] font-black border transition-all active:scale-90 flex items-center justify-center ${
                  status === 'answered' ? 'bg-emerald-500 border-emerald-500 text-white' :
                  status === 'skipped'  ? 'bg-red-400 border-red-400 text-white' :
                  status === 'review'   ? 'bg-amber-500 border-amber-500 text-white' :
                                          'bg-slate-50 border-slate-200 text-slate-400'
                } ${isCurrent ? '!ring-2 !ring-blue-600 !border-blue-600 !text-blue-600 !bg-white' : ''}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Finalize */}
      <div className="pt-4 mt-4 border-t border-slate-100">
        <button
          onClick={() => setShowConfirmSubmit(true)}
          id="finalize-test-btn"
          className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group"
        >
          FINALIZE TEST
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );

  if (!currentQuestion) return null;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-['Inter'] relative">

      {/* Confirm Submit Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirmSubmit(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Finalize Test?</h3>
                <p className="text-slate-500 text-sm font-medium mb-2">
                  You've answered <span className="text-blue-600 font-bold">{answeredCount}</span> of{' '}
                  <span className="font-bold">{questions.length}</span> questions.
                </p>
                <p className="text-red-500 text-xs font-bold mb-7">
                  Ensure you have attempted all 5 categories before submitting.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleFinalSubmit} disabled={isSubmitting}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-60"
                  >
                    {isSubmitting ? 'SUBMITTING…' : 'YES, SUBMIT'}
                  </button>
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {showMobileNav && (
          <div className="fixed inset-0 z-[150] lg:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMobileNav(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white rounded-t-3xl p-5 pb-8 max-h-[75vh] flex flex-col z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-800">Question Navigator</h3>
                <button onClick={() => setShowMobileNav(false)} className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <QuestionNavigator />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center shrink-0 z-[100] shadow-sm px-3 md:px-6">
        <div className="w-full flex items-center justify-between gap-2">
          {/* Left: Logo + Category Nav */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <CheckCircle2 className="text-white w-4 h-4" />
              </div>
              <span className="font-black text-slate-800 text-xs md:text-sm hidden sm:inline tracking-tight">CET MOCK</span>
            </div>
            <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar border border-slate-200/50">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryJump(cat)}
                  className={`px-2 md:px-3.5 py-1 md:py-1.5 rounded-lg text-[9px] md:text-xs font-black shrink-0 transition-all uppercase tracking-wider ${
                    activeCategory === cat
                      ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button
              onClick={handleExit} disabled={isExiting}
              className="text-[9px] md:text-xs font-black text-red-500 hover:text-white hover:bg-red-500 transition-all uppercase tracking-widest px-3 py-1.5 md:py-2 rounded-xl border-2 border-red-100 hover:border-red-500 bg-red-50/50"
            >
              {isExiting ? 'Exiting…' : 'Exit'}
            </button>

            <div className={`flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 rounded-xl border shrink-0 transition-all ${
              isLowTime ? 'bg-red-600 border-red-600 timer-warning' : 'bg-slate-900 border-slate-800'
            }`}>
              <Clock className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isLowTime ? 'text-white' : 'text-blue-400'}`} />
              <span className={`font-mono font-bold text-xs md:text-base leading-none ${isLowTime ? 'text-white' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest max-w-[80px] truncate">{userData.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] overflow-hidden">

        {/* Question Area */}
        <main className="overflow-y-auto px-3 sm:px-6 md:px-8 py-5 md:py-6 flex flex-col items-center bg-slate-50">
          <div className="w-full max-w-2xl flex-1 flex flex-col">

            {/* Progress bar */}
            <div className="mb-4 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm"
              >
                {/* Q header */}
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs font-black">
                      Q {currentIdx + 1}
                    </span>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{currentQuestion.category}</span>
                    <span className="text-slate-300 text-xs">of {questions.length}</span>
                  </div>
                  <button
                    onClick={toggleMark}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      markedForReview.includes(currentQuestion.id)
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'text-slate-400 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${markedForReview.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">{markedForReview.includes(currentQuestion.id) ? 'Reviewing' : 'Mark'}</span>
                  </button>
                </div>

                {/* Question text */}
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 leading-snug mb-5">
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="flex flex-col gap-2.5 md:gap-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[currentQuestion.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: idx }))}
                        className={`flex items-center gap-3 w-full p-3 md:p-4 rounded-xl border-2 text-left transition-all group active:scale-[0.99] ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 shadow-sm shadow-blue-600/10'
                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'border-slate-200 bg-white group-hover:border-slate-300 text-slate-400'
                        }`}>
                          <span className="text-[11px] font-black">{String.fromCharCode(65 + idx)}</span>
                        </div>
                        <span className={`text-sm md:text-base font-semibold leading-snug ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Sticky Bottom Actions Container */}
            <div className="sticky bottom-0 mt-auto bg-slate-50/95 backdrop-blur-md z-10 border-t border-slate-100 lg:border-none pt-3 pb-4 sm:pb-6">
              
              {/* Navigation Bar */}
              <div className="flex items-center justify-between gap-2 mb-3 lg:mb-0">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(p => p - 1)}
                  className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-sm bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" /> Prev
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={clearAnswer}
                    className="py-2.5 px-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all uppercase tracking-widest"
                  >
                    Clear
                  </button>

                  {/* Mobile: Question Map button */}
                  <button
                    onClick={() => setShowMobileNav(true)}
                    className="lg:hidden py-2.5 px-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <Map className="w-3.5 h-3.5" /> Map
                  </button>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx(p => p + 1)}
                      className="flex items-center gap-1.5 py-2.5 px-5 sm:px-8 rounded-xl font-black text-sm bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.98] transition-all"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowConfirmSubmit(true)}
                      className="flex items-center gap-1.5 py-2.5 px-5 sm:px-8 rounded-xl font-black text-sm bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-[0.98] transition-all"
                    >
                      Finish <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Mini Palette Strip */}
              <div className="lg:hidden">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeCategory}</span>
                  <span className="text-[10px] text-slate-300">· {catAnswered(activeCategory)}/{CAT_META[activeCategory].total} answered</span>
                </div>
                <div className="w-full max-h-[25vh] overflow-y-auto no-scrollbar">
                  <div className="flex flex-wrap gap-2 pb-1">
                    {questions.map((q, i) => {
                      if (q.category !== activeCategory) return null;
                      const status = getStatus(q, i);
                      const isCurrent = i === currentIdx;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIdx(i)}
                          className={`w-[calc(14.28%-6.85px)] aspect-square rounded-lg text-[11px] sm:text-xs font-black border-2 flex items-center justify-center transition-all active:scale-90 ${
                            isCurrent
                              ? 'bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-600/20'
                              : status === 'answered'  ? 'bg-emerald-500 border-emerald-500 text-white'
                              : status === 'skipped'   ? 'bg-red-400 border-red-400 text-white'
                              : status === 'review'    ? 'bg-amber-500 border-amber-500 text-white'
                              :                          'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col bg-white border-l border-slate-200 px-5 py-5 overflow-y-auto">
          <QuestionNavigator />
        </aside>
      </div>
    </div>
  );
}
