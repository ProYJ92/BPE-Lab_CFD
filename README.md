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

## Local Preview
정적 사이트이므로 `python -m http.server` 등으로 확인할 수 있습니다.

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


## License

This project is licensed under the [MIT License](LICENSE).


