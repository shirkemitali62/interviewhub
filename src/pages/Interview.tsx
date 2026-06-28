import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Clock, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { interviewQuestions, roleIcons } from '../data/interviewQuestions'
import { Navbar } from '../components/layout/Navbar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import toast from 'react-hot-toast'

type Question = { id: string; question: string; category: string; difficulty: string; hint?: string }

export function Interview() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const roles = Object.keys(interviewQuestions)
  const questions: Question[] = selectedRole ? interviewQuestions[selectedRole].slice(0, 5) : []
  const currentQuestion = questions[currentQ]

  const startInterview = () => {
    if (!selectedRole) { toast.error('Please select a role'); return }
    setStarted(true); setCurrentQ(0); setAnswers({}); setCurrentAnswer('')
  }

  const nextQuestion = () => {
    if (!currentAnswer.trim()) { toast.error('Please write an answer'); return }
    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer }
    setAnswers(newAnswers); setCurrentAnswer(''); setShowHint(false)
    if (currentQ < questions.length - 1) { setCurrentQ(prev => prev + 1) }
    else { submitInterview(newAnswers) }
  }

  const submitInterview = async (finalAnswers: Record<string, string>) => {
    setSubmitting(true)
    const feedback = generateFeedback(questions, finalAnswers)
    const { data } = await supabase.from('interview_sessions').insert({
      user_id: user!.id, role: selectedRole,
      questions, answers: finalAnswers, feedback,
      score: feedback.overall_score,
      completed_at: new Date().toISOString(),
    }).select().single()
    toast.success(`Interview complete! Score: ${feedback.overall_score}%`)
    navigate(`/interview/result/${data?.id}`)
    setSubmitting(false)
  }

  const generateFeedback = (qs: Question[], ans: Record<string, string>) => {
    const answerFeedbacks: Record<string, any> = {}
    let totalScore = 0
    qs.forEach(q => {
      const answer = ans[q.id] || ''
      const wordCount = answer.split(/\s+/).filter(Boolean).length
      let score = 0
      if (wordCount >= 50) score += 40
      else if (wordCount >= 20) score += 25
      else if (wordCount >= 5) score += 10
      const keywords = q.hint?.toLowerCase().split(' ') || []
      const keywordsUsed = keywords.filter(kw => answer.toLowerCase().includes(kw))
      score = Math.min(100, score + keywordsUsed.length * 10)
      totalScore += score
      answerFeedbacks[q.id] = {
        score, keywords_used: keywordsUsed,
        feedback: score >= 70 ? 'Great answer!' : score >= 40 ? 'Good, add more details.' : 'Elaborate more using STAR method.',
        improvement: `Mention: ${q.hint}`,
      }
    })
    return {
      overall_score: Math.round(totalScore / qs.length),
      answers: answerFeedbacks,
      strengths: totalScore / qs.length >= 60 ? ['Good knowledge', 'Clear communication'] : ['Attempted all questions'],
      improvements: ['Add specific examples', 'Quantify achievements', 'Use STAR method'],
    }
  }

  if (submitting) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Brain size={48} className="text-blue-600 animate-pulse" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">Analyzing your answers...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!started ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mock Interview</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Select your role and start practicing</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {roles.map(role => (
                <Card key={role} hover onClick={() => setSelectedRole(role)}
                  className={`text-center cursor-pointer ${selectedRole === role ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                  <div className="text-3xl mb-2">{roleIcons[role]}</div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{role}</p>
                </Card>
              ))}
            </div>
            {selectedRole && (
              <Card className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{roleIcons[selectedRole]} {selectedRole}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">5 questions • ~15 minutes</p>
                  </div>
                  <Button onClick={startInterview} size="lg">Start Interview <ChevronRight size={18} /></Button>
                </div>
              </Card>
            )}
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Question {currentQ + 1} of {questions.length}</span>
                <div className="flex items-center gap-1 text-sm text-gray-500"><Clock size={14} /><span>{selectedRole}</span></div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            <Card className="mb-4">
              <div className="flex items-start justify-between mb-3">
                <Badge label={currentQuestion.category} color="blue" />
                <Badge label={currentQuestion.difficulty}
                  color={currentQuestion.difficulty === 'easy' ? 'green' : currentQuestion.difficulty === 'medium' ? 'yellow' : 'red'} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">{currentQuestion.question}</h2>
              {currentQuestion.hint && (
                <button onClick={() => setShowHint(!showHint)} className="mt-3 text-sm text-blue-600 hover:underline">
                  {showHint ? '🙈 Hide hint' : '💡 Show hint'}
                </button>
              )}
              {showHint && (
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">💡 {currentQuestion.hint}</p>
              )}
            </Card>
            <Card>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Answer</label>
              <textarea value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..." rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">{currentAnswer.split(/\s+/).filter(Boolean).length} words</span>
                <Button onClick={nextQuestion}>
                  {currentQ < questions.length - 1 ? 'Next Question' : 'Submit Interview'} <ChevronRight size={16} />
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}