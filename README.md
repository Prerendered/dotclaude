# dotclaude

Scaffold `.claude/` context files into any TypeScript project. Always pulls the latest templates.

## Usage

### Scaffold everything

```bash
bunx github:Prerendered/dotclaude init

# Interactive mode — fills in project details
bunx github:Prerendered/dotclaude init --interactive
```

### Add individual files

```bash
bunx github:Prerendered/dotclaude add map
bunx github:Prerendered/dotclaude add state
bunx github:Prerendered/dotclaude add standards
bunx github:Prerendered/dotclaude add engineering
bunx github:Prerendered/dotclaude add architecture

# Interactive mode works on add too
bunx github:Prerendered/dotclaude add map --interactive
```

## Flags

| Flag | Description |
|---|---|
| `--interactive` | Fill in placeholders via prompts |
| `--force` | Skip conflict prompts, overwrite everything |
| `--help` | Show usage |

## Files

| File | Purpose |
|---|---|
| `map.md` | TOC — read first every session |
| `state.md` | Current focus, in progress, what's next |
| `_standards.md` | Global TypeScript, naming, component, git rules |
| `engineering-guidelines.md` | Project-specific structure and Biome config |
| `architecture.md` | Patterns, flows, code examples |

## How it works

Templates live in this repo under `templates/`. The CLI fetches them at runtime from GitHub raw — push an update to `main` and every future run gets it automatically.

## Contributing

PRs welcome. Keep it simple.
