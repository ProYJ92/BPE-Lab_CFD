import subprocess, pathlib, json, re, hashlib, os, sys, argparse
from bs4 import BeautifulSoup
from google.cloud import translate_v2 as tr
from google.oauth2 import service_account

parser = argparse.ArgumentParser()
parser.add_argument('--skip-if-no-diff', action='store_true', dest='skip')
parser.add_argument('--force', action='store_true',
                    help='translate all files regardless of git diff')
args = parser.parse_args()

repo = pathlib.Path(__file__).resolve().parents[1]
assets_dir = repo / 'assets' / 'i18n'
assets_dir.mkdir(parents=True, exist_ok=True)
ko_path = assets_dir / 'ko.json'
en_path = assets_dir / 'en.json'
zh_path = assets_dir / 'zh.json'

ko = json.loads(ko_path.read_text('utf-8')) if ko_path.exists() else {}
en = json.loads(en_path.read_text('utf-8')) if en_path.exists() else {}
zh = json.loads(zh_path.read_text('utf-8')) if zh_path.exists() else {}

if not ko or not en or not zh:
    args.force = True

# ── 안전 diff: 첫 커밋·shallow clone 모두 OK ──────────────────────
if args.force:
    diff = subprocess.run(
        ['git', 'ls-files', '*.html', '*.md'],
        stdout=subprocess.PIPE, text=True, check=False
    ).stdout.split()
else:
    result = subprocess.run(
        ['git', 'diff', '--name-only', 'HEAD~1'],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, check=False
    )
    if result.returncode in (0, 1):
        diff = result.stdout.split()
    else:
        diff = subprocess.run(
            ['git', 'ls-files', '*.html', '*.md'],
            stdout=subprocess.PIPE, text=True, check=False
        ).stdout.split()

process_files = [f for f in diff if f.endswith(('.html', '.md'))]
print(f"Files to process: {len(process_files)}")
if args.skip and not process_files and not args.force:
    print('No changes detected; skipping i18n update.')
    sys.exit(0)

selectors = [
    'title',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a.nav-link',
    'a',
    'button',
    'li>a',
    'li',
    'p',
    'span',
    'label',
    'th',
    'td',
    'input[placeholder]',
    'textarea[placeholder]'
]

credentials = None
cred_json = os.environ.get('GCLOUD_SERVICE_KEY')
if cred_json:
    try:
        info = json.loads(cred_json)
        credentials = service_account.Credentials.from_service_account_info(
            info, scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
    except json.JSONDecodeError:
        if os.path.exists(cred_json):
            credentials = service_account.Credentials.from_service_account_file(
                cred_json,
                scopes=["https://www.googleapis.com/auth/cloud-platform"],
            )

project_id = os.environ.get('GCLOUD_PROJECT_ID')
if not project_id:
    print('Error: GCLOUD_PROJECT_ID environment variable not set.', file=sys.stderr)
    sys.exit(1)

client = tr.Client(credentials=credentials, project=project_id) if credentials else tr.Client(project=project_id)
try:
    client.get_languages()
except Exception as exc:
    print(f'Error verifying Cloud Translation API access: {exc}', file=sys.stderr)
    sys.exit(1)

def slug(text):
    key = re.sub(r'\W+','_',text).strip('_').lower()
    if not key or (key in ko and ko.get(key) != text):
        key = hashlib.sha1(text.encode()).hexdigest()[:10]
    return key

def translate_or_exit(text, target_language):
    try:
        return client.translate(
            text,
            target_language=target_language,
            source_language='ko'
        )['translatedText']
    except Exception as exc:
        print(f'Error translating to {target_language}: {exc}', file=sys.stderr)
        sys.exit(1)

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
            placeholder_mode = False
            if not txt and el.has_attr('placeholder'):
                txt = el['placeholder'].strip()
                placeholder_mode = True
            if not txt:
                continue
            key = el.get('data-i18n')
            if not key:
                if el.name == 'title':
                    key = 'title'
                else:
                    if placeholder_mode and el.has_attr('id'):
                        key = f"{el['id']}_placeholder"
                    else:
                        key = slug(txt)
                el['data-i18n'] = key
                modified = True
            if placeholder_mode:
                ko[key] = el['placeholder'].strip()
            else:
                ko[key] = txt
            if key not in en:
                en[key] = ''
            if key not in zh:
                zh[key] = ''
            if not en[key] or not zh[key]:
                new_keys.add(key)
    if modified:
        path.write_text(str(soup), 'utf-8')
        print(f"Updated {file}")

print(f"New keys found: {len(new_keys)}")

if new_keys:
    for key in new_keys:
        text = ko[key]
        if not en.get(key):
            en[key] = translate_or_exit(text, 'en')
        if not zh.get(key):
            zh[key] = translate_or_exit(text, 'zh')

ko_path.write_text(json.dumps(ko, ensure_ascii=False, indent=2), 'utf-8')
en_path.write_text(json.dumps(en, ensure_ascii=False, indent=2), 'utf-8')
zh_path.write_text(json.dumps(zh, ensure_ascii=False, indent=2), 'utf-8')
