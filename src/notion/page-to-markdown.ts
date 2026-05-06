const NOTION_VERSION = '2022-06-28'

export function parseNotionPageId(url: string): string | null {
  // Notion URLs end in a 32-char hex string, with or without hyphens
  // e.g. notion.so/My-Page-abc123def456... or notion.so/abc123def456...
  const match = url.replace(/-/g, '').match(/[a-f0-9]{32}/)
  if (!match) return null
  const id = match[0]
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
}

type RichText = { plain_text: string }[]
type Block = { id: string; type: string; has_children: boolean; _children?: Block[]; [key: string]: unknown }

export async function fetchPageAsMarkdown(
  pageId: string,
  token: string,
): Promise<{ title: string; content: string; blockCount: number }> {
  const headers = { Authorization: `Bearer ${token}`, 'Notion-Version': NOTION_VERSION }

  const pageRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, { headers })
  if (!pageRes.ok) {
    if (pageRes.status === 404) throw new Error('Page not found — make sure you shared it with your integration')
    if (pageRes.status === 401) throw new Error('Unauthorized — your sign-in may have expired. Run `dotclaude logout` and try again')
    throw new Error(`Failed to fetch page (${pageRes.status})`)
  }

  const page = (await pageRes.json()) as { properties: Record<string, { title?: RichText; Name?: RichText }> }
  const titleProp = page.properties?.title?.title ?? page.properties?.Name?.title ?? []
  const title = titleProp.map((t) => t.plain_text).join('') || 'Untitled'

  const blocks = await fetchBlocks(pageId, token, headers)
  const content = blocksToMarkdown(blocks)

  return { title, content, blockCount: blocks.length }
}

async function fetchBlocks(
  blockId: string,
  token: string,
  headers: Record<string, string>,
  depth = 0,
): Promise<Block[]> {
  if (depth > 4) return []

  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`, { headers })
  if (!res.ok) return []

  const data = (await res.json()) as { results: Block[] }

  for (const block of data.results) {
    if (block.has_children && depth < 4) {
      block._children = await fetchBlocks(block.id, token, headers, depth + 1)
    }
  }

  return data.results
}

function rt(richText: RichText | undefined): string {
  return richText?.map((t) => t.plain_text).join('') ?? ''
}

function blocksToMarkdown(blocks: Block[], depth = 0): string {
  const lines: string[] = []
  const indent = '  '.repeat(depth)

  for (const block of blocks) {
    const children = block._children ? blocksToMarkdown(block._children, depth + 1) : ''
    const b = block as Record<string, { rich_text?: RichText; language?: string; icon?: { emoji?: string } }>

    switch (block.type) {
      case 'heading_1':
        lines.push(`${indent}# ${rt(b.heading_1?.rich_text)}`)
        break
      case 'heading_2':
        lines.push(`${indent}## ${rt(b.heading_2?.rich_text)}`)
        break
      case 'heading_3':
        lines.push(`${indent}### ${rt(b.heading_3?.rich_text)}`)
        break
      case 'paragraph': {
        const text = rt(b.paragraph?.rich_text)
        if (text) lines.push(`${indent}${text}`)
        break
      }
      case 'bulleted_list_item':
        lines.push(`${indent}- ${rt(b.bulleted_list_item?.rich_text)}`)
        break
      case 'numbered_list_item':
        lines.push(`${indent}1. ${rt(b.numbered_list_item?.rich_text)}`)
        break
      case 'to_do': {
        const todo = block as { to_do: { rich_text: RichText; checked: boolean } }
        const check = todo.to_do.checked ? 'x' : ' '
        lines.push(`${indent}- [${check}] ${rt(todo.to_do.rich_text)}`)
        break
      }
      case 'code': {
        const lang = b.code?.language ?? ''
        lines.push(`${indent}\`\`\`${lang}\n${rt(b.code?.rich_text)}\n\`\`\``)
        break
      }
      case 'quote':
        lines.push(`${indent}> ${rt(b.quote?.rich_text)}`)
        break
      case 'callout': {
        const icon = b.callout?.icon?.emoji ?? ''
        lines.push(`${indent}> ${icon} ${rt(b.callout?.rich_text)}`.trimEnd())
        break
      }
      case 'toggle':
        lines.push(`${indent}**${rt(b.toggle?.rich_text)}**`)
        break
      case 'divider':
        lines.push(`${indent}---`)
        break
    }

    if (children) lines.push(children)
  }

  return lines.filter(Boolean).join('\n')
}
