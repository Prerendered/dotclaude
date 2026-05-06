#!/usr/bin/env bun

import { runInit } from '../src/commands/init'
import { runAdd } from '../src/commands/add'

const args = process.argv.slice(2)
const command = args[0]
const flags = {
  interactive: args.includes('--interactive'),
  force: args.includes('--force'),
  help: args.includes('--help'),
}

const HELP = `
dotclaude — scaffold .claude/ context files

Usage:
  bunx github:Prerendered/dotclaude init               Scaffold all files
  bunx github:Prerendered/dotclaude init --interactive  Fill in project details
  bunx github:Prerendered/dotclaude add <file>          Add a single file
  bunx github:Prerendered/dotclaude add <file> --interactive

Files:
  map          map.md                     TOC — read first every session
  state        state.md                   Current focus, in progress, what's next
  standards    _standards.md              Global TypeScript, naming, git rules
  engineering  engineering-guidelines.md  Project-specific structure
  architecture architecture.md            Patterns, flows, code examples

Flags:
  --interactive   Fill in placeholders via prompts
  --force         Skip conflict prompts, overwrite everything
  --help          Show this help
`.trim()

if (flags.help || !command) {
  console.log(HELP)
  process.exit(0)
}

if (command === 'init') {
  await runInit(flags)
} else if (command === 'add') {
  const fileKey = args[1]
  if (!fileKey || fileKey.startsWith('--')) {
    console.error('Usage: dotclaude add <file>')
    console.error('Available: map, state, standards, engineering, architecture')
    process.exit(1)
  }
  await runAdd(fileKey, flags)
} else {
  console.error(`Unknown command: "${command}"`)
  console.log('')
  console.log(HELP)
  process.exit(1)
}
