export default async function (pages, options = {
  siteUrl: null,
  basePath: null,
  targetPath: './critical',
  uncritPath: null,
  cssPath: null,
  assetsUrl: null,
  width: 2000,
  height: 1080
}) {
  if (!pages?.length) throw new Error('Pages not found.')
  if (!options?.siteUrl) throw new Error('Site url not found.')

  const { join } = await import('node:path')
  const { generate } = await import('critical')

  for (const page of pages) {
    try {
      const url = new URL(page.url, options.siteUrl)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error fetching page: ${url}`)
      const html = await res.text()

      const settings = { html }
      if (options?.basePath) settings.base = options.basePath
      settings.target = {}
      if (options?.targetPath) settings.target.css = join(options.targetPath, `${page.name}.css`)
      if (options?.uncritPath) settings.target.uncritical = join(options.uncritPath, `${page.name}.css`)
      if (options?.cssPath) settings.css = [join(options.cssPath, `${page.name}.css`)]
      if (options?.width) settings.width = options.width
      if (options?.height) settings.height = options.height
      if (options?.assetsUrl) settings.rebase = (asset) => `${options.assetsUrl}${asset.absolutePath}`
      if (page?.options) Object.assign(settings, page.options)

      await generate(settings)
      console.log('Done:', page.name)
    } catch (e) {
      console.error('Error:', e.message)
    }
  }
}