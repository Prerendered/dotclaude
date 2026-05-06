# dotclaude

Scaffold `.claude/` context files into any TypeScript project. Always pulls the latest templates.

## Usage

### Scaffold everything

```bash
bunx github:Prerendered/dotclaude init

# Interactive mode — fills in project details and optionally pulls from Notion
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
bunx github:Prerendered/dotclaude add architecture --interactive
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

## Notion integration

In interactive mode you can pull your existing `architecture.md` and `engineering-guidelines.md` directly from Notion pages instead of filling in templates manually.

When prompted, the CLI will walk you through a one-time setup:

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New integration**
2. Name it (e.g. `dotclaude`) and copy the **Internal Integration Token** (`secret_...`)
3. On each Notion page you want to use: **Share → Invite → your integration**
4. Paste the token when prompted — saved to `~/.dotclaude/config.json` and reused on every future run

After setup, just paste the page URL when asked. No IDs, no copying slugs.

## How it works

Templates live in this repo under `templates/`. The CLI fetches them at runtime from GitHub raw — push an update to `main` and every future run gets it automatically.

## Contributing

PRs welcome. Keep it simple.
