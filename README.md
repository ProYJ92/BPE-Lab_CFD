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
정적 파일만으로 동작하므로 별도 서버가 필요하지 않습니다. 로컬에서 확인할 때는
간단한 웹 서버를 실행하면 됩니다.

```
python3 -m http.server
```

브라우저에서 [http://localhost:8000](http://localhost:8000) 으로 접속하세요.

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

## Password Protection
일부 페이지는 비밀번호 `bioprocess2025`로 보호됩니다. 비밀번호는 코드에
Base64 문자열(`YmlvcHJvY2VzczIwMjU=`) 형태로 저장되어 있으며, 올바른 값을 입력
하면 브라우저 `localStorage`에 인증 상태가 기록되어 재방문 시 다시 입력할 필요가
없습니다.

## License

This project is licensed under the [MIT License](LICENSE).


