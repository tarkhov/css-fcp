import http from 'node:http'
import https from 'node:https'
import { PurgeCSS } from 'purgecss'
// import dotenv from 'dotenv'
// Load the base .env file first, then load the .env.dev or .env.local file. 
// dotenv.config()
// // The second file loaded will overwrite any duplicate keys from the first.
// const env = process.env.NODE_ENV || 'development'
// dotenv.config({ path: `.env.${env}`, override: true })

export default function (pages, options = { siteUrl: null, cssPath: null, output: null }) {
  if (!pages?.length) throw new Error('Pages not found.')
  if (!options?.siteUrl) throw new Error('Site url not found.')

  function parseUrl(url, page) {
    let html = ''
    url.on('data', chunk => {
      html += chunk.toString().trim()
    }).on('end', async () => {
      const settings = { content: [{ raw: html, extension: 'html' }] }
      if (options?.cssPath) settings.css = [`${options.cssPath}${page.name}.css`]
      if (options?.output) settings.output = options.output
      if (page?.options) Object.assign(settings, page.options)
      try {
        await new PurgeCSS().purge(settings)
        console.log(`Done - ${page.name}.`)
      } catch (e) {
        console.error('Failed to purge page css.', e.message)
      }
    })
  }

  pages.forEach(page => {
    try {
      const url = new URL(`${options.siteUrl}${page.url}`)
      if (url.protocol === 'https:') {
        https.get(url, url => {
          parseUrl(url, page)
        }).on('error', console.error)
      } else if (url.protocol === 'http:') {
        http.get(url, url => {
          parseUrl(url, page)
        }).on('error', console.error)
      } else {
        console.error('URL protocol not supported.')
      }
    } catch (e) {
      console.error('Failed to parse url.', e.message)
    }
  })
}