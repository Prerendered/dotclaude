import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const CONFIG_DIR = join(homedir(), '.dotclaude')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')

export type Config = {
  notionToken?: string
}

export function readConfig(): Config {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as Config
  } catch {
    return {}
  }
}

export function writeConfig(config: Config): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}
