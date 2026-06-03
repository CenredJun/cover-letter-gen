import type { JobInput, Profile, ToneOption } from '../types'

const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY as string | undefined
const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

const SYSTEM_PROMPT = `You are an expert personal career coach with a strong ability to craft professional, ATS-optimized cover letters. You specialize in tailoring job descriptions to match a resume, highlighting relevant skills and experience while keeping the tone authentic and human-like.`

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>
  error?: { type: string; message: string }
}

const TONE_DESCRIPTIONS: Record<ToneOption, string> = {
  professional: 'professional = formal and polished',
  assertive: 'assertive = confident and direct',
  warm: 'warm = personable and enthusiastic',
}

function formatToday(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildUserPrompt(
  profile: Profile,
  job: JobInput,
  tone: ToneOption
): string {
  const specialInstructionsSection =
    profile.specialInstructions.trim() !== ''
      ? `
---SPECIAL INSTRUCTIONS---
The applicant has provided these additional rules. Follow them strictly in addition to the standard rules above:
${profile.specialInstructions}
`
      : ''

  return `Write a customized cover letter using the following inputs. Follow these rules strictly:
1. Emphasize keywords — skills, tools, qualifications, and responsibilities from the job description.
2. Always match skills and experience from the resume. If something is missing, highlight transferable skills.
3. Optimize for ATS keywords.
4. Prioritize relevant experience first.
5. Use action-oriented and quantifiable achievements.
6. Mention the platform where the job was posted (if provided).
7. If any section (Overview, Summary, Responsibilities, Qualifications) is blank, skip it entirely — no placeholder text.
8. State in the letter that a portfolio link has been attached.
9. Do not overstate AI automation experience. The applicant is self-taught (n8n, Make.com, Relevance AI, Zapier) through self-study. Always direct the employer to the portfolio for examples.
10. If a qualification is not directly held, state familiarity and understanding — only highlight qualifications actually present.
11. Express a long-term goal to grow with the company for many years.
12. Convey the desire to be a problem-solving companion, not just an employee — someone who contributes lasting value and customer satisfaction.
13. Use the current date in the letter. Today's date is ${formatToday()}.
14. End the letter with the contact block provided.
15. Tone: ${TONE_DESCRIPTIONS[tone]}.

---PROFILE---
Name context: ${profile.name}
Resume & Experience:
${profile.resumeText}

Skills:
${profile.skillsText}

Portfolio: ${profile.portfolioUrl}

Contact block:
${profile.contactBlock}
${specialInstructionsSection}
---JOB DETAILS---
Job Title: ${job.jobTitle}
Company Name: ${job.companyName}
Address To: ${job.addressTo}
Platform where posted: ${job.platform}
Company Overview: ${job.companyOverview}
Job Summary: ${job.jobSummary}
Responsibilities: ${job.responsibilities}
Qualifications: ${job.qualifications}
Additional notes: ${job.additionals}`
}

async function callClaude(
  system: string,
  userContent: string,
  maxTokens: number
): Promise<string> {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    throw new Error(
      'Missing API key. Set VITE_CLAUDE_API_KEY in your .env file and restart the dev server.'
    )
  }

  let res: Response
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        // Required to call the API directly from a browser.
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: 'user', content: userContent }],
      }),
    })
  } catch (err) {
    throw new Error(
      `Network error reaching the Claude API: ${
        err instanceof Error ? err.message : String(err)
      }`
    )
  }

  const data = (await res.json().catch(() => ({}))) as AnthropicResponse

  if (!res.ok) {
    const message = data.error?.message ?? `Request failed (HTTP ${res.status})`
    throw new Error(message)
  }

  const text = data.content
    ?.filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('')
    .trim()

  if (!text) {
    throw new Error('The API returned an empty response.')
  }

  return text
}

/**
 * Generate a tailored cover letter from a profile, job input, and tone.
 */
export async function generateCoverLetter(
  profile: Profile,
  job: JobInput,
  tone: ToneOption
): Promise<string> {
  const userPrompt = buildUserPrompt(profile, job, tone)
  return callClaude(SYSTEM_PROMPT, userPrompt, 2000)
}

/**
 * Parse a raw job description into structured JobInput fields using Claude.
 * Returns a partial JobInput with whatever fields could be extracted.
 */
export async function parseJobDescription(
  rawText: string
): Promise<Partial<JobInput>> {
  const system =
    'You extract structured data from job postings. You only ever respond with a single valid JSON object and nothing else.'

  const userContent = `Extract the following fields from the job description below and return ONLY a JSON object with these exact keys (use an empty string "" for anything not present):

{
  "jobTitle": "",
  "companyName": "",
  "addressTo": "",
  "platform": "",
  "companyOverview": "",
  "jobSummary": "",
  "responsibilities": "",
  "qualifications": "",
  "additionals": ""
}

Job description:
"""
${rawText}
"""`

  const responseText = await callClaude(system, userContent, 2000)

  // Pull the JSON object out of the response, even if wrapped in prose/fences.
  const match = responseText.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error('Could not parse structured fields from the response.')
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(match[0])
  } catch {
    throw new Error('The extracted fields were not valid JSON.')
  }

  const keys: (keyof JobInput)[] = [
    'jobTitle',
    'companyName',
    'addressTo',
    'platform',
    'companyOverview',
    'jobSummary',
    'responsibilities',
    'qualifications',
    'additionals',
  ]

  const result: Partial<JobInput> = {}
  for (const key of keys) {
    const value = parsed[key]
    if (typeof value === 'string' && value.trim() !== '') {
      result[key] = value
    }
  }
  return result
}
