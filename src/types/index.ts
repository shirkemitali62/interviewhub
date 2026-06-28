export type ATSFeedback = {
  score: number
  sections: {
    keywords: { score: number; found: string[]; missing: string[] }
    formatting: { score: number; issues: string[] }
    sections: { score: number; present: string[]; missing: string[] }
    experience: { score: number; feedback: string }
    education: { score: number; feedback: string }
  }
  suggestions: string[]
  strengths: string[]
}

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  target_role: string | null
  experience_years: number
  linkedin_url: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Resume = {
  id: string
  user_id: string
  file_name: string
  file_url: string
  file_size: number | null
  ats_score: number | null
  ats_feedback: ATSFeedback | null
  uploaded_at: string
}

export type InterviewQuestion = {
  id: string
  question: string
  category: string
  difficulty: string
  hint?: string
}

export type InterviewFeedback = {
  overall_score: number
  answers: Record<string, {
    score: number
    feedback: string
    keywords_used: string[]
    improvement: string
  }>
  strengths: string[]
  improvements: string[]
}

export type InterviewSession = {
  id: string
  user_id: string
  role: string
  questions: InterviewQuestion[]
  answers: Record<string, string> | null
  feedback: InterviewFeedback | null
  score: number | null
  completed_at: string | null
  created_at: string
}