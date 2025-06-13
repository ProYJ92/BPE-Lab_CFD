# Offline Codex Guide

## 1. Purpose
Offline-ready educational materials for the BPE-Lab CFD website.

## 2. Folder Structure
- `index.html` entry point
- `css/tailwind.min.css` Tailwind CSS (local copy)
- `style.css` custom styles
- `js/` scripts
- `assets/` images and fonts

## 3. Coding Style
- Prefer Tailwind utility classes over custom CSS.
- Use clear semantic HTML.

## 4. Pull Request Rules
- Title starts with `[Feat]`, `[Fix]`, or `[Docs]`.
- Summary must include a "Testing Done" section.

## 5. 오프라인 Codex 절차
```bash
tools/html-validate "**/*.html"
python3 -m http.server &
curl -sf http://localhost:8000/index.html > /dev/null
```

## 6. 수정 히스토리
- v0.2 — YYYY-MM-DD : static tool bootstrap

## 7. 체크리스트
- [ ] offline_cache 재생성 시 tools/tailwindcss로 CSS 리빌드
