import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { join } from 'node:path'
import { publicPath } from '../src/lib/publicLinks.js'

test('VPS web server serves the app and share metadata', async () => {
  const api = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ success: true, data: { title: 'ព័ត៌មានថ្មី', excerpt: 'សេចក្ដីសង្ខេប', images: ['/uploads/news/photo.jpg'] } }))
  }).listen(0, '127.0.0.1')
  await once(api, 'listening')
  const apiPort = api.address().port
  const probe = createServer().listen(0, '127.0.0.1')
  await once(probe, 'listening')
  const webPort = probe.address().port
  await new Promise(resolve => probe.close(resolve))
  const web = spawn(process.execPath, ['deploy-server.mjs'], {
    cwd: join(import.meta.dirname, '..'),
    env: { ...process.env, PORT: String(webPort), STATIC_ROOT: join(import.meta.dirname, '..', 'dist'), API_INTERNAL_URL: `http://127.0.0.1:${apiPort}/api` },
    stdio: 'ignore',
  })
  try {
    let home
    for (let attempt = 0; attempt < 30; attempt++) {
      try { home = await fetch(`http://127.0.0.1:${webPort}/`); break } catch { await new Promise(resolve => setTimeout(resolve, 50)) }
    }
    assert.equal(home?.status, 200)
    assert.match(await home.text(), /<html/)
    const detail = await fetch(`http://127.0.0.1:${webPort}${publicPath('news', 1)}`, { headers: { Host: 'wattepborey.com' } })
    assert.equal(detail.status, 200)
    const html = await detail.text()
    assert.match(html, /og:title.*ព័ត៌មានថ្មី/)
    assert.match(html, /og:image.*https:\/\/wattepborey.com\/uploads\/news\/photo.jpg/)
  } finally {
    web.kill()
    await new Promise(resolve => api.close(resolve))
  }
})
