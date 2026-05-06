import { join } from 'path'
import * as p from '@clack/prompts'
import { ensureDir, fileExists, writeTemplate } from '../utils/copy-template'
import { fetchTemplate } from '../utils/fetch-template'
import { runInteractivePrompts, type ProjectAnswers } from '../prompts/interactive'

const FILE_MAP: Record<string, string> = {
  map: 'map.md',
  state: 'state.md',
  standards: '_standards.md',
  engineering: 'engineering-guidelines.md',
  architecture: 'architecture.md',
}

function fillPlaceholders(content: string, answers: ProjectAnswers): string {
  return content
    .replace(/\{\{PROJECT_NAME\}\}/g, answers.projectName)
    .replace(/\{\{PROJECT_TYPE\}\}/g, answers.projectType)
    .replace(/\{\{PROJECT_STACK\}\}/g, answers.projectStack)
    .replace(/\{\{NOTION_ID\}\}/g, answers.notionId)
    .replace(/\{\{KANBAN_ID\}\}/g, answers.kanbanId)
}

export async function runAdd(fileKey: string, flags: { interactive: boolean; force: boolean }): Promise<void> {
  const fileName = FILE_MAP[fileKey]
  if (!fileName) {
    console.error(`Unknown file: "${fileKey}"`)
    console.error(`Available: ${Object.keys(FILE_MAP).join(', ')}`)
    process.exit(1)
  }

  const claudeDir = join(process.cwd(), '.claude')
  const filePath = join(claudeDir, fileName)

  if (fileExists(filePath) && !flags.force) {
    const overwrite = await p.confirm({ message: `${fileName} already exists. Overwrite?` })
    if (p.isCancel(overwrite)) { p.cancel('Cancelled.'); return }
    if (!overwrite) { console.log(`Skipped .claude/${fileName}`); return }
  }

  let answers: ProjectAnswers | null = null
  if (flags.interactive) {
    answers = await runInteractivePrompts()
    if (!answers) return
  }

  const spinner = p.spinner()
  spinner.start(`Fetching ${fileName}...`)

  let content: string
  if (fileName === 'architecture.md' && answers?.notionArchitecture) {
    content = answers.notionArchitecture
  } else if (fileName === 'engineering-guidelines.md' && answers?.notionEngineering) {
    content = answers.notionEngineering
  } else {
    const raw = await fetchTemplate(fileName)
    content = answers ? fillPlaceholders(raw, answers) : raw
  }

  spinner.stop()
  ensureDir(claudeDir)
  writeTemplate(filePath, content)

  console.log(`Added .claude/${fileName}`)
}
