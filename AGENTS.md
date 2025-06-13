# Project Guidelines

## Purpose
This project provides offline-accessible static educational content for the BPE-Lab CFD website.

## Folder Structure
- `index.html` entry point
- `css/tailwind.min.css` Tailwind CSS (local copy)
- `css/style.css` custom styles
- `js/script.js` main JavaScript
- `js/vendor/` third party scripts
- `assets/` images and fonts

## Coding Style
- Use descriptive class names where custom CSS is required.
- Reuse Tailwind utility classes when possible to keep CSS minimal.

## Pull Request Rules
- Title must start with `[Feat]`, `[Fix]`, or `[Docs]` as appropriate.
- Provide a short summary and include a "Testing Done" section describing manual and CI test results.

## Manual Testing
`python3 -m http.server → 브라우저 확인 (index.html 200 OK)`

## 5. 테스트 & 품질

## 6. 수정 히스토리
- v0.2 — YYYY-MM-DD : static tool bootstrap
- v0.3 — YYYY-MM-DD : remove unused tool references

## 7. 체크리스트
