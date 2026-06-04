export interface Profile {
  id: string
  name: string // e.g. "AI Automation Role", "PM Role"
  resumeText: string
  toolsAndSkills: string
  portfolioUrl: string
  portfolioProjects: string
  contactBlock: string // name, email, phone, linkedin, resume link
  specialInstructions: string
}

export interface JobInput {
  jobTitle: string
  companyName: string
  addressTo: string
  platform: string // where job was posted
  companyOverview: string
  jobSummary: string
  responsibilities: string
  qualifications: string
  additionals: string
}

export type ToneOption = 'professional' | 'assertive' | 'warm'

export type OutputMode = 'cover_letter' | 'pitch'

export interface HistoryEntry {
  id: string
  createdAt: string // ISO date string
  profileName: string
  jobTitle: string
  companyName: string
  tone: ToneOption
  outputMode: OutputMode
  output: string
}
