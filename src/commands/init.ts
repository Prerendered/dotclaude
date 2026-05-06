import { join } from 'path'
import * as p from '@clack/prompts'
import { ensureDir, fileExists, writeTemplate } from '../utils/copy-template'
import { fetchTemplate } from '../utils/fetch-template'
import { runInteractivePrompts, type ProjectAnswers } from '../prompts/interactive'

const TEMPLATES = [
  { file: 'map.md' },
  { file: 'state.md' },
  { file: '_standards.md' },
  { file: 'engineering-guidelines.md' },
  { file: 'architecture.md' },
]

function fillPlaceholders(content: string, answers: ProjectAnswers): string {
  return content
    .replace(/\{\{PROJECT_NAME\}\}/g, answers.projectName)
    .replace(/\{\{PROJECT_TYPE\}\}/g, answers.projectType)
    .replace(/\{\{PROJECT_STACK\}\}/g, answers.projectStack)
    .replace(/\{\{NOTION_ID\}\}/g, answers.notionId)
    .replace(/\{\{KANBAN_ID\}\}/g, answers.kanbanId)
}

export async function runInit(flags: { interactive: boolean; force: boolean }): Promise<void> {
  const claudeDir = join(process.cwd(), '.claude')
  const claudeExists = fileExists(claudeDir)
  const skip = new Set<string>()

  if (claudeExists && !flags.force) {
    const overwriteAll = await p.confirm({ message: 'Found existing .claude/. Overwrite all?' })
    if (p.isCancel(overwriteAll)) { p.cancel('Cancelled.'); process.exit(0) }

    if (!overwriteAll) {
      console.log('Found .claude/. Checking individual files...')
      for (const { file } of TEMPLATES) {
        const filePath = join(claudeDir, file)
        if (fileExists(filePath)) {
          const shouldSkip = await p.confirm({ message: `  ${file} — exists. Skip?` })
          if (p.isCancel(shouldSkip)) { p.cancel('Cancelled.'); process.exit(0) }
          if (shouldSkip) skip.add(file)
        } else {
          console.log(`  ${file} — not found, adding...`)
        }
      }
      console.log('')
    }
  }

  let answers: ProjectAnswers | null = null
  if (flags.interactive) {
    answers = await runInteractivePrompts()
    if (!answers) return
  }

  ensureDir(claudeDir)

  const spinner = p.spinner()
  spinner.start('Fetching templates...')

  const created: string[] = []
  const skipped: string[] = []

  for (const { file } of TEMPLATES) {
    if (skip.has(file)) {
      skipped.push(file)
      continue
    }

    let content: string
    if (file === 'architecture.md' && answers?.notionArchitecture) {
      content = answers.notionArchitecture
    } else if (file === 'engineering-guidelines.md' && answers?.notionEngineering) {
      content = answers.notionEngineering
    } else {
      content = await fetchTemplate(file)
      if (answers) content = fillPlaceholders(content, answers)
    }

    writeTemplate(join(claudeDir, file), content)
    created.push(file)
  }

  spinner.stop('Done.')

  if (created.length > 0) {
    console.log('\nCreated:')
    for (const f of created) console.log(`  .claude/${f}`)
  }
  if (skipped.length > 0) {
    console.log('\nSkipped:')
    for (const f of skipped) console.log(`  .claude/${f}`)
  }

  console.log('\nNext: fill in .claude/map.md with your project details')
}
