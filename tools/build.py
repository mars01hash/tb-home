"""Build and check the TechBeez website.

Copies the publishable files into dist/ and checks every page. Netlify runs this on every push
(see netlify.toml); if any check fails, the deploy stops and the live site stays as it was.

Run it locally before pushing:
    python tools/build.py

Uses only the Python standard library.
"""
import json
import os
import re
import shutil
import sys
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')
SITE = 'https://techbeez.tech'

# Never published: tooling, docs, editor settings and the old draft.
EXCLUDE = {'.git', '.github', '.claude', '_archive', 'tools', 'dist', 'node_modules',
           'README.md', 'netlify.toml', '.gitignore', 'launch.json'}

# Links that use the URL hash for page state rather than an element id.
HASH_ROUTES = {
    'work/index.html': {'rmg', 'fintech', 'healthcare', 'ecommerce', 'saas', 'logistics', 'education'},
    'contact/index.html': {'erp', 'careers'},
}

# Comments that mark content to replace before or after launch. Reported, not fatal.
REMINDERS = ['DEMO CONTENT', 'LEGAL:', 'CAREERS:']

errors, warnings = [], []


def err(page, msg):
    errors.append(f'{page}: {msg}')


def warn(page, msg):
    warnings.append(f'{page}: {msg}')


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.imgs_no_alt, self.jsonld = [], [], 0, []
        self.title = self.desc = self.canonical = self.lang = None
        self.h1 = 0
        self._in_title = self._in_jsonld = False
        self._buf = ''

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.append(a['id'])
        if tag == 'html':
            self.lang = a.get('lang')
        if tag == 'title':
            self._in_title, self._buf = True, ''
        if tag == 'h1':
            self.h1 += 1
        if tag == 'meta' and a.get('name') == 'description':
            self.desc = a.get('content')
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonical = a.get('href')
        if tag in ('a', 'link') and a.get('href'):
            self.links.append((tag, a['href']))
        if tag in ('img', 'script', 'source', 'iframe') and a.get('src'):
            self.links.append((tag, a['src']))
        if tag == 'img' and 'alt' not in a:
            self.imgs_no_alt += 1
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self._in_jsonld, self._buf = True, ''

    def handle_endtag(self, tag):
        if tag == 'title' and self._in_title:
            self.title, self._in_title = self._buf.strip(), False
        if tag == 'script' and self._in_jsonld:
            self.jsonld.append(self._buf)
            self._in_jsonld = False

    def handle_data(self, data):
        if self._in_title or self._in_jsonld:
            self._buf += data


def copy_site():
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    for name in os.listdir(ROOT):
        if name in EXCLUDE or name.startswith('.'):
            continue
        src, dst = os.path.join(ROOT, name), os.path.join(DIST, name)
        if os.path.isdir(src):
            shutil.copytree(src, dst, ignore=shutil.ignore_patterns('.*'))
        else:
            os.makedirs(DIST, exist_ok=True)
            shutil.copy2(src, dst)


def site_files(ext):
    for dp, _, fn in os.walk(DIST):
        for f in fn:
            if f.endswith(ext):
                yield os.path.relpath(os.path.join(dp, f), DIST).replace(os.sep, '/')


def resolve(page, url):
    """Return (dist-relative path, fragment) for a local URL, or None for an external one."""
    if re.match(r'^(https?:|mailto:|tel:|data:|javascript:)', url) or url.startswith('//'):
        return None
    parts = urlsplit(url)
    path, frag = unquote(parts.path), parts.fragment
    if not path:
        return page, frag
    base = '' if path.startswith('/') else os.path.dirname(page)
    target = os.path.normpath(os.path.join(base, path.lstrip('/'))).replace(os.sep, '/')
    if target == '.':
        target = ''
    if path.endswith('/') or not target:
        target = (target + '/index.html').lstrip('/')
    return target, frag


def check():
    pages = {}
    for rel in sorted(site_files('.html')):
        text = open(os.path.join(DIST, rel), encoding='utf-8').read()
        p = Page()
        p.feed(text)
        pages[rel] = (p, text)

    for rel, (p, text) in pages.items():
        if not p.lang:
            err(rel, 'missing <html lang>')
        if not p.title:
            err(rel, 'missing <title>')
        if not p.desc:
            err(rel, 'missing meta description')
        if p.h1 != 1:
            err(rel, f'expected one <h1>, found {p.h1}')
        if p.imgs_no_alt:
            err(rel, f'{p.imgs_no_alt} image(s) without an alt attribute')
        dupes = {i for i in p.ids if p.ids.count(i) > 1}
        if dupes:
            err(rel, f'duplicate ids: {", ".join(sorted(dupes))}')
        for block in p.jsonld:
            try:
                json.loads(block)
            except ValueError as e:
                err(rel, f'invalid JSON-LD: {e}')
        if rel != '404.html':
            want = SITE + '/' + (rel[:-len('index.html')] if rel.endswith('index.html') else rel)
            if p.canonical != want:
                err(rel, f'canonical is {p.canonical!r}, expected {want!r}')
        if re.search(r'localhost|127\.0\.0\.1', text):
            err(rel, 'contains a localhost address')
        for marker in REMINDERS:
            if marker in text:
                warn(rel, f'has a "{marker}" note: placeholder content to review')

        for tag, url in p.links:
            r = resolve(rel, url)
            if r is None:
                continue
            target, frag = r
            if not os.path.exists(os.path.join(DIST, target)):
                err(rel, f'broken link {url} ({tag})')
                continue
            if frag and target.endswith('.html') and frag != 'top':
                ids = pages[target][0].ids if target in pages else []
                if frag not in ids and frag not in HASH_ROUTES.get(target, set()):
                    err(rel, f'link {url} points to a missing #{frag}')

    for rel in site_files('.css'):
        css = open(os.path.join(DIST, rel), encoding='utf-8').read()
        for url in re.findall(r'url\(\s*["\']?([^"\')]+)', css):
            r = resolve(rel, url)
            if r and not os.path.exists(os.path.join(DIST, r[0])):
                err(rel, f'broken url({url})')

    sm = os.path.join(DIST, 'sitemap.xml')
    if os.path.exists(sm):
        for loc in re.findall(r'<loc>(.*?)</loc>', open(sm, encoding='utf-8').read()):
            path = loc.replace(SITE, '').lstrip('/')
            path = path + 'index.html' if path.endswith('/') or path == '' else path
            if not os.path.exists(os.path.join(DIST, path)):
                err('sitemap.xml', f'{loc} has no page')
        listed = set(re.findall(r'<loc>(.*?)</loc>', open(sm, encoding='utf-8').read()))
        for rel in pages:
            if rel == '404.html':
                continue
            url = SITE + '/' + (rel[:-len('index.html')] if rel.endswith('index.html') else rel)
            if url not in listed:
                warn('sitemap.xml', f'{url} is not listed')
    else:
        err('sitemap.xml', 'missing')

    return len(pages)


def main():
    copy_site()
    n = check()
    for w in warnings:
        print('warning:', w)
    for e in errors:
        print('ERROR:', e)
    if errors:
        print(f'\nBuild failed: {len(errors)} error(s) in {n} pages. Nothing was deployed.')
        sys.exit(1)
    print(f'\nBuild OK: {n} pages checked, {len(warnings)} reminder(s). Output in dist/.')


if __name__ == '__main__':
    main()
