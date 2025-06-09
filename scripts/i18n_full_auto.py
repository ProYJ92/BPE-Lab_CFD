import subprocess, pathlib, json, re, hashlib, os, sys, argparse
from bs4 import BeautifulSoup
from google.cloud import translate_v2 as tr
from google.oauth2 import service_account
from google.auth.exceptions import GoogleAuthError

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

def load_json(path):
    try:
        return json.loads(path.read_text('utf-8'))
    except (FileNotFoundError, json.JSONDecodeError):
        print(f'Warning: {path} is missing or invalid. Starting empty.')
        return {}

ko = load_json(ko_path)
en = load_json(en_path)
zh = load_json(zh_path)

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
print(f"Processing {len(process_files)} files")
print(f"Processing files: {process_files}")
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
    'textarea[placeholder]',
    'div'
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

os.environ.setdefault('GOOGLE_CLOUD_PROJECT', project_id)
client = tr.Client(credentials=credentials)
try:
    client.get_languages()
except GoogleAuthError as exc:
    print(f'Invalid Google Cloud credentials: {exc}', file=sys.stderr)
    sys.exit(1)
except Exception as exc:
    print(f'Error verifying Cloud Translation API access: {exc}', file=sys.stderr)
    sys.exit(1)

def slug(text):
    key = re.sub(r'\W+','_',text).strip('_').lower()
    if not key or (key in ko and ko.get(key) != text):
        key = hashlib.sha1(text.encode()).hexdigest()[:10]
    return key

def translate_or_exit(text, target_language, key):
    try:
        result = client.translate(
            text,
            target_language=target_language,
            source_language='ko'
        )['translatedText']
        print(f"Translated {key} -> {target_language}")
        return result
    except GoogleAuthError as exc:
        print(f'Invalid Google Cloud credentials: {exc}', file=sys.stderr)
        sys.exit(1)
    except Exception as exc:
        msg = f"Error translating key '{key}' to {target_language}: {type(exc).__name__}: {exc}"
        print(msg, file=sys.stderr)
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
                    basename = path.stem
                    key = f"title_{basename}"
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

print(f"Total new keys: {len(new_keys)}")

# Parse translation strings defined in script.js
js_file = repo / 'script.js'
if js_file.exists():
    m = re.search(r'const\s+jsI18n\s*=\s*(\{[\s\S]*?\});', js_file.read_text('utf-8'))
    if m:
        try:
            js_dict = json.loads(m.group(1))
            for k, v in js_dict.items():
                if k not in ko:
                    ko[k] = v
                if k not in en:
                    en[k] = ''
                if k not in zh:
                    zh[k] = ''
                if not en[k] or not zh[k]:
                    new_keys.add(k)
        except json.JSONDecodeError:
            print('Warning: failed to parse jsI18n block in script.js')

if new_keys:
    for key in new_keys:
        text = ko[key]
        if not en.get(key):
            en[key] = translate_or_exit(text, 'en', key)
        if not zh.get(key):
            zh[key] = translate_or_exit(text, 'zh', key)

ko_path.write_text(json.dumps(ko, ensure_ascii=False, indent=2), 'utf-8')
en_path.write_text(json.dumps(en, ensure_ascii=False, indent=2), 'utf-8')
zh_path.write_text(json.dumps(zh, ensure_ascii=False, indent=2), 'utf-8')
print(f"ko.json keys: {len(ko)}")
print(f"en.json keys: {len(en)}")
print(f"zh.json keys: {len(zh)}")
