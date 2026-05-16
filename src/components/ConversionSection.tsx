import type { Category } from '../types';
import { CheckCircle2, Play, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  weakCategory: Category;
}

type CourseInfo = {
  title: string;
  description: string;
  benefits: string[];
  videoPlaceholder: string;
};

const courseData: Record<Category, CourseInfo> = {
  'Maths': {
    title: 'Advanced Mathematics Mastery',
    description: 'Transform your mathematical intuition. Our proprietary framework helps you solve complex problems in half the time.',
    benefits: ['Strategic Problem Solving', 'Real-world Applications', '1-on-1 Mentorship Session'],
    videoPlaceholder: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
  },
  'CS': {
    title: 'Computer Science Architecture',
    description: 'Master the fundamental principles of systems and software design used by engineers at top tech companies.',
    benefits: ['System Design Patterns', 'Efficiency Optimization', 'Industry-standard Projects'],
    videoPlaceholder: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
  },
  'English': {
    title: 'Professional Communication & Rhetoric',
    description: 'Elevate your verbal and written impact. Learn the art of persuasive communication for professional success.',
    benefits: ['Executive Communication', 'Advanced Vocabulary', 'Writing Workshops'],
    videoPlaceholder: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
  },
  'Aptitude': {
    title: 'Cognitive Reasoning Intensive',
    description: 'Unlock your cognitive potential. This bootcamp sharpens your logical processing and pattern recognition.',
    benefits: ['Logical Shortcuts', 'Pattern Decoding', 'Decision-making Frameworks'],
    videoPlaceholder: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=800',
  },
  'GK': {
    title: 'General Awareness Strategy',
    description: 'Stay ahead of the curve with our curated GK modules. Perfect for competitive exam aspirants.',
    benefits: ['Daily Current Affairs', 'Static GK Vault', 'Monthly Recaps'],
    videoPlaceholder: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
  }
};

export default function ConversionSection({ weakCategory }: Props) {
  const course = courseData[weakCategory] || courseData['Maths'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-[32px] md:rounded-[48px] border border-slate-200 overflow-hidden relative shadow-2xl shadow-slate-200/50"
    >
      <div className="p-8 md:p-12 lg:p-20 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full mb-8 border border-slate-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-600">Recommended Pathway</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
            Bridge the Gap in <br className="hidden md:block" />
            <span className="text-blue-600">{weakCategory}</span>
          </h2>
          
          <p className="text-base md:text-lg text-slate-500 leading-relaxed mb-10 font-medium max-w-xl mx-auto lg:mx-0">
            {course.description}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {course.benefits.map((benefit: string, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="bg-emerald-100 p-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 lg:flex-none px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-base shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
              Join Course <ArrowRight className="w-5 h-5" />
            </button>
            <button className="flex-1 lg:flex-none px-10 py-5 bg-white text-slate-600 rounded-2xl border-2 border-slate-200 font-black text-base hover:bg-slate-50 transition-all">
              Curriculum
            </button>
          </div>
        </div>

        <div className="relative rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl shadow-slate-400/20 group">
          <img 
            src={course.videoPlaceholder} 
            alt="Course Preview" 
            className="w-full h-72 md:h-[450px] lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
            <button className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl hover:scale-110 transition-transform cursor-pointer group/play">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-black fill-black ml-1 group-hover/play:text-blue-600 group-hover/play:fill-blue-600 transition-colors" />
            </button>
            <p className="text-[10px] md:text-xs font-black text-white/60 uppercase tracking-[0.2em] mb-2">Preview Lecture</p>
            <h4 className="text-xl md:text-3xl font-black text-white leading-tight">{course.title}</h4>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
