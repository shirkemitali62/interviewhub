import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Clock, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { mcqQuestions, roleIcons } from '../data/mcqQuestions'
import type { MCQQuestion } from '../data/mcqQuestions'
import { Navbar } from '../components/layout/Navbar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import toast from 'react-hot-toast'

export function Interview() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const roles = Object.keys(mcqQuestions)
const [randomQuestions, setRandomQuestions] = useState<MCQQuestion[]>([])

const shuffleAndPick = (role: string) => {
  const all = [...mcqQuestions[role]]
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, 5)
}

const questions: MCQQuestion[] = randomQuestions
  const currentQuestion = questions[currentQ]
  const hasAnswered = currentQuestion && selectedOptions[currentQuestion.id] !== undefined

  const startInterview = () => {
    if (!selectedRole) { toast.error('Please select a role'); return }
    setRandomQuestions(shuffleAndPick(selectedRole))
    setStarted(true); setCurrentQ(0); setSelectedOptions({}); setShowFeedback(false)
  }

  const selectOption = (optionIndex: number) => {
    if (hasAnswered) return
    setSelectedOptions(prev => ({ ...prev, [currentQuestion.id]: optionIndex }))
    setShowFeedback(true)
  }

  const nextQuestion = () => {
    setShowFeedback(false)
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1)
    } else {
      submitInterview()
    }
  }

  const submitInterview = async () => {
    setSubmitting(true)
    const correctCount = questions.filter(q => selectedOptions[q.id] === q.correctAnswer).length
    const score = Math.round((correctCount / questions.length) * 100)

    const answerDetails: Record<string, any> = {}
    questions.forEach(q => {
      const selected = selectedOptions[q.id]
      answerDetails[q.id] = {
        selected,
        correct: q.correctAnswer,
        isCorrect: selected === q.correctAnswer,
        explanation: q.explanation,
      }
    })

    const feedback = {
      overall_score: score,
      answers: answerDetails,
      strengths: correctCount > questions.length / 2
        ? ['Good understanding of core concepts', `Answered ${correctCount}/${questions.length} correctly`]
        : [`Attempted all ${questions.length} questions`],
      improvements: correctCount < questions.length
        ? ['Review the explanations for incorrect answers', 'Practice more questions in weak areas']
        : ['Great job! Keep practicing to maintain this level'],
    }

    const { data } = await supabase.from('interview_sessions').insert({
      user_id: user!.id, role: selectedRole,
      questions, answers: selectedOptions, feedback, score,
      completed_at: new Date().toISOString(),
    }).select().single()

    toast.success(`Interview complete! Score: ${score}%`)
    navigate(`/interview/result/${data?.id}`)
    setSubmitting(false)
  }

  if (submitting) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Brain size={48} className="text-blue-600 animate-pulse" />
      <p className="text-gray-600 dark:text-gray-400 font-medium">Calculating your score...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!started ? (
          <>
            <div className="mb-8">
             <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Mock Interview (MCQ)</h1>
<p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Select your role and start practicing</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{roleIcons[selectedRole]} {selectedRole}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{mcqQuestions[selectedRole].length} MCQ questions • ~5 minutes</p>
                  </div>
                  <Button onClick={startInterview} size="lg" fullWidth>Start Interview <ChevronRight size={18} /></Button>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed mb-5">{currentQuestion.question}</h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOptions[currentQuestion.id] === idx
                  const isCorrect = idx === currentQuestion.correctAnswer
                  let optionStyle = 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'

                  if (showFeedback) {
                    if (isCorrect) optionStyle = 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    else if (isSelected && !isCorrect) optionStyle = 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    else optionStyle = 'border-gray-200 dark:border-gray-700 opacity-50'
                  } else if (isSelected) {
                    optionStyle = 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => selectOption(idx)}
                      disabled={hasAnswered}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${optionStyle} ${!hasAnswered ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className="text-gray-900 dark:text-white font-medium">{option}</span>
                      {showFeedback && isCorrect && <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />}
                      {showFeedback && isSelected && !isCorrect && <XCircle size={20} className="text-red-600 flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>

              {showFeedback && (
                <div className={`mt-4 p-4 rounded-xl ${selectedOptions[currentQuestion.id] === currentQuestion.correctAnswer ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                  <p className={`text-sm font-semibold mb-1 ${selectedOptions[currentQuestion.id] === currentQuestion.correctAnswer ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'}`}>
                    {selectedOptions[currentQuestion.id] === currentQuestion.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
                </div>
              )}
            </Card>

            {showFeedback && (
              <div className="flex justify-end">
                <Button onClick={nextQuestion}>
                  {currentQ < questions.length - 1 ? 'Next Question' : 'Finish Interview'} <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}