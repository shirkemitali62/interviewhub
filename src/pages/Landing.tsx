import { Link } from 'react-router-dom'
import { FileText, Brain, BarChart3, Users, CheckCircle, ArrowRight, Star } from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'

export function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star size={14} fill="currentColor" />
            Free AI-Powered Interview Prep
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Ace Your Next
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Interview</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Score your resume with ATS checker, practice mock interviews by role, and get instant feedback — all for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold px-8 py-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need to Get Hired</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Powerful tools to prepare you for your dream job</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FileText, title: 'ATS Resume Scorer', desc: 'Get instant ATS score with detailed feedback on keywords, formatting, and sections.', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
            { icon: Brain, title: 'Mock Interviews', desc: 'Practice with role-specific questions for Frontend, Backend, Java, Python, HR and more.', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
            { icon: BarChart3, title: 'Instant Feedback', desc: 'Get detailed feedback on your answers with improvement suggestions.', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
            { icon: Users, title: 'Multiple Roles', desc: 'Prepare for 8+ different job roles with curated questions from industry experts.', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free in seconds. No credit card required.' },
              { step: '02', title: 'Upload Resume', desc: 'Upload your PDF resume and get instant ATS score with feedback.' },
              { step: '03', title: 'Practice & Improve', desc: 'Take mock interviews, get feedback, and land your dream job.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">{step}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Ace Your Interview?</h2>
          <p className="text-blue-100 text-lg mb-8">Join thousands of candidates who landed their dream jobs</p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all">
            Start For Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">IH</span>
            </div>
            <span className="font-semibold text-gray-700 dark:text-gray-300">InterviewHub AI</span>
          </div>
          <p>© 2024 InterviewHub AI. Built with ❤️ for job seekers.</p>
        </div>
      </footer>
    </div>
  )
}