import { generate } from 'critical'

export default async function (base, page, options = null) {
  if (!base) throw new Error('Base url not found.')
  if (!page?.url) throw new Error('Page url not found.')
  
  try {
    const url = new URL(page.url, base)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Error fetching page: ${url}`)
    const html = await res.text()

    const settings = { html }
    if (options !== null) Object.assign(settings, options)
    if (page?.options) Object.assign(settings, page.options)

    await generate(settings)
  } catch (e) {
    console.error('Error:', e.message)
  }
}