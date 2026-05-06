import { useState, useEffect } from 'react';
import { questions } from '../data/questions';
import type { UserData, TestResult, Category } from '../types';
import { ArrowRight, ArrowLeft, Send, User, CheckCircle2, Bookmark, Clock } from 'lucide-react';
import { saveResult } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  userData: UserData;
  onComplete: (result: TestResult) => void;
  onExit: () => void;
}

const TEST_DURATION = 120 * 60;

export default function QuizEngine({ userData, onComplete, onExit }: Props) {
  // Initialize states from localStorage if available
  const [currentIdx, setCurrentIdx] = useState(() => {
    const saved = localStorage.getItem('lbs_quiz_current_idx');
    return saved ? parseInt(saved) : 0;
  });
  
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('lbs_quiz_answers');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [markedForReview, setMarkedForReview] = useState<string[]>(() => {
    const saved = localStorage.getItem('lbs_quiz_marked');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeCategory, setActiveCategory] = useState<Category>(() => {
    return (questions[currentIdx]?.category as Category) || 'CS';
  });
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('lbs_quiz_time');
    return saved ? parseInt(saved) : TEST_DURATION;
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const currentQuestion = questions[currentIdx];

  // Save progress on every change
  useEffect(() => {
    localStorage.setItem('lbs_quiz_current_idx', currentIdx.toString());
    setActiveCategory(questions[currentIdx].category);
  }, [currentIdx]);

  useEffect(() => {
    localStorage.setItem('lbs_quiz_answers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem('lbs_quiz_marked', JSON.stringify(markedForReview));
  }, [markedForReview]);

  useEffect(() => {
    localStorage.setItem('lbs_quiz_time', timeLeft.toString());
  }, [timeLeft]);

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    const firstIdxOfCat = questions.findIndex(q => q.category === cat);
    setCurrentIdx(firstIdxOfCat);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setShowConfirmSubmit(false);
    console.log("Submitting test...");

    const categoryScores: Record<Category, number> = {
      'CS': 0, 'Maths': 0, 'Aptitude': 0, 'English': 0, 'GK': 0
    };

    let totalScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        categoryScores[q.category] += 1;
        totalScore += 1;
      }
    });

    const finalResult: TestResult = {
      userData, totalScore, categoryScores, answers, markedForReview, createdAt: new Date()
    };

    // Save result in background (non-blocking for better UX)
    saveResult(finalResult);
    onComplete(finalResult);
    setIsSubmitting(false);
  };

  const handleExit = async () => {
    if (isExiting) return;
    setIsExiting(true);

    const categoryScores: Record<Category, number> = {
      'CS': 0, 'Maths': 0, 'Aptitude': 0, 'English': 0, 'GK': 0
    };

    let totalScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        categoryScores[q.category] += 1;
        totalScore += 1;
      }
    });

    const finalResult: TestResult = {
      userData, totalScore, categoryScores, answers, markedForReview, createdAt: new Date()
    };

    // Save in background
    saveResult(finalResult);
    onExit();
    setIsExiting(false);
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (qId: string) => {
    if (markedForReview.includes(qId)) return 'review';
    if (answers[qId] !== undefined) return 'answered';
    if (currentIdx > questions.findIndex(q => q.id === qId)) return 'skipped';
    return 'unattempted';
  };

  const categoriesList: Category[] = ['CS', 'Maths', 'Aptitude', 'English', 'GK'];

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-['Inter'] relative">
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmSubmit(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 md:p-10 max-w-sm w-full relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Finalize Test?</h3>
                <p className="text-slate-500 font-medium mb-8">Are you sure you want to submit your answers? <span className="text-red-500 font-bold">make sure you have attempted all the categories that mentioned in upper section (CS, Maths, Aptitude, English, GK).</span></p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-base shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'YES, PROCEED'}
                  </button>
                  <button
                    onClick={() => setShowConfirmSubmit(false)}
                    className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-base hover:bg-slate-200 transition-all active:scale-[0.98]"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-16 md:h-20 bg-white border-b border-slate-200 flex items-center justify-center px-4 md:px-8 shrink-0 z-[100] shadow-sm">
        <div className="max-w-7xl w-full flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-blue-600 p-1.5 md:p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
                <CheckCircle2 className="text-white w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="font-black text-slate-800 text-sm md:text-xl hidden sm:inline tracking-tight">CET MOCK</span>
            </div>
            
            <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto no-scrollbar border border-slate-200/50">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 md:px-5 py-1.5 md:py-2.5 rounded-lg text-[10px] md:text-sm font-black shrink-0 transition-all uppercase tracking-wider ${
                    activeCategory === cat ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 md:gap-6 ml-4">
            <button
              onClick={handleExit}
              disabled={isExiting}
              className="text-[10px] md:text-xs font-black text-red-500 hover:text-white hover:bg-red-500 transition-all uppercase tracking-widest px-4 py-2 md:py-2.5 rounded-xl border-2 border-red-100 hover:border-red-500 bg-red-50/50 flex items-center gap-2"
            >
              {isExiting ? 'Exiting...' : 'Exit Test'}
            </button>
            <div className="flex items-center gap-2 bg-slate-900 px-3 md:px-4 py-2 md:py-2.5 rounded-xl shadow-lg shadow-slate-900/10 shrink-0 border border-slate-800">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <span className="font-mono text-white font-bold text-sm md:text-xl leading-none">{formatTime(timeLeft)}</span>
            </div>
            <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="m-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">{userData.name}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                <User className="w-6 h-6 text-slate-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] overflow-hidden">
        {/* Left: Question Card Area */}
        <main className="overflow-y-auto px-4 md:px-8 py-6 flex flex-col items-center bg-slate-50">
          <div className="w-full max-w-3xl flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl md:rounded-3xl border border-slate-200 p-4 md:p-8 shadow-sm lg:flex-initial min-h-0 pb-32 sm:pb-8"
              >
                <div className="flex justify-between items-center mb-4 md:mb-8 border-b border-slate-100 pb-3 md:pb-6">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] md:text-sm font-black">
                      Q {currentIdx + 1}
                    </span>
                    <span className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest">{currentQuestion.category}</span>
                  </div>
                  <button 
                    onClick={() => setMarkedForReview(prev => 
                      prev.includes(currentQuestion.id) ? prev.filter(id => id !== currentQuestion.id) : [...prev, currentQuestion.id]
                    )}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] md:text-sm font-bold transition-all border ${
                      markedForReview.includes(currentQuestion.id) 
                      ? 'bg-amber-50 text-amber-600 border-amber-100' 
                      : 'text-slate-400 border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 md:w-5 md:h-5 ${markedForReview.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
                    {markedForReview.includes(currentQuestion.id) ? 'Reviewing' : 'Mark Review'}
                  </button>
                </div>

                <div className="mb-6 md:mb-10">
                  <h2 className="text-base md:text-2xl font-bold text-slate-800 leading-snug mb-6">
                    {currentQuestion.question}
                  </h2>

                  <div className="flex flex-col gap-2 md:gap-4">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = answers[currentQuestion.id] === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: idx }))}
                          className={`flex items-center gap-3 w-full p-3 md:p-5 rounded-xl border-2 text-left transition-all group ${
                            isSelected 
                            ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-600/5' 
                            : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-7 h-7 md:w-10 md:h-10 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                            isSelected 
                            ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'border-slate-200 bg-white group-hover:border-slate-300 text-slate-400'
                          }`}>
                            <span className="text-[10px] md:text-sm font-black">{String.fromCharCode(65 + idx)}</span>
                          </div>
                          <span className={`text-xs md:text-base font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-600'}`}>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="sticky bottom-0 bg-slate-50/90 backdrop-blur-md pt-2 pb-6 mt-auto z-10 sm:border-none">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4 px-1 sm:px-0">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  className="flex items-center justify-center gap-2 py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  Previous
                </button>

                <div className="flex gap-2 sm:gap-3 flex-1 sm:flex-initial">
                  <button
                    onClick={() => setAnswers(prev => {
                      const newAnswers = { ...prev };
                      delete newAnswers[currentQuestion.id];
                      return newAnswers;
                    })}
                    className="flex-1 sm:flex-initial py-3 sm:py-4 px-4 sm:px-6 bg-slate-100 text-slate-500 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-sm hover:bg-slate-200 transition-all uppercase tracking-widest"
                  >
                    Clear
                  </button>
                  
                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx(prev => prev + 1)}
                      className="flex-[2] sm:flex-initial flex items-center justify-center gap-2 py-3 sm:py-4 px-6 sm:px-12 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.98] transition-all"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinalSubmit}
                      className="flex-[2] sm:flex-initial flex items-center justify-center gap-2 py-3 sm:py-4 px-6 sm:px-12 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-[0.98] transition-all"
                    >
                      Finish Test
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Becomes bottom section on mobile */}
        <aside className="bg-white border-l lg:border-slate-200 flex flex-col px-4 md:px-8 py-6 lg:h-full overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Question Navigator</h3>
              <div className="bg-blue-50 px-3 py-1 rounded-lg text-[10px] font-black text-blue-600 border border-blue-100">
                {Object.keys(answers).length}/{questions.length} Attempted
              </div>
            </div>

            {/* Legend - Even more compact */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {[
                { label: 'Ans', color: 'bg-emerald-500' },
                { label: 'Skip', color: 'bg-red-500' },
                { label: 'Rev', color: 'bg-amber-500' },
                { label: 'Unv', color: 'bg-slate-200' }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 rounded-md border border-slate-100">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Questions Grid - Scrollable and even more compact */}
            <div className="max-h-[160px] lg:max-h-none overflow-y-auto mb-4 pr-1 scrollbar-thin">
              <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-5 gap-1 md:gap-2">
                {questions.map((q, i) => {
                  if (q.category !== activeCategory) return null;
                  const status = getQuestionStatus(q.id);
                  const isCurrent = i === currentIdx;
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(i)}
                      className={`h-7 md:h-10 rounded-lg text-[9px] md:text-sm font-black border transition-all active:scale-[0.9] flex items-center justify-center ${
                        status === 'answered' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                        status === 'skipped' ? 'bg-red-500 border-red-500 text-white' : 
                        status === 'review' ? 'bg-amber-500 border-amber-500 text-white' : 
                        'bg-slate-50 border-slate-100 text-slate-400'
                      } ${isCurrent ? 'ring-2 ring-blue-600/20 !border-blue-600 !text-blue-600 !bg-white' : ''}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmSubmit(true)}
                id="finalize-test-btn"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm border-none hover:bg-black transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 group"
              >
                FINALIZE TEST
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
