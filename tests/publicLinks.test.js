import { test } from 'node:test'
import assert from 'node:assert/strict'
import worker, { metadata, renderMetadata } from '../worker.js'
import { publicCode, recordId, publicPath, matchPublicPath, publicResources } from '../src/lib/publicLinks.js'

test('public codes round-trip and legacy paths canonicalize', () => {
  for (const id of [1, 14, 999, 1779033703, 4294967295]) {
    assert.equal(recordId(publicCode(id)), String(id))
    for (const resource of publicResources) {
      assert.equal(matchPublicPath(`/${resource}/${id}`).canonical, publicPath(resource, id))
      assert.equal(matchPublicPath(publicPath(resource, id)).id, String(id))
    }
  }
  for (const invalid of ['0', '-1', '4294967296', 'wt-zzzzzzz', 'wt-no', '<script>']) assert.equal(recordId(invalid), null)
  assert.equal(matchPublicPath('/admin/slides'), null)
})

const shell = '<html><head><title>Home</title><meta property="og:title" content="Home"><meta property="og:image" content="old.jpg"><meta name="description" content="home"></head><body><div id="app"></div></body></html>'
test('metadata is escaped, unique and resolves images per detail resource', () => {
  const meta = metadata({ title: 'ពិធីបុណ្យ " & <test>', description: 'Text\nline', images: ['/uploads/events/image.jpg'] }, 'pchum-ben', 'https://site.test/pchum-ben/wt-example', 'https://api.test/api')
  const html = renderMetadata(shell, meta)
  assert.equal(meta.image, 'https://api.test/uploads/events/image.jpg')
  assert.equal(meta.description, 'Text line')
  assert.equal((html.match(/property="og:title"/g) || []).length, 1)
  assert.equal((html.match(/property="og:image"/g) || []).length, 1)
  assert.ok(html.includes('&quot; &amp;'))
  assert.ok(!html.includes('old.jpg'))
  assert.ok(html.includes('id="app"'))
})

test('Worker serves preview HTML without JavaScript, redirects old links and handles failures', async (t) => {
  const originalFetch = globalThis.fetch
  t.after(() => { globalThis.fetch = originalFetch })
  const env = { API_ORIGIN: 'https://api.test/api', ASSETS: { fetch: async () => new Response(shell, { headers: { 'Content-Type': 'text/html' } }) } }
  for (const resource of publicResources) {
    const canonical = publicPath(resource, 14)
    const redirect = await worker.fetch(new Request(`https://site.test/${resource}/14`), env)
    assert.equal(redirect.status, 301)
    assert.equal(redirect.headers.get('Location'), 'https://site.test' + canonical)
    globalThis.fetch = async (url) => {
      assert.equal(url, `https://api.test/api/${resource}/14`)
      return Response.json({ success: true, data: { title: 'Preview title', subtitle: 'Preview text', image_url: 'https://images.test/photo.jpg' } })
    }
    const response = await worker.fetch(new Request('https://site.test' + canonical), env)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.ok(html.includes('content="Preview title"'))
    assert.ok(html.includes('content="Preview text"'))
    assert.ok(html.includes('https://images.test/photo.jpg'))
    assert.ok(html.includes('https://site.test' + canonical))
  }
  globalThis.fetch = async () => new Response('', { status: 404 })
  assert.equal((await worker.fetch(new Request('https://site.test' + publicPath('slides', 14)), env)).status, 404)
  globalThis.fetch = async () => { throw new Error('offline') }
  const outage = await worker.fetch(new Request('https://site.test' + publicPath('slides', 14)), env)
  assert.equal(outage.status, 503)
  assert.equal(outage.headers.get('Cache-Control'), 'no-store')
  assert.equal((await worker.fetch(new Request('https://site.test/admin/slides'), env)).status, 200)
})
