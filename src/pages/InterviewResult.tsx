import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Award, CheckCircle2, XCircle, ArrowLeft, RotateCcw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Navbar } from '../components/layout/Navbar'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'

export function InterviewResult() {
  const { id } = useParams()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('interview_sessions').select('*').eq('id', id).single()
      .then(({ data }) => { setSession(data); setLoading(false) })
  }, [id])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (!session) return <div className="min-h-screen flex items-center justify-center"><p>Session not found</p></div>

  const score = session.score || 0
  const getScoreColor = (s: number) => s >= 75 ? 'text-green-600' : s >= 50 ? 'text-yellow-600' : 'text-red-600'
  const getScoreBg = (s: number) => s >= 75 ? 'bg-green-100 dark:bg-green-900/30' : s >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'

  const correctCount = session.questions.filter((q: any) => session.answers?.[q.id] === q.correctAnswer).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/interview" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Interviews
        </Link>

        <Card className="text-center mb-6">
          <Award size={40} className={`mx-auto mb-3 ${getScoreColor(score)}`} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{session.role} Interview</h1>
          <p className="text-gray-500 text-sm mb-4">
            {new Date(session.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl ${getScoreBg(score)} mx-auto mb-3`}>
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
          </div>
          <p className="text-gray-500 text-sm mb-2">{correctCount} out of {session.questions.length} correct</p>
          <p className={`font-semibold ${getScoreColor(score)}`}>
            {score >= 75 ? '🎉 Excellent Performance!' : score >= 50 ? '👍 Good Effort!' : '📚 Keep Practicing!'}
          </p>
        </Card>

        {session.feedback && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" /> Strengths
              </h3>
              <ul className="space-y-1.5">
                {session.feedback.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-green-500">✓</span>{s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <XCircle size={16} className="text-orange-500" /> Improvements
              </h3>
              <ul className="space-y-1.5">
                {session.feedback.improvements.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-orange-500">→</span>{s}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Question-wise Review</h2>
        <div className="space-y-4">
          {session.questions.map((q: any, i: number) => {
            const selected = session.answers?.[q.id]
            const isCorrect = selected === q.correctAnswer
            return (
              <Card key={q.id}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500">Q{i + 1}</span>
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                      <CheckCircle2 size={14} /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                      <XCircle size={14} /> Incorrect
                    </span>
                  )}
                </div>
                <p className="font-medium text-gray-900 dark:text-white text-sm mb-3">{q.question}</p>

                <div className="space-y-2">
                  {q.options.map((option: string, idx: number) => {
                    const isThisCorrect = idx === q.correctAnswer
                    const isThisSelected = idx === selected
                    let style = 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    if (isThisCorrect) style = 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium'
                    else if (isThisSelected && !isThisCorrect) style = 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'

                    return (
                      <div key={idx} className={`text-sm px-3 py-2 rounded-lg border ${style} flex items-center justify-between`}>
                        <span>{option}</span>
                        {isThisCorrect && <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />}
                        {isThisSelected && !isThisCorrect && <XCircle size={14} className="text-red-600 flex-shrink-0" />}
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  💡 {q.explanation}
                </p>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <Link to="/interview" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl">
              <RotateCcw size={16} /> Try Again
            </button>
          </Link>
          <Link to="/dashboard" className="flex-1">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}