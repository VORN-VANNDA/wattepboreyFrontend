# Public links and Facebook previews

Detail pages for slides, events, members, donors and Pchum Ben posts now use
stable `wt-…` codes. Numeric links redirect to the corresponding code. These
codes are presentation identifiers, not encryption or access control. The API
continues to use numeric IDs, so existing records need no database migration.

## Cloudflare Workers deployment

1. Deploy the current backend, including all public detail routes.
2. Run `npm run build` in this frontend.
3. Deploy using this folder's `wrangler.jsonc` (`npx wrangler deploy`). Deploy
   the Worker and assets together; uploading only `dist` does not enable previews.
4. `API_ORIGIN` in Wrangler must point to the same public backend as the production
   frontend (`VITE_API_URL`, or the default Render API). Include the `/api` suffix.
5. Open a production detail link. View page source and check `og:title`,
   `og:description`, `og:image` and `og:url` for that record.
6. Paste the HTTPS production link into Facebook Sharing Debugger and select
   **Scrape Again** if Facebook cached an older preview.

The Worker serves per-record metadata in the initial HTML to both visitors and
crawlers. No crawler-specific redirects or JavaScript execution are required.
Cloudinary images remain absolute URLs; relative uploaded images resolve against
the backend. Missing records return 404; temporary backend failures return 503
without caching an incorrect homepage preview.

`localhost`, private URLs and local `vite` preview cannot be crawled by Facebook.
The dynamic preview handler is configured for Cloudflare Workers; a Vercel or
static-only deployment would require its own server-side handler.

Run `node --test tests/publicLinks.test.js` for link and preview tests.
