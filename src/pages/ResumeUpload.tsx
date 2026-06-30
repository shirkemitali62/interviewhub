import { useState, useCallback, useEffect } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { scoreResume } from '../lib/atsScorer'
import { generateImprovedResumeDocx, generateImprovedResumePDF } from '../lib/resumeGenerator'
import { Navbar } from '../components/layout/Navbar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { ATSFeedback } from '../types/index'
import toast from 'react-hot-toast'
import { extractTextFromPDF } from '../lib/pdfReader'

export function ResumeUpload() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [feedback, setFeedback] = useState<ATSFeedback | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [resumeText, setResumeText] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => setProfileData(data))
    }
  }, [user])

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return }
    if (f.size > 5 * 1024 * 1024) { toast.error('File size must be under 5MB'); return }
    setFile(f)
    setFeedback(null)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleUpload = async () => {
    if (!file || !user) return
    setUploading(true)
    try {
      const text = await extractTextFromPDF(file)
      setResumeText(text)
      const atsResult = scoreResume(text, profileData?.target_role)
      const filePath = `${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage.from('resumes').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(filePath)
      await supabase.from('resumes').insert({
        user_id: user.id, file_name: file.name,
        file_url: publicUrl, file_size: file.size,
        ats_score: atsResult.score, ats_feedback: atsResult,
      })
      setFeedback(atsResult)
      toast.success('Resume analyzed successfully!')
    } catch (err) {
      toast.error('Upload failed. Please try again.')
    }
    setUploading(false)
  }

  const profileInfo = {
    email: user?.email || '',
    phone: profileData?.phone || '',
    linkedin: profileData?.linkedin_url || '',
    github: profileData?.github_url || '',
    location: profileData?.location || '',
    fullName: profileData?.full_name || '',
  }

const isProfileIncomplete = !profileData?.phone

  const handleDownloadDocx = async () => {
    if (!feedback || !file) return
    if (isProfileIncomplete) {
      toast.error('Please complete your Profile (phone, LinkedIn) for a ready-to-submit resume')
      return
    }
    setGenerating(true)
    try {
      await generateImprovedResumeDocx(resumeText, feedback, file.name, profileInfo)
      toast.success('Word document downloaded!')
    } catch {
      toast.error('Failed to generate document')
    }
    setGenerating(false)
  }

  const handleDownloadPdf = () => {
    if (!feedback || !file) return
    if (isProfileIncomplete) {
      toast.error('Please complete your Profile (phone, LinkedIn) for a ready-to-submit resume')
      return
    }
    setGenerating(true)
    try {
      generateImprovedResumePDF(resumeText, feedback, file.name, profileInfo)
      toast.success('PDF downloaded!')
    } catch {
      toast.error('Failed to generate PDF')
    }
    setGenerating(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 75) return 'bg-green-100 dark:bg-green-900/30'
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ATS Resume Scorer</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload your PDF resume to get instant ATS compatibility score
            {profileData?.target_role && <span className="text-blue-600 dark:text-blue-400"> • Scoring for {profileData.target_role}</span>}
          </p>
        </div>

        {isProfileIncomplete && (
          <Card className="mb-6 border-l-4 border-l-orange-500">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              ⚠️ Complete your <a href="/profile" className="text-blue-600 font-medium hover:underline">Profile</a> (phone number, LinkedIn) to generate a ready-to-submit resume without placeholders.
            </p>
          </Card>
        )}

        <Card className="mb-6">
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
              dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <Upload size={40} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Drag & drop your resume here</p>
            <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
            <input type="file" accept=".pdf" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="btn-primary cursor-pointer inline-block">
              Browse PDF
            </label>
            <p className="text-xs text-gray-400 mt-3">PDF only • Max 5MB</p>
          </div>
          {file && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={20} className="text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <Button onClick={handleUpload} loading={uploading} size="sm" fullWidth>
                Analyze Resume
              </Button>
            </div>
          )}
        </Card>

        {feedback && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">ATS Score</h2>
                  <p className="text-gray-500 text-sm">Based on keywords, formatting, and structure</p>
                </div>
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${getScoreBg(feedback.score)}`}>
                  <span className={`text-3xl font-bold ${getScoreColor(feedback.score)}`}>{feedback.score}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div className={`h-3 rounded-full transition-all duration-1000 ${
                  feedback.score >= 75 ? 'bg-green-500' : feedback.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`} style={{ width: `${feedback.score}%` }} />
              </div>
              <p className={`text-sm font-medium ${getScoreColor(feedback.score)}`}>
                {feedback.score >= 75 ? '✅ Excellent! Your resume is ATS-friendly' :
                  feedback.score >= 50 ? '⚠️ Good, but needs some improvements' :
                  '❌ Needs significant improvements'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                <Button onClick={handleDownloadDocx} loading={generating} variant="secondary" fullWidth>
                  <Download size={16} /> Download as Word
                </Button>
                <Button onClick={handleDownloadPdf} loading={generating} fullWidth>
                  <Download size={16} /> Download as PDF
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Section Breakdown</h3>
              <div className="space-y-4">
                {Object.entries({
                  'Keywords': feedback.sections.keywords.score,
                  'Formatting': feedback.sections.formatting.score,
                  'Sections': feedback.sections.sections.score,
                  'Experience': feedback.sections.experience.score,
                  'Education': feedback.sections.education.score,
                }).map(([label, score]) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
                      <span className={getScoreColor(score)}>{score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`h-2 rounded-full ${score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {feedback.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertCircle size={18} className="text-orange-500" /> Suggestions
                </h3>
                <ul className="space-y-2">
                  {feedback.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">→</span>{s}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Keywords Found</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {feedback.sections.keywords.found.map(kw => (
                  <span key={kw} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">{kw}</span>
                ))}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Keywords Missing</h3>
              <div className="flex flex-wrap gap-2">
                {feedback.sections.keywords.missing.map(kw => (
                  <span key={kw} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">{kw}</span>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}