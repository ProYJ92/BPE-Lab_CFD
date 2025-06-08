import pathlib
import json
import re
import hashlib
import subprocess
import os
from bs4 import BeautifulSoup
from google.cloud import translate_v2 as tr

repo = pathlib.Path(__file__).resolve().parents[1]
try:
    diff = subprocess.check_output(
        ['git', 'diff', '--name-only', 'HEAD~1'], stderr=subprocess.STDOUT
    ).decode().split()
except subprocess.CalledProcessError:
    # 새 브랜치 첫 커밋 등 HEAD~1 없음 → 전체 파일 목록으로 대체
    diff = subprocess.check_output(
        ['git', 'ls-files', '*.html', '*.md']
    ).decode().split()

process_files = [f for f in diff if f.endswith(('.html', '.md'))]
selectors = ['h1','h2','h3','h4','a.nav-link','button','li>a']

assets_dir = repo / 'assets' / 'i18n'
assets_dir.mkdir(parents=True, exist_ok=True)
ko_path = assets_dir / 'ko.json'
en_path = assets_dir / 'en.json'
zh_path = assets_dir / 'zh.json'

ko = json.loads(ko_path.read_text('utf-8')) if ko_path.exists() else {}
en = json.loads(en_path.read_text('utf-8')) if en_path.exists() else {}
zh = json.loads(zh_path.read_text('utf-8')) if zh_path.exists() else {}

client = tr.Client()

def slug(text):
    key = re.sub(r'\W+','_',text).strip('_').lower()
    if not key or key in ko and ko.get(key) != text:
        key = hashlib.sha1(text.encode()).hexdigest()[:10]
    return key

new_keys = set()
for file in process_files:
    path = repo / file
    if not path.exists():
        continue
    soup = BeautifulSoup(path.read_text('utf-8'), 'html.parser')
    modified = False
    for sel in selectors:
        for el in soup.select(sel):
            txt = el.get_text(strip=True)
            if not txt:
                continue
            key = el.get('data-i18n')
            if not key:
                key = slug(txt)
                el['data-i18n'] = key
                modified = True
            ko[key] = txt
            if key not in en:
                en[key] = ''
            if key not in zh:
                zh[key] = ''
            if not en[key] or not zh[key]:
                new_keys.add(key)
    if modified:
        path.write_text(str(soup), 'utf-8')

if new_keys:
    for key in new_keys:
        text = ko[key]
        if not en.get(key):
            en[key] = client.translate(text, target_language='en', source_language='ko')['translatedText']
        if not zh.get(key):
            zh[key] = client.translate(text, target_language='zh', source_language='ko')['translatedText']

ko_path.write_text(json.dumps(ko, ensure_ascii=False, indent=2), 'utf-8')
en_path.write_text(json.dumps(en, ensure_ascii=False, indent=2), 'utf-8')
zh_path.write_text(json.dumps(zh, ensure_ascii=False, indent=2), 'utf-8')
