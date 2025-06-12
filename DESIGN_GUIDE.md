# 디자인·개발 가이드

## 폰트와 타이포그래피
- 기본 폰트는 **Pretendard**를 사용합니다.
- 제목(`h1~h6`)과 본문(`p`)은 계층 구조를 지켜 크기와 굵기를 구분합니다.
- 텍스트 색상은 `var(--color-text-base)` 등을 활용하여 일관되게 지정합니다.

## 컬러 팔레트
- 기본(primary) 색상: `#0072CE`
- 호버(hyperlink hover) 색상: `#004A99`
- 회색 계열: Tailwind의 Slate 색상을 참고합니다.

## 레이아웃과 간격
- 공통 컨테이너는 `container mx-auto px-6` 클래스를 사용합니다.
- 섹션 간격은 `py-16`을 기본으로 하며, Grid와 Flex 레이아웃은 Tailwind 규칙을 따릅니다.

## 재사용 컴포넌트
- `.card`와 `.research-card`는 콘텐츠 박스 스타일에 사용합니다.
- `.responsive-iframe-container` 클래스로 iframe을 반응형으로 감쌉니다.

## 접근성 지침
- 의미에 맞는 시맨틱 태그와 `aria-*` 속성을 활용합니다.
- 모든 이미지에 `alt` 텍스트를 제공하며, 키보드 탐색이 가능해야 합니다.

## 코딩 규칙
- TailwindCSS 유틸리티 클래스를 우선적으로 사용하고, 인라인 스타일은 금지합니다.
- 색상과 간격 등은 CSS 변수로 관리합니다.

## 작업 체크리스트
- 새 페이지를 추가할 경우 `menu.json`과 `search_index.json`을 업데이트합니다.
- 변경 사항은 `npm run codex:test` 로 사전 검증을 통과해야 합니다.
