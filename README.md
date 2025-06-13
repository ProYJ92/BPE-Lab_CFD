# BPE-Lab CFD

This repository hosts materials for the BPE-Lab CFD website.

## Architecture
| Environment            | Resource loading strategy                           |
|------------------------|-----------------------------------------------------|
| Online (GitHub Pages)  | Tailwind CDN · Pretendard CDN · real video.mp4      |
| Offline (Codex sandbox)| CDN fails ➜ Fallback CSS (`tailwind.offline.css`,   |
|                        | `pretendard.offline.css`) and poster.jpg via        |
|                        | **link onerror** trigger                            |

<!-- *오프라인 컨테이너는 JS 차단 상태일 수도 있으나, CDN 404 상황까지 아우르기 위해 onerror 방식을 기본값으로 채택합니다.* -->
<!-- Mobile viewport (≤ 768 px)는 Tailwind mobile-first 기본값으로 자동 대응됩니다. -->

## Local Development
1. `.env` 파일에 비밀값을 정의합니다.
   ACCESS_PASSWORD=<YOUR_SECRET>
2. 서버 실행  
   node server.js            # macOS/Linux  
   set ACCESS_PASSWORD=<YOUR_SECRET> && node server.js   # Windows

The site will be available at `http://localhost:3000` by default.

## Folder Structure
```
index.html
css/
  ├─ style.css                 # project-specific
  ├─ tailwind.offline.css      # offline fallback (≤ 30 KB, see AGENTS)
  └─ pretendard.offline.css    # offline fallback
assets/
  ├─ js/libs/                  # third-party JS
  └─ videos/                   # bg videos (placeholder & real, ≤ 200 KB/ea)
```

## Contributing
로컬 확인 : python3 -m http.server → http://localhost:8000

## License

This project is licensed under the [MIT License](LICENSE).


