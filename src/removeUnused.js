export default async function (base, pages, options = null) {
  if (!base) throw new Error('Base url not found.')
  if (!pages?.length) throw new Error('Pages not found.')

  const { extname } = await import('node:path')
  const { writeFile } = await import('node:fs/promises')
  const { PurgeCSS } = await import('purgecss')

  for (const page of pages) {
    try {
      if (!page?.url) throw new Error('Page url not found.')
      const url = new URL(page.url, base)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error fetching page: ${url}`)
      const html = await res.text()

      const settings = { content: [{ raw: html, extension: 'html' }] }
      if (options) Object.assign(settings, (typeof options === 'function') ? options(page) : options)
      if (page?.options) Object.assign(settings, page.options)

      const results = await new PurgeCSS().purge(settings)
      if (results?.length && settings?.output && extname(settings.output)) {
        const css = results.map(item => item.css).join('')
        await writeFile(settings.output, css, { flag: 'w' })
      }
      console.log('Done:', page.name)
    } catch (e) {
      console.error('Error:', e.message)
    }
  }
}