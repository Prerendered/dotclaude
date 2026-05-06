import * as p from '@clack/prompts'
import { readConfig, writeConfig } from '../auth/config'
import { fetchPageAsMarkdown, parseNotionPageId } from '../notion/page-to-markdown'

export type ProjectAnswers = {
  projectName: string
  projectType: string
  projectStack: string
  notionId: string
  kanbanId: string
  notionArchitecture?: string
  notionEngineering?: string
}

function check<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel('Setup cancelled.')
    process.exit(0)
  }
  return value as T
}

async function promptNotionPage(label: string, token: string): Promise<{ id: string; content: string } | null> {
  const raw = check(
    await p.text({
      message: `${label} page URL? (Enter to skip)`,
      placeholder: 'https://www.notion.so/...',
    }),
  )

  if (!raw) return null

  const pageId = parseNotionPageId(raw)
  if (!pageId) {
    p.log.warn('Could not parse a page ID from that URL — skipping.')
    return null
  }

  const spinner = p.spinner()
  spinner.start(`Fetching ${label}...`)

  try {
    const { title, content, blockCount } = await fetchPageAsMarkdown(pageId, token)
    spinner.stop(`Fetched "${title}" (${blockCount} blocks)`)
    return { id: pageId, content }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    spinner.stop('Failed to fetch — skipping.')
    p.log.warn(msg)
    return null
  }
}

async function ensureNotionToken(): Promise<string> {
  const stored = readConfig().notionToken
  if (stored) return stored

  p.note(
    [
      '1. Go to notion.so/my-integrations → New integration',
      '2. Give it a name (e.g. "dotclaude") and submit',
      '3. Copy the Internal Integration Token (starts with secret_)',
      '4. On each page you want to use: Share → Invite → your integration',
    ].join('\n'),
    'Set up Notion access',
  )

  const token = check(
    await p.text({
      message: 'Paste your integration token',
      placeholder: 'secret_...',
      validate: (v) => {
        if (!v) return 'Token is required'
        if (!v.startsWith('secret_')) return 'Should start with secret_'
      },
    }),
  )

  writeConfig({ ...readConfig(), notionToken: token })
  p.log.success('Token saved to ~/.dotclaude/config.json')

  return token
}

export async function runInteractivePrompts(): Promise<ProjectAnswers | null> {
  p.intro('dotclaude — interactive setup')

  const projectName = check(
    await p.text({
      message: 'Project name?',
      placeholder: 'my-project',
      validate: (v) => (!v ? 'Project name is required' : undefined),
    }),
  )

  const projectType = check(
    await p.select({
      message: 'Project type?',
      options: [
        { value: 'web', label: 'web' },
        { value: 'extension', label: 'extension' },
        { value: 'desktop', label: 'desktop' },
        { value: 'mobile', label: 'mobile' },
      ],
    }),
  )

  const projectStack = check(
    await p.text({
      message: 'Stack? (Enter for default)',
      placeholder: 'Next.js + Convex + shadcn + Bun',
    }),
  )

  const kanbanId = check(
    await p.text({
      message: 'Kanban data source ID? (optional)',
      placeholder: 'skip',
    }),
  )

  let notionId = ''
  let notionArchitecture: string | undefined
  let notionEngineering: string | undefined

  const useNotion = check(await p.confirm({ message: 'Pull architecture / guidelines from Notion?' }))

  if (useNotion) {
    const token = await ensureNotionToken()

    const arch = await promptNotionPage('Architecture', token)
    if (arch) {
      notionId = arch.id
      notionArchitecture = arch.content
    }

    const eng = await promptNotionPage('Engineering guidelines', token)
    if (eng) {
      if (!notionId) notionId = eng.id
      notionEngineering = eng.content
    }
  }

  p.outro('All set!')

  return {
    projectName: String(projectName),
    projectType: String(projectType),
    projectStack: String(projectStack) || 'Next.js + Convex + shadcn + Bun',
    notionId,
    kanbanId: String(kanbanId ?? ''),
    notionArchitecture,
    notionEngineering,
  }
}
