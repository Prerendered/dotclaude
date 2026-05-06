const BASE_URL = 'https://raw.githubusercontent.com/Prerendered/dotclaude/main/templates'

export async function fetchTemplate(name: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/${name}`)
  if (!res.ok) throw new Error(`Failed to fetch template "${name}": ${res.status} ${res.statusText}`)
  return res.text()
}
