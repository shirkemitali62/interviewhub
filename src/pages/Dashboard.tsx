import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Brain, TrendingUp, Clock, ArrowRight, Award } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Navbar } from '../components/layout/Navbar'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ resumes: 0, interviews: 0, avgScore: 0, bestScore: 0 })
  const [loading, setLoading] = useState(true)
  const [profileName, setProfileName] = useState('')

  useEffect(() => {
    if (user) fetchStats()
  }, [user])

  const fetchStats = async () => {
    const [{ data: resumes }, { data: sessions }, { data: profile }] = await Promise.all([
      supabase.from('resumes').select('ats_score').eq('user_id', user!.id),
      supabase.from('interview_sessions').select('score').eq('user_id', user!.id).not('score', 'is', null),
      supabase.from('profiles').select('full_name').eq('id', user!.id).single(),
    ])
    const scores = sessions?.map(s => s.score).filter(Boolean) as number[] || []
    setStats({
      resumes: resumes?.length || 0,
      interviews: sessions?.length || 0,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      bestScore: scores.length ? Math.max(...scores) : 0,
    })
    setProfileName(profile?.full_name || user?.email?.split('@')[0] || 'User')
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profileName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Here's your interview prep overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Resumes Uploaded', value: stats.resumes, icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
            { label: 'Mock Interviews', value: stats.interviews, icon: Brain, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
            { label: 'Avg Interview Score', value: stats.avgScore ? `${stats.avgScore}%` : 'N/A', icon: TrendingUp, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
            { label: 'Best Score', value: stats.bestScore ? `${stats.bestScore}%` : 'N/A', icon: Award, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { to: '/resume', icon: FileText, title: 'Upload Resume', desc: 'Get your ATS score instantly', color: 'from-blue-500 to-blue-600' },
            { to: '/interview', icon: Brain, title: 'Mock Interview', desc: 'Practice role-based questions', color: 'from-purple-500 to-purple-600' },
            { to: '/resume/history', icon: Clock, title: 'Resume History', desc: 'View past uploads & scores', color: 'from-green-500 to-green-600' },
          ].map(({ to, icon: Icon, title, desc, color }) => (
            <Link key={to} to={to}>
              <Card hover className="h-full">
                <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{desc}</p>
                <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                  Get Started <ArrowRight size={14} />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Tips */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Upload your latest resume to check ATS compatibility</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Practice mock interviews for your target role daily</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Use keywords from job descriptions in your resume</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Quantify your achievements with numbers and percentages</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}