# AGENTS.md  
> **BPE-Lab_CFD** ― Codex · AI 에이전트를 위한 개발/디자인 헌장  
> **최종 업데이트** : 2025-06-13  

---

## 1. 프로젝트 개요
- **목적** : CFD 시뮬레이션·디지털 트윈 연구 결과를 공유하는 연구실 웹사이트  
- **주요 스택** : 정적 HTML, Tailwind CSS, JavaScript, Node 스크립트

## 2. 파일 구조
| 경로 | 설명 |
|------|------|
| `*.html` | 주요 페이지 |
| `assets/css/style.css` | Tailwind 보강 스타일 |
| `assets/js/script.js` | 전역 스크립트 |
| `generate_search_index.js` | 검색 인덱스 생성 |
| `search_index.json` | 자동 생성 인덱스 |
| `.github/workflows/preflight.yml` | CI |
| `DESIGN_GUIDE.md` | 디자인 상세 |
| `AGENTS.md` | 본 문서 |

## 3. 디자인·코딩 규칙
### 3-1. 타이포그래피
| 요소 | 클래스 예 | 비고 |
|------|-----------|------|
| 본문 | `text-base text-gray-700 font-pretendard` | Pretendard 400 |
| H1 | `text-4xl md:text-5xl font-bold text-slate-800` | |
| H2 | `text-3xl md:text-4xl font-bold text-slate-800` | |

### 3-2. 색상 팔레트
```css
:root {
  --color-primary: #0072CE;
  --color-primary-hover: #004A99;
  --color-bg-section: #F1F5F9;
  --color-text-base: #374151;
}
```

Tailwind 예 : `bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]`

### 3-3. 레이아웃·간격

| 규칙      | 값/클래스                                  |
| ------- | -------------------------------------- |
| 중앙 컨테이너 | `<div class="container mx-auto px-6">` |
| 섹션 여백   | `py-16` (필요 시 `py-24`)                 |
| 반응형     | `sm:` 모바일, `md:` 데스크톱                  |

### 3-4. 재사용 컴포넌트

| 클래스                            | 용도            |
| ------------------------------ | ------------- |
| `.card`                        | 기본 카드         |
| `.research-card`               | hover lift 카드 |
| `.responsive-iframe-container` | 16 : 9 비디오    |
| `.highlight`                   | 검색어 강조        |

### 3-5. JavaScript

* ES Modules, 전역 변수 금지, ESLint(airbnb-base) 필수
* `menu.json`·`search_index.json` 동기화 유지

### 3-6. 접근성

* 의미 요소·ARIA 속성 준수, alt 텍스트, 키보드 포커스 트랩

---

## 4. 개발 워크플로

```bash
git clone …
npm install
npm run codex:test
```

* PR : Conventional Commits, CI 통과 + 리뷰 1 인

---

## 5. 테스트 & 품질 (CI)

| 단계         | 도구                              |
| ---------- | ------------------------------- |
| HTML       | `html-validate`                 |
| 링크         | `linkinator`                    |
| JS Lint    | `eslint`                        |
| CSS Lint   | `stylelint`                     |
| 검색 인덱스     | `generate_search_index.js` diff |
| Smoke Test | Playwright (선택)                 |

---

## 6. 수정 히스토리

| 버전   | 날짜         | 변경    |
| ---- | ---------- | ----- |
| v0.1 | 2025-06-13 | 최초 작성 |

---

## 7. 체크리스트 (PR 전)

* [ ] 메뉴 JSON 업데이트
* [ ] `search_index.json` 재생성
* [ ] ESLint / Stylelint 오류 0
* [ ] HTML·링크 검증 통과
* [ ] CI 성공
* [ ] 디자인·접근성 규칙 준수

