import os
import json
import subprocess
import sys
import importlib
from pathlib import Path


def run():
    repo = Path(__file__).resolve().parents[1]
    workflow = repo / '.github' / 'workflows' / 'i18n_full.yml'
    report = {
        "permissions": True,
        "head_minus_1": True,
        "dependencies": True,
    }

    # 1) 워크플로 권한 및 secrets 존재 검사
    perm_ok = True
    try:
        text = workflow.read_text().splitlines()
        has_perm = False
        pr_write = False
        for idx, line in enumerate(text):
            if line.strip() == 'permissions:':
                has_perm = True
                # inspect following indented lines
                for sub in text[idx + 1:]:
                    if not sub.startswith(' '):
                        break
                    if 'pull-requests:' in sub and 'write' in sub:
                        pr_write = True
                        break
                break
        if not has_perm or not pr_write or os.getenv('GITHUB_TOKEN') is None:
            perm_ok = False
    except Exception:
        perm_ok = False

    if not perm_ok:
        report["permissions"] = False

    # 2) HEAD~1 존재 여부
    result = subprocess.call(
        ['git', 'rev-parse', '-q', '--verify', 'HEAD~1'],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    if result != 0:
        report["head_minus_1"] = False

    # 3) 의존성 체크
    deps_ok = True
    for mod in ('bs4', 'google.cloud.translate_v2'):
        try:
            importlib.import_module(mod)
        except ImportError:
            deps_ok = False
            break
    if not deps_ok:
        report["dependencies"] = False

    print(json.dumps(report))

    if not report["permissions"]:
        return 3
    if not report["dependencies"]:
        return 2
    if not report["head_minus_1"]:
        return 4
    return 0


exit_code = run()

if __name__ == "__main__":
    sys.exit(exit_code)
elif exit_code != 0:
    sys.exit(exit_code)
