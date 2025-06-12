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
1. Serve files locally:
   ```bash
   python3 -m http.server
   ```
2. Open `http://localhost:8000` in a browser and verify pages load without external resources.
