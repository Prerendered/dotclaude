import * as p from '@clack/prompts'

export type ProjectAnswers = {
  projectName: string
  projectType: string
  projectStack: string
  notionId: string
  kanbanId: string
}

export async function runInteractivePrompts(): Promise<ProjectAnswers | null> {
  p.intro('dotclaude — interactive setup')

  const answers = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'Project name?',
          placeholder: 'my-project',
          validate: (v) => (!v ? 'Project name is required' : undefined),
        }),
      projectType: () =>
        p.select({
          message: 'Project type?',
          options: [
            { value: 'web', label: 'web' },
            { value: 'extension', label: 'extension' },
            { value: 'desktop', label: 'desktop' },
            { value: 'mobile', label: 'mobile' },
          ],
        }),
      projectStack: () =>
        p.text({
          message: 'Stack? (Enter for default)',
          placeholder: 'Next.js + Convex + shadcn + Bun',
        }),
      notionId: () =>
        p.text({
          message: 'Notion page ID? (optional)',
          placeholder: 'skip',
        }),
      kanbanId: () =>
        p.text({
          message: 'Kanban data source ID? (optional)',
          placeholder: 'skip',
        }),
    },
    {
      onCancel: () => {
        p.cancel('Setup cancelled.')
        process.exit(0)
      },
    },
  )

  p.outro('All set!')

  return {
    projectName: String(answers.projectName),
    projectType: String(answers.projectType),
    projectStack: String(answers.projectStack) || 'Next.js + Convex + shadcn + Bun',
    notionId: String(answers.notionId ?? ''),
    kanbanId: String(answers.kanbanId ?? ''),
  }
}
