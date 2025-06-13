# Codex 인트로
Codex는 이 저장소 작업을 자동화하는 에이전트입니다. 오프라인 환경에서도 안정적으로 동작하도록 아래 절차를 따릅니다.

# 작업 명세
- HTML 변경 시 `tidy -q -errors *.html` 명령으로 정적 분석을 진행합니다.
- 로컬 서버를 기동해 페이지 정상 여부를 확인합니다.
- 예시: 오프라인 Codex 절차
  ```bash
  tidy -q -errors *.html
  python3 -m http.server &
  curl -sf http://localhost:8000/index.html > /dev/null
  ```

# PR 리뷰 체크리스트
- 모든 HTML 파일은 Tidy 오류가 없어야 합니다.
- 로컬 서버 요청이 HTTP 200을 반환해야 합니다.
- 변경 사항은 README와 AGENTS 지침을 준수합니다.

# 개발 가이드
- 외부 CDN 사용을 지양하고 필요한 자산은 로컬에 저장합니다.
- 테스트 스크립트와 워크플로를 수정할 때는 최소한으로 유지합니다.

# 커밋 명세
- 커밋 메시지는 영어 소문자로 시작하며 간결하게 작성합니다.
- 자동 커밋 시 메시지 끝에 "(자동)"을 추가합니다.

# 수정 히스토리
v1.0 — 2025-06-13 : initial agent guidelines

# 라이선스
문서와 스크립트는 MIT 라이선스를 따릅니다.
