import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import QuizEngine from './components/QuizEngine';
import ResultPage from './components/ResultPage';
import type { UserData, TestResult, Question } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, AlertCircle, RefreshCw } from 'lucide-react';

type AppState = 'landing' | 'quiz' | 'result';

function App() {
  // --- Question Data ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingState, setLoadingState] = useState<'loading' | 'ready' | 'error'>('loading');

  // --- App Navigation State (persisted) ---
  const [appState, setAppState] = useState<AppState>(() => {
    return (localStorage.getItem('lbs_mock_state') as AppState) || 'landing';
  });
  const [userData, setUserData] = useState<UserData | null>(() => {
    const s = localStorage.getItem('lbs_mock_user');
    return s ? JSON.parse(s) : null;
  });
  const [result, setResult] = useState<TestResult | null>(() => {
    const s = localStorage.getItem('lbs_mock_result');
    return s ? JSON.parse(s) : null;
  });

  // Fetch questions once on mount
  useEffect(() => {
    fetch('/questions.json')
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); })
      .then((data: Question[]) => { setQuestions(data); setLoadingState('ready'); })
      .catch(() => setLoadingState('error'));
  }, []);

  // Persist state
  useEffect(() => { localStorage.setItem('lbs_mock_state', appState); }, [appState]);
  useEffect(() => { if (userData) localStorage.setItem('lbs_mock_user', JSON.stringify(userData)); }, [userData]);
  useEffect(() => { if (result) localStorage.setItem('lbs_mock_result', JSON.stringify(result)); }, [result]);

  const handleStart = (data: UserData) => { setUserData(data); setAppState('quiz'); };
  const handleComplete = (res: TestResult) => {
    setResult(res);
    setAppState('result');
    ['lbs_quiz_answers', 'lbs_quiz_current_idx', 'lbs_quiz_time', 'lbs_quiz_marked'].forEach(k => localStorage.removeItem(k));
  };
  const handleReset = () => { localStorage.clear(); window.location.reload(); };

  // Loading screen
  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/30">
            <GraduationCap className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight">LBS MCA MOCK TEST</span>
        </div>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-semibold text-sm">Loading 120 questions…</p>
      </div>
    );
  }

  // Error screen
  if (loadingState === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full">
          <AlertCircle className="text-red-500 w-14 h-14 mx-auto mb-5" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Failed to Load Questions</h2>
          <p className="text-slate-500 font-medium mb-8 text-sm">Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {appState === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            <LandingPage onStart={handleStart} totalQuestions={questions.length} />
          </motion.div>
        )}

        {appState === 'quiz' && userData && questions.length > 0 && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            <QuizEngine questions={questions} userData={userData} onComplete={handleComplete} onExit={handleReset} />
          </motion.div>
        )}

        {appState === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <ResultPage result={result} questions={questions} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
