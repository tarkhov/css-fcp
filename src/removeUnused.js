import { extname } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { PurgeCSS } from 'purgecss'

export default async function (base, page, options = null) {
  if (!base) throw new Error('Base url not found.')
  if (!page?.url) throw new Error('Page url not found.')

  try {
    const url = new URL(page.url, base)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error fetching page: ${url}`)
    const html = await res.text()

    const settings = { content: [{ raw: html, extension: 'html' }] }
    if (options !== null) Object.assign(settings, options)
    if (page?.options) Object.assign(settings, page.options)

    const results = await new PurgeCSS().purge(settings)
    if (results?.length && settings?.output && extname(settings.output)) {
      const css = results.map(item => item.css).join('')
      await writeFile(settings.output, css, { flag: 'w' })
    }
  } catch (e) {
    console.error('Error:', e.message)
  }
}