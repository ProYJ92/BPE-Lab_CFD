import os
import subprocess
import json
import pathlib
import re
import hashlib
from bs4 import BeautifulSoup

# mask project id for logs
print(f"::add-mask::{os.getenv('GCLOUD_PROJECT_ID', '')}")

# changed files from last commit
try:
    result = subprocess.check_output(['git','diff','--name-only','HEAD~1']).decode()
except subprocess.CalledProcessError:
    result = ''
files = [f for f in result.splitlines() if f.endswith(('.html','.md')) and os.path.isfile(f)]

selectors = ['h1','h2','h3','h4','a.nav-link','button','li>a']
exclude_parents = {'pre','code','script','style'}

new_strings = {}
char_count = 0


def slugify(name):
    return re.sub(r'[^a-z0-9]+','_',name.lower()).strip('_')

for path in files:
    p = pathlib.Path(path)
    slug = slugify(p.stem)
    with open(p, 'r', encoding='utf-8') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    # insert lang switcher if missing
    if not soup.select_one('#langSwitcher'):
        select_html = BeautifulSoup(
            '<select id="langSwitcher" style="width:120px">\n'
            '  <option value="ko">ko</option>\n'
            '  <option value="en">en</option>\n'
            '  <option value="zh">zh</option>\n'
            '</select>', 'html.parser')
        if soup.body:
            soup.body.insert(0, select_html)
    # insert translation script
    if not soup.find(id='i18n-script'):
        script_tag = soup.new_tag('script', src='assets/js/translate.js', defer=True)
        script_tag['id'] = 'i18n-script'
        if soup.body:
            soup.body.append(script_tag)
    for sel in selectors:
        for elem in soup.select(sel):
            if any(parent.name in exclude_parents for parent in elem.parents):
                continue
            text = elem.get_text(strip=True)
            if not text:
                continue
            if not elem.has_attr('data-i18n'):
                key_base = f"{slug}_{elem.name}_{hashlib.md5(text.encode('utf-8')).hexdigest()[:6]}"
                elem['data-i18n'] = key_base
            key = elem['data-i18n']
            new_strings[key] = text
    with open(p, 'w', encoding='utf-8') as f:
        f.write(str(soup))

# load existing ko translations
ko_path = pathlib.Path('assets/i18n/ko.json')
ko_data = {}
if ko_path.exists():
    with open(ko_path, 'r', encoding='utf-8') as f:
        try:
            ko_data = json.load(f)
        except json.JSONDecodeError:
            ko_data = {}

updated = False
for k,v in new_strings.items():
    if k not in ko_data:
        ko_data[k] = v
        updated = True
if updated:
    with open(ko_path, 'w', encoding='utf-8') as f:
        json.dump(ko_data, f, ensure_ascii=False, indent=2)

# function to translate missing entries
try:
    from google.cloud import translate_v2 as tr
    client = tr.Client()
except Exception:
    client = None

for lang in ['en','zh']:
    path = pathlib.Path(f'assets/i18n/{lang}.json')
    data = {}
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = {}
    keys_to_trans = [k for k in ko_data if k not in data or not data[k]]
    texts = [ko_data[k] for k in keys_to_trans]
    if client and texts:
        translations = client.translate(texts, target_language=lang)
        for k,t in zip(keys_to_trans, translations):
            data[k] = t['translatedText']
            char_count += len(ko_data[k])
    for k in keys_to_trans:
        if k not in data:
            data[k] = ''
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print(f"chars={char_count}")
