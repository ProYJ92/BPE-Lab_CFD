# Project Guidelines

## 1. Purpose
Offline-accessible static educational content for the BPE-Lab CFD website.

## 2. Folder Structure
- `index.html` entry point
- `css/tailwind.min.css` Tailwind CSS (local copy)
- `style.css` custom styles
- `script.js` main JavaScript
- `assets/` images and fonts

## 3. Coding Style
- Use descriptive class names where custom CSS is required.
- Reuse Tailwind utility classes when possible to keep CSS minimal.

## 4. Pull Request Rules
- Title must start with `[Feat]`, `[Fix]`, or `[Docs]`.
- Provide a short summary and include a "Testing Done" section describing manual and CI test results.

## 5. Manual Testing
`python3 -m http.server → HTTP 200 확인`

## 6. 수정 히스토리
- v0.2 — YYYY-MM-DD : static tool bootstrap
- v0.3 — YYYY-MM-DD : remove unused tool references

## 7. 체크리스트
