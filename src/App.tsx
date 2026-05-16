import { useState, useEffect, lazy, Suspense } from 'react';
import LandingPage from './components/LandingPage';
import type { UserData, TestResult, Question } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, AlertCircle, RefreshCw } from 'lucide-react';

const QuizEngine = lazy(() => import('./components/QuizEngine'));
const ResultPage = lazy(() => import('./components/ResultPage'));

type AppState = 'landing' | 'quiz' | 'result';

const SITE_URL = 'https://lbsmcafreemock.cetmca.in/';

const META_BY_STATE: Record<AppState, { title: string; description: string }> = {
  landing: {
    title: 'Free LBS MCA Mock Test 2026 | CET Trivandrum',
    description: 'Practice the free LBS MCA Mock Test 2026 by CET Trivandrum with 120 questions, a 120-minute timer, instant scoring, and category-wise analytics.',
  },
  quiz: {
    title: 'LBS MCA Mock Test In Progress | CET Trivandrum',
    description: 'Continue the free LBS MCA mock test and complete 120 questions across CS, Maths, Aptitude, English, and GK.',
  },
  result: {
    title: 'LBS MCA Mock Test Result | CET Trivandrum',
    description: 'Review your LBS MCA mock test score, subject-wise analytics, accuracy, and performance insights.',
  },
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement(attributes.href ? 'link' : 'meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

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

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const meta = META_BY_STATE[appState];
    document.title = meta.title;
    upsertMeta('meta[name="description"]', { name: 'description', content: meta.description });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: SITE_URL });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description });
    upsertMeta('link[rel="canonical"]', { rel: 'canonical', href: SITE_URL });
  }, [appState]);

  const handleStart = (data: UserData) => { setUserData(data); setAppState('quiz'); };
  const handleComplete = (res: TestResult) => {
    setResult(res);
    setAppState('result');
    ['lbs_quiz_answers', 'lbs_quiz_current_idx', 'lbs_quiz_time', 'lbs_quiz_marked'].forEach(k => localStorage.removeItem(k));
  };
  const handleReset = () => { localStorage.clear(); window.location.reload(); };

  const renderLoadingPanel = (message: string) => (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="text-center bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 px-8 py-10 max-w-sm w-full">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
        <p className="text-slate-700 font-bold text-lg">{message}</p>
        <p className="text-slate-500 text-sm mt-2">Optimizing the initial page load.</p>
      </div>
    </div>
  );

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
            <Suspense fallback={renderLoadingPanel('Loading the quiz experience...')}>
              <QuizEngine questions={questions} userData={userData} onComplete={handleComplete} onExit={handleReset} />
            </Suspense>
          </motion.div>
        )}

        {appState === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <Suspense fallback={renderLoadingPanel('Loading your result...')}>
              <ResultPage result={result} questions={questions} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
