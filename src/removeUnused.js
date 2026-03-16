import http from 'node:http'
import https from 'node:https'
import dotenv from 'dotenv'
import { PurgeCSS } from 'purgecss'
// Load the base .env file first, then load the .env.dev or .env.local file. 
dotenv.config()
// The second file loaded will overwrite any duplicate keys from the first.
const env = process.env.NODE_ENV || 'development'
dotenv.config({ path: `.env.${env}`, override: true })

export default function (pages) {
  function parseUrl(url, page) {
    let html = ''
    url.on('data', chunk => {
      html += chunk.toString().trim()
    }).on('end', async () => {
      try {
        await new PurgeCSS().purge({
          content: [{ raw: html, extension: 'html' }],
          css: [`${process.env.CSS_PATH}${page.name}.css`],
          output: process.env.CSS_PATH
        })
        console.log(`Done - ${page.name}.`)
      } catch (e) {
        console.error('Failed to purge page css.', e.message)
      }
    })
  }

  pages.forEach(async (page) => {
    try {
      const url = new URL(`${process.env.SITE_URL}${page.url}`)
      if (url.protocol === 'https:') {
        https.get(url, url => {
          parseUrl(url, page)
        }).on('error', console.error)
      } else if (url.protocol === 'http:') {
        http.get(url, url => {
          parseUrl(url, page)
        }).on('error', console.error)
      } else {
        console.error('Url protocol not supported.')
      }
    } catch (e) {
      console.error('Failed to parse url.', e.message)
    }
  })
}