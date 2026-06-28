import { useEffect, useState } from 'react'
import { FileText, Trash2, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Resume } from '../types/index'
import { Navbar } from '../components/layout/Navbar'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import toast from 'react-hot-toast'

export function ResumeHistory() {
  const { user } = useAuth()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchResumes() }, [user])

  const fetchResumes = async () => {
    const { data } = await supabase.from('resumes').select('*')
      .eq('user_id', user!.id).order('uploaded_at', { ascending: false })
    setResumes(data || [])
    setLoading(false)
  }

  const deleteResume = async (id: string) => {
    await supabase.from('resumes').delete().eq('id', id)
    setResumes(prev => prev.filter(r => r.id !== id))
    toast.success('Resume deleted')
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500'
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume History</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
        </div>

        {resumes.length === 0 ? (
          <Card className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No resumes uploaded yet</p>
            <p className="text-gray-400 text-sm mt-1">Upload your first resume to get started</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {resumes.map(resume => (
              <Card key={resume.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{resume.file_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(resume.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {resume.file_size && ` • ${(resume.file_size / 1024).toFixed(0)} KB`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {resume.ats_score && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={16} className={getScoreColor(resume.ats_score)} />
                      <span className={`font-bold text-lg ${getScoreColor(resume.ats_score)}`}>{resume.ats_score}</span>
                      <span className="text-gray-400 text-sm">/100</span>
                    </div>
                  )}
                  <button onClick={() => deleteResume(resume.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}