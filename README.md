# TechBeez website

The website for [techbeez.tech](https://techbeez.tech): plain HTML, CSS and JavaScript, with no framework
or package install. Every push to `master` is checked and deployed automatically by Netlify.

## How updates go live

```
edit files  →  python tools/build.py  →  commit and push to master  →  Netlify checks and deploys
```

1. **Edit** the HTML or CSS (see "Where things are" below).
2. **Check locally** before pushing:
   ```bash
   python tools/build.py
   ```
   It copies the site into `dist/` and checks every page: broken links and images, missing page
   titles and descriptions, images without alt text, duplicate ids, invalid structured data and the
   sitemap. It ends with `Build OK` or a list of errors to fix.
3. **Preview** the checked site:
   ```bash
   python -m http.server 5173 --directory dist
   ```
   then open <http://localhost:5173>.
4. **Push** to `master`. Netlify runs the same build. If it passes, the new version is live within a
   minute or two. If it fails, nothing changes on the live site and Netlify shows the errors in its
   deploy log.

To try a bigger change first, push it to a branch and open a pull request: Netlify builds a private
preview link for it, and the live site only changes when the pull request is merged into `master`.

## One-time setup (Netlify and Namecheap)

1. **Netlify:** sign in at [app.netlify.com](https://app.netlify.com) with GitHub, choose
   *Add new site → Import an existing project → GitHub*, and pick `TechBeez-Technologies/tb-home`.
   The build settings are read from `netlify.toml`; leave the form fields as they are and deploy.
2. **Domain:** in the site's *Domain management*, add `techbeez.tech` and make it the primary domain
   (Netlify adds `www.techbeez.tech` and redirects it).
3. **Namecheap DNS** (*Domain List → Manage → Advanced DNS*):
   - `A` record, host `@`, value: the load balancer IP Netlify shows for your site
   - `CNAME` record, host `www`, value: `<your-site>.netlify.app`
   - remove any parking-page records for `@` and `www`
   - **leave the MX and TXT records alone**: they run the info@techbeez.tech mailbox
4. **HTTPS:** Netlify issues a free certificate once DNS has updated (usually under an hour).
   Then turn on *Force HTTPS*.
5. **After launch:** send a test enquiry from the live contact form, and submit
   `https://techbeez.tech/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## Where things are

```
index.html               Home page
services/ about/ faq/    Company pages (each folder has an index.html)
contact/ careers/
privacy/ terms/          Legal pages
tb-erp/                  TB-ERP product page
work/                    Case studies: index.html lists them, one file per project
insights/                Articles: index.html lists them, one file per article
404.html                 "Page not found"
sitemap.xml robots.txt   For search engines (update sitemap.xml when you add or remove a page)
site.webmanifest         App name and icons
assets/css/              tokens.css (colours, fonts) → base → layout → sections/* → pages → footer → utilities
assets/js/               core.js first, then one file per behaviour
assets/img/              Logo, icons and the social sharing image (og-default.jpg)
tools/build.py           Build and checks (not published)
netlify.toml             Netlify build, security headers and caching (not published)
_archive/                Old drafts, kept for reference (not published)
```

### Common changes

| To change… | Edit |
|---|---|
| Brand colours, fonts, spacing | `assets/css/tokens.css` |
| Home page text, links or images | That section in `index.html` (each starts with a `<!-- ===== Name ===== -->` comment) |
| Menu or footer links | The `<header>` and `<footer>` blocks. They are repeated in every page, so change all of them (search the project for the old link) |
| Contact email or LinkedIn | Search the project for `info@techbeez.tech` or `linkedin.com/company` |
| Contact form delivery | `WEB3FORMS_KEY` at the top of `assets/js/contact-form.js` (key from web3forms.com) |
| Stats (6+ years, 100+ projects, 50+ clients) | `index.html`, `about/index.html`, the FAQ and every footer |

### Adding an article or case study

1. Copy an existing file in `insights/` or `work/` and give it a short, hyphenated file name.
2. Change the title, `<meta name="description">`, the text, the photo and the dates. In the
   `<!-- seo -->` block near the top, change the canonical and `og:` URLs to the new file name.
3. Add a card for it to `insights/index.html` or `work/index.html`.
4. Add its URL to `sitemap.xml`.
5. Run `python tools/build.py`. It reports anything you missed, such as a canonical URL that does not
   match the file name or a page missing from the sitemap.

### External services

| Service | Used for | If you change it |
|---|---|---|
| Google Fonts | Mona Sans font | Update `font-src`/`style-src` in `netlify.toml` |
| Unsplash | Photos (loaded from images.unsplash.com) | Self-hosted photos in `assets/img/` need no change |
| jsDelivr (Simple Icons) | Technology logos on the home page | Update `img-src` in `netlify.toml` |
| Web3Forms | Contact form delivery to info@techbeez.tech | Update `connect-src` in `netlify.toml` |

`netlify.toml` sets a Content-Security-Policy that only allows these hosts. If you add a new
service (analytics, chat, video) and it does not load on the live site, add its host there.

## Before launch

`python tools/build.py` lists these as reminders until they are dealt with:

- **Demo content** (`DEMO CONTENT` notes): the case studies other than TB-ERP, the testimonials, the
  "4.9 from 70+ reviews" rating and the client logo strip are illustrative. Replace them with real
  clients and figures, or remove them.
- **Legal pages** (`LEGAL:` notes): add the company's legal name and address and have the Privacy
  Policy and Terms of Use reviewed.
- **Careers** (`CAREERS:` note): replace the example roles and perks with real openings.
