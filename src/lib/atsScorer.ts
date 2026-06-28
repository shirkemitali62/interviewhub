import type { ATSFeedback } from '../types/index'
const KEYWORDS_BY_ROLE: Record<string, string[]> = {
  frontend: ['react', 'javascript', 'typescript', 'css', 'html', 'vue', 'angular', 'webpack', 'redux', 'tailwind', 'responsive', 'api', 'git'],
  backend: ['node', 'express', 'python', 'java', 'sql', 'mongodb', 'postgresql', 'rest', 'api', 'docker', 'microservices', 'authentication', 'database'],
  fullstack: ['react', 'node', 'javascript', 'typescript', 'mongodb', 'sql', 'api', 'docker', 'git', 'html', 'css', 'express'],
  general: ['experience', 'developed', 'implemented', 'designed', 'managed', 'led', 'improved', 'achieved', 'team', 'project', 'agile', 'scrum'],
}

const REQUIRED_SECTIONS = ['experience', 'education', 'skills', 'projects', 'contact', 'summary', 'objective']
const GOOD_ACTION_VERBS = ['developed', 'implemented', 'designed', 'built', 'created', 'managed', 'led', 'improved', 'optimized', 'delivered', 'achieved', 'increased', 'reduced', 'collaborated']

export function scoreResume(text: string): ATSFeedback {
  const lowerText = text.toLowerCase()
  const words = lowerText.split(/\s+/)

  // 1. Keywords Score
  const allKeywords = [...KEYWORDS_BY_ROLE.general, ...KEYWORDS_BY_ROLE.fullstack]
  const foundKeywords = allKeywords.filter(kw => lowerText.includes(kw))
  const missingKeywords = allKeywords.filter(kw => !lowerText.includes(kw)).slice(0, 8)
  const keywordsScore = Math.min(100, Math.round((foundKeywords.length / allKeywords.length) * 100 * 1.5))

  // 2. Sections Score
  const presentSections = REQUIRED_SECTIONS.filter(s => lowerText.includes(s))
  const missingSections = REQUIRED_SECTIONS.filter(s => !lowerText.includes(s))
  const sectionsScore = Math.round((presentSections.length / REQUIRED_SECTIONS.length) * 100)

  // 3. Formatting Score
  const formattingIssues: string[] = []
  if (words.length < 200) formattingIssues.push('Resume seems too short (less than 200 words)')
  if (words.length > 1200) formattingIssues.push('Resume might be too long (more than 1200 words)')
  if (!lowerText.includes('@')) formattingIssues.push('No email address detected')
  if (!/\d{10}|\d{3}[-.\s]\d{3}[-.\s]\d{4}/.test(text)) formattingIssues.push('No phone number detected')
  if (!lowerText.includes('linkedin') && !lowerText.includes('github')) formattingIssues.push('Add LinkedIn or GitHub profile link')
  const formattingScore = Math.max(0, 100 - formattingIssues.length * 15)

  // 4. Experience Score
  const hasNumbers = /\d+%|\d+\+|\d+ years|\$\d+/.test(text)
  const actionVerbCount = GOOD_ACTION_VERBS.filter(v => lowerText.includes(v)).length
  const experienceScore = Math.min(100, actionVerbCount * 12 + (hasNumbers ? 20 : 0))
  const experienceFeedback = experienceScore >= 60
    ? 'Good use of action verbs and quantifiable achievements'
    : 'Add more action verbs and quantify your achievements (e.g., "Improved performance by 40%")'

  // 5. Education Score
  const hasEducation = ['bachelor', 'master', 'b.e', 'b.tech', 'mca', 'bca', 'degree', 'university', 'college', 'cgpa', 'gpa'].some(e => lowerText.includes(e))
  const educationScore = hasEducation ? 90 : 40
  const educationFeedback = hasEducation
    ? 'Education section looks good'
    : 'Add your educational qualifications clearly'

  // Final Score
  const finalScore = Math.round(
    keywordsScore * 0.30 +
    sectionsScore * 0.25 +
    formattingScore * 0.20 +
    experienceScore * 0.15 +
    educationScore * 0.10
  )

  // Suggestions
  const suggestions: string[] = []
  if (keywordsScore < 60) suggestions.push('Add more technical keywords relevant to your target role')
  if (!hasNumbers) suggestions.push('Quantify achievements: "Increased sales by 30%", "Managed team of 5"')
  if (actionVerbCount < 4) suggestions.push('Use strong action verbs: Developed, Implemented, Designed, Led')
  if (missingSections.length > 2) suggestions.push(`Add missing sections: ${missingSections.slice(0, 3).join(', ')}`)
  if (formattingIssues.length > 0) suggestions.push(...formattingIssues)
  suggestions.push('Use consistent formatting throughout the document')
  suggestions.push('Tailor your resume keywords to match the job description')

  // Strengths
  const strengths: string[] = []
  if (keywordsScore >= 60) strengths.push('Good keyword coverage for ATS systems')
  if (sectionsScore >= 70) strengths.push('Well-structured resume with all key sections')
  if (hasNumbers) strengths.push('Quantified achievements make impact clear')
  if (actionVerbCount >= 4) strengths.push('Strong use of action verbs')
  if (hasEducation) strengths.push('Education details are clearly mentioned')
  if (strengths.length === 0) strengths.push('Resume has basic structure in place')

  return {
    score: finalScore,
    sections: {
      keywords: { score: keywordsScore, found: foundKeywords.slice(0, 10), missing: missingKeywords },
      formatting: { score: formattingScore, issues: formattingIssues },
      sections: { score: sectionsScore, present: presentSections, missing: missingSections },
      experience: { score: experienceScore, feedback: experienceFeedback },
      education: { score: educationScore, feedback: educationFeedback },
    },
    suggestions: suggestions.slice(0, 6),
    strengths,
  }
}