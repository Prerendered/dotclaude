# _standards.md

> Global standards. These apply to every file in this project.

## TypeScript

- Strict mode on. No `any`.
- Use `type` for object shapes, `interface` for extension points.
- Prefer `const` over `let`. Never use `var`.
- No unused variables or imports.

## Naming

- Files: `kebab-case.ts`
- Components: `PascalCase.tsx`
- Functions and variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`

## Components

- One component per file.
- Props type defined above the component as `type Props = { ... }`.
- No default exports from files that export multiple things.

## Imports

- Absolute imports over relative where possible.
- Group: external → internal → relative. No blank lines between groups.

## Git

- Commits in imperative mood: "add feature", not "added feature".
- One logical change per commit.
- No `.DS_Store`, no `node_modules`, no `.env` in commits.

## Formatting

- Biome for formatting and linting.
- `bun run check` before every commit.
