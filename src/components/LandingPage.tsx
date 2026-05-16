import React, { useState } from 'react';
import type { UserData } from '../types';
import { GraduationCap, ArrowRight, Clock, BookOpen, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onStart: (data: UserData) => void;
  totalQuestions: number;
}

export default function LandingPage({ onStart, totalQuestions }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const highlights = [
    {
      title: 'Free LBS MCA practice',
      text: 'Take a free mock test built for CET Trivandrum aspirants preparing for the LBS MCA entrance exam.',
    },
    {
      title: 'Instant score analysis',
      text: 'See total score, accuracy, and category-wise performance immediately after submission.',
    },
    {
      title: 'Five subject coverage',
      text: 'Practice Computer Science, Maths, Aptitude, English, and GK in one structured exam.',
    },
  ];

  const validatePhone = (val: string) => {
    setPhone(val);
    if (val.length > 0 && !/^\d+$/.test(val)) {
      setPhoneError('Only digits allowed');
    } else if (val.length > 0 && val.length < 10) {
      setPhoneError('Must be at least 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.length >= 10 && /^\d+$/.test(phone)) {
      onStart({ name: name.trim(), phone });
    }
  };

  const isValid = name.trim().length > 0 && phone.length >= 10 && /^\d+$/.test(phone);

  const stats = [
    { icon: BookOpen, label: 'Questions', value: `${totalQuestions}` },
    { icon: Clock, label: 'Duration', value: '120 Min' },
    { icon: BarChart2, label: 'Categories', value: '5 Topics' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 py-3.5 fixed w-full z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">LBS MCA MOCK TEST</span>
          </div>
          <a
            href="https://lbscourse.cetmca.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all font-black text-xs uppercase tracking-widest"
          >
            Join LBS Prep
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:pt-28">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Brand Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100 mb-5">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Free Mock Test 2026</span>
            </div>

            <h1 className="text-[1.75rem] sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15] tracking-tighter mb-5">
              Test your knowledge with
              <br />
              <span className="text-blue-600 whitespace-nowrap">LBS MCA</span>{' '}Mock Test
            </h1>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-7 font-medium">
              Crafted by{' '}
              <span className="text-red-600 font-bold">students of Computer Applications</span>{' '}at{' '}
              <span className="text-red-600 font-bold">CET Trivandrum</span>.
              {' '}Get instant results, category-wise scoring, and detailed analytics.
            </p>

            {/* Stats Row — always 3-column */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-2.5 bg-white px-3 sm:px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-center sm:text-left">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
                    <p className="text-xs sm:text-sm font-black text-slate-800 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Categories */}
            <div className="mt-5 flex flex-wrap justify-center lg:justify-start gap-1.5">
              {[
                { cat: 'CS', n: 50 }, { cat: 'Maths', n: 25 }, { cat: 'Aptitude', n: 25 },
                { cat: 'English', n: 15 }, { cat: 'GK', n: 5 }
              ].map(({ cat, n }) => (
                <span key={cat} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
                  {cat} <span className="text-blue-600">·{n}Q</span>
                </span>
              ))}
            </div>

            <section className="mt-7 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 sm:p-6 shadow-sm" aria-labelledby="mock-test-highlights">
              <div className="flex flex-col gap-2 mb-4">
                <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">SEO and study highlights</p>
                <h2 id="mock-test-highlights" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Why this LBS MCA mock test is useful
                </h2>
                <p className="text-sm text-slate-600 font-medium leading-relaxed max-w-2xl">
                  This free mock test helps LBS MCA aspirants practice under exam conditions, improve speed, and review subject-wise weaknesses before the final exam.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {highlights.map(({ title, text }) => (
                  <article key={title} className="rounded-2xl bg-white/90 border border-slate-200 p-4 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 mb-1.5">{title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{text}</p>
                  </article>
                ))}
              </div>
            </section>
          </motion.div>

          {/* Right: Registration Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 w-full"
          >
            <div className="text-center mb-7">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1.5">Register to Start</h2>
              <p className="text-slate-500 font-medium text-sm">Enter your details to begin the exam</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label htmlFor="student-name" className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  id="student-name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-100 text-sm outline-none focus:border-blue-500 transition-all bg-slate-50 text-slate-900 font-semibold placeholder:font-normal"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label htmlFor="student-phone" className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Phone Number
                </label>
                <input
                  id="student-phone"
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  maxLength={13}
                  className={`w-full px-4 py-3.5 rounded-2xl border-2 text-sm outline-none transition-all bg-slate-50 text-slate-900 font-semibold placeholder:font-normal ${
                    phoneError ? 'border-red-300 focus:border-red-400' : 'border-slate-100 focus:border-blue-500'
                  }`}
                  value={phone}
                  onChange={e => validatePhone(e.target.value)}
                />
                {phoneError && (
                  <p className="text-xs text-red-500 font-semibold mt-0.5">{phoneError}</p>
                )}
              </div>

              {/* Note */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-xs text-amber-700 font-semibold leading-relaxed">
                ⚠️ Once you start, the 120-minute timer begins immediately. Ensure a stable internet connection.
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isValid}
                className={`mt-1 py-4 px-6 bg-blue-600 text-white rounded-2xl text-sm font-black border-none flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-blue-600/30 hover:bg-blue-700 active:scale-[0.98] ${
                  !isValid ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:-translate-y-0.5'
                }`}
              >
                START MOCK TEST
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-slate-400 font-semibold text-center">© 2026 CET Computer Applications Department</p>
          <div className="flex gap-6 text-sm font-semibold text-slate-300">
            <span className="hover:text-slate-500 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-500 cursor-pointer transition-colors">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
