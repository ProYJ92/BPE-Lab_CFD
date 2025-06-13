## 1. Purpose
This project hosts offline-accessible static content for the BPE-Lab CFD website.

## 2. Folder Structure
  - `css/tailwind.offline.css`  Tailwind offline fallback
  - `assets/js/libs/`           third-party scripts

## 3. Coding Style
  - Prefer Tailwind utilities; custom CSS in style.css
  - 기본은 모바일(≤ 768 px) 기준; 'md:'(≥ 768 px) 이상에서 PC 확장.

## 4. Pull Request Rules
  - Tags: [Feat] [Fix] [Docs] [Infra] [Chore]
  - Example: [Infra] add bg-video fallback  (Closes #42)

## 5. Offline / Online Strategy
  ▸ **CDN link는 삭제 금지**.  
  ▸ CDN 바로 아래 `<link rel="stylesheet" href="css/tailwind.offline.css" onerror="this.onerror=null;this.media='all'">`  
    및 Pretendard offline link 삽입.  
  ▸ `<noscript data-offline>` 패턴은 **JS completely disabled** 상황에서만 보조적으로 사용.  
  ▸ *중복* `style.css` link 발견 시 Codex는 첫 하나만 남긴다.  
  ▸ `tailwind.offline.css` 생성 규칙  
    - 포함: reset, container, flex, grid, typography utilities  
    - 제외: animation, shadow, ring, motion-related utilities  
    - 최종 파일 ≤ 30 KB  
  ▸ Pretendard Fallback  
    - 기본: `body{font-family:sans-serif}`  
    - 필요 시 `assets/fonts/Pretendard-Variable.otf` 1 파일을 두고 @font-face 선언.  
  ▸ 새 CDN 라이브러리 도입 시 동일 “CDN + Fallback(onerror)” 패턴 적용.
  ▸ 모바일(≤ 768 px)·PC(≥ 1024 px) 모두에서 overflow 없이 표시되도록 Tailwind breakpoints를 최소 적용.

## 6. Manual Testing
```bash
python3 -m http.server &                   # launch local server
curl -s http://localhost:8000 | grep -q 'tailwind.offline.css' && \
curl -I  http://localhost:8000/index.html | grep -q '200 OK' && \
test -f assets/videos/placeholder.mp4 && \
echo "PASS"
kill $!                                     # stop server
# OPTIONAL mobile viewport check (requires chromium & imagemagick)
# chromium --headless --window-size=375,800 http://localhost:8000 -s /tmp/mobile.png && \
#   identify -format "%h" /tmp/mobile.png | grep -q '[1-9]'
```

## 7. History

* v0.4 — 2025-06-13 : add flexible CDN/Fallback policy

## 8. Checklist

* [ ] Duplicate `style.css` link 없는가
* [ ] tailwind.offline.css ≤ 30 KB
* [ ] placeholder.mp4 ≤ 200 KB
* [ ] Manual Testing 스크립트 통과
* [ ] 375 px 모바일 뷰포트에서 화면 깨짐 없음 확인
