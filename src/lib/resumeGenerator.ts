import { Document, Packer, Paragraph, TextRun, BorderStyle, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import type { ATSFeedback } from '../types'

type ProfileInfo = {
  email: string
  phone: string
  linkedin: string
  github: string
  location: string
  fullName: string
}

type ParsedResume = {
  name: string
  objective: string
  education: string[]
  skills: string[]
  projects: string[]
  achievements: string[]
  strengths: string[]
}

function parseResumeText(text: string, profile: ProfileInfo): ParsedResume {
  const clean = text.replace(/\s+/g, ' ').trim()

  const nameMatch = clean.match(/^([A-Z][A-Z\s.]{3,40}?)(?=\s+(CAREER|OBJECTIVE|EDUCATION|PROFILE|SUMMARY))/)
  const name = profile.fullName || (nameMatch ? nameMatch[1].trim() : 'YOUR NAME')

  const extractSection = (startKeywords: string[], endKeywords: string[]) => {
    const startPattern = startKeywords.join('|')
    const endPattern = endKeywords.join('|')
    const regex = new RegExp(`(?:${startPattern})\\s*:?\\s*(.*?)(?=\\s*(?:${endPattern})|$)`, 'i')
    const match = clean.match(regex)
    return match ? match[1].trim() : ''
  }

  const objective = extractSection(
    ['CAREER OBJECTIVE', 'OBJECTIVE', 'PROFESSIONAL SUMMARY', 'SUMMARY'],
    ['EDUCATION', 'TECHNICAL SKILLS', 'SKILLS', 'PROJECT']
  )

  const educationText = extractSection(['EDUCATION'], ['TECHNICAL SKILLS', 'SKILLS', 'PROJECT', 'ACHIEVEMENTS'])
  const education = educationText.split(/(?=Bachelor|Master|Higher Secondary|Secondary|B\.E|B\.Tech|MCA|BCA|Diploma)/i)
    .map(s => s.trim()).filter(s => s.length > 5)

  const skillsText = extractSection(['TECHNICAL SKILLS', 'SKILLS'], ['PROJECT', 'ACHIEVEMENTS', 'STRENGTHS', 'PERSONAL'])
  const skills = skillsText.split(/[•·]/).map(s => s.trim()).filter(s => s.length > 2)

  const projectsText = extractSection(['PROJECT', 'PROJECTS'], ['ACHIEVEMENTS', 'STRENGTHS', 'PERSONAL', 'DECLARATION'])
  const projects = projectsText.split(/[•·]/).map(s => s.trim()).filter(s => s.length > 2)

  const achievementsText = extractSection(['ACHIEVEMENTS'], ['STRENGTHS', 'PERSONAL', 'DECLARATION'])
  const achievements = achievementsText.split(/[•·]/).map(s => s.trim()).filter(s => s.length > 2)

  const strengthsText = extractSection(['STRENGTHS'], ['PERSONAL', 'DECLARATION'])
  const strengths = strengthsText.split(/[•·]/).map(s => s.trim()).filter(s => s.length > 2)

  return {
    name,
    objective: objective || 'Motivated professional seeking opportunities to apply technical skills and contribute to organizational growth.',
    education: education.length ? education : ['[Add your education details]'],
    skills: skills.length ? skills : ['[Add your technical skills]'],
    projects: projects.length ? projects : ['[Add your project details]'],
    achievements,
    strengths,
  }
}

export async function generateImprovedResumeDocx(originalText: string, feedback: ATSFeedback, fileName: string, profile: ProfileInfo) {
  const r = parseResumeText(originalText, profile)
  const children: Paragraph[] = []

  const contactParts = [profile.phone, profile.email, profile.linkedin, profile.github, profile.location].filter(Boolean)

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: r.name, bold: true, size: 32 })],
      spacing: { after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: contactParts.join('  |  '), size: 18, color: '555555' })],
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB' } },
    })
  )

  const addSectionHeading = (title: string) => {
    children.push(new Paragraph({
      children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 22, color: '2563EB' })],
      spacing: { before: 250, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
    }))
  }

  const addBullet = (text: string) => {
    children.push(new Paragraph({
      children: [new TextRun({ text, size: 20 })],
      bullet: { level: 0 },
      spacing: { after: 60 },
    }))
  }

  addSectionHeading('Professional Summary')
  children.push(new Paragraph({ children: [new TextRun({ text: r.objective, size: 20 })], spacing: { after: 100 } }))

  addSectionHeading('Education')
  r.education.forEach(addBullet)

  addSectionHeading('Technical Skills')
  r.skills.forEach(addBullet)

  addSectionHeading('Projects')
  r.projects.forEach(addBullet)

  if (r.achievements.length) {
    addSectionHeading('Achievements')
    r.achievements.forEach(addBullet)
  }

  if (r.strengths.length) {
    addSectionHeading('Strengths')
    children.push(new Paragraph({ children: [new TextRun({ text: r.strengths.join(' • '), size: 20 })], spacing: { after: 100 } }))
  }

  const doc = new Document({ sections: [{ properties: {}, children }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${fileName.replace('.pdf', '')}_improved.docx`)
}

export function generateImprovedResumePDF(originalText: string, feedback: ATSFeedback, fileName: string, profile: ProfileInfo) {
  const r = parseResumeText(originalText, profile)
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 15
  const maxWidth = pageWidth - margin * 2
  let y = 18

  const contactParts = [profile.phone, profile.email, profile.linkedin, profile.github, profile.location].filter(Boolean)

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text(r.name, pageWidth / 2, y, { align: 'center' })
  y += 7

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(80)
  pdf.text(contactParts.join('  |  '), pageWidth / 2, y, { align: 'center' })
  y += 3
  pdf.setDrawColor(37, 99, 235)
  pdf.setLineWidth(0.5)
  pdf.line(margin, y, pageWidth - margin, y)
  y += 8
  pdf.setTextColor(0)

  const addHeading = (title: string) => {
    if (y > 270) { pdf.addPage(); y = 18 }
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(37, 99, 235)
    pdf.text(title.toUpperCase(), margin, y)
    y += 1.5
    pdf.setDrawColor(200)
    pdf.setLineWidth(0.2)
    pdf.line(margin, y, pageWidth - margin, y)
    y += 6
    pdf.setTextColor(0)
  }

  const addText = (text: string) => {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const wrapped = pdf.splitTextToSize(text, maxWidth)
    if (y + wrapped.length * 5 > 280) { pdf.addPage(); y = 18 }
    pdf.text(wrapped, margin, y)
    y += wrapped.length * 5 + 2
  }

  const addBullet = (text: string) => {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    const wrapped = pdf.splitTextToSize(`•  ${text}`, maxWidth - 4)
    if (y + wrapped.length * 5 > 280) { pdf.addPage(); y = 18 }
    pdf.text(wrapped, margin + 2, y)
    y += wrapped.length * 5 + 1.5
  }

  addHeading('Professional Summary')
  addText(r.objective)
  y += 2

  addHeading('Education')
  r.education.forEach(addBullet)
  y += 2

  addHeading('Technical Skills')
  r.skills.forEach(addBullet)
  y += 2

  addHeading('Projects')
  r.projects.forEach(addBullet)
  y += 2

  if (r.achievements.length) {
    addHeading('Achievements')
    r.achievements.forEach(addBullet)
    y += 2
  }

  if (r.strengths.length) {
    addHeading('Strengths')
    addText(r.strengths.join(' • '))
  }

  pdf.save(`${fileName.replace('.pdf', '')}_improved.pdf`)
}