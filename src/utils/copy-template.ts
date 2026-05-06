import { existsSync, mkdirSync, writeFileSync } from 'fs'

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

export function writeTemplate(path: string, content: string): void {
  writeFileSync(path, content, 'utf-8')
}

export function fileExists(path: string): boolean {
  return existsSync(path)
}
