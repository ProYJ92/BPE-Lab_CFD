## 목적
이 저장소는 BPE-Lab CFD 웹사이트 자료를 관리합니다.

## 기본 규칙
- 모든 변경 사항은 main 브랜치에 직접 커밋합니다.
- 외부 CDN 사용을 지양하고 로컬 자원을 활용합니다.

## 코드 스타일
- HTML 문서는 `tidy -q -errors`로 검증해야 합니다.
- JavaScript는 간단 명료하게 작성합니다.

## 문서 스타일
- README와 문서에는 명확한 한국어를 사용합니다.

## PR 메시지
- PR 제목은 간결하게, 본문에는 변경 요약을 작성합니다.

## 수정 히스토리
- v1.0 — 2024-06-11 : 초기 부트스트랩

## 오프라인 Codex 절차
다음 명령으로 로컬에서 문서 검증 후 서빙합니다.
```bash
tidy -q -errors *.html
python3 -m http.server &
curl -sf http://localhost:8000/index.html > /dev/null
```
