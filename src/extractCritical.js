export default async function (base, pages, options = null) {
  if (!base) throw new Error('Base url not found.')
  if (!pages?.length) throw new Error('Pages not found.')

  const { generate } = await import('critical')

  for (const page of pages) {
    try {
      if (!page?.url) throw new Error('Page url not found.')
      const url = new URL(page.url, base)
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Error fetching page: ${url}`)
      const html = await res.text()

      const settings = { html }
      if (options) Object.assign(settings, (typeof options === 'function') ? options(page) : options)
      if (page?.options) Object.assign(settings, page.options)

      await generate(settings)
      console.log('Done:', page.name)
    } catch (e) {
      console.error('Error:', e.message)
    }
  }
}