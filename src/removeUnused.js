export default async function (pages, options = { siteUrl: null, cssPath: null, outputPath: null, targetPath: null }) {
  if (!pages?.length) throw new Error('Pages not found.')
  if (!options?.siteUrl) throw new Error('Site url not found.')

  const { join } = await import('node:path')
  const { writeFile } = await import('node:fs/promises')
  const { PurgeCSS } = await import('purgecss')

  for (const page of pages) {
    try {
      const url = new URL(page.url, options.siteUrl)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error fetching page: ${url}`)
      const html = await res.text()

      const settings = { content: [{ raw: html, extension: 'html' }] }
      if (options?.cssPath) settings.css = [join(options.cssPath, `${page.name}.css`)]
      if (options?.outputPath) settings.output = options.outputPath
      if (page?.options) Object.assign(settings, page.options)

      const result = await new PurgeCSS().purge(settings)
      if (result?.length && options?.targetPath) {
        const css = result.map(item => item.css).join('')
        await writeFile(join(options.targetPath, `${page.name}.css`), css, { flag: 'w' })
      }
      console.log('Done:', page.name)
    } catch (e) {
      console.error('Error:', e.message)
    }
  }
}