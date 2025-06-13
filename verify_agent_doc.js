const fs = require('fs');
const content = fs.readFileSync('AGENTS.md', 'utf8');
const headers = [
  '## 목적',
  '## 기본 규칙',
  '## 코드 스타일',
  '## 문서 스타일',
  '## PR 메시지',
  '## 수정 히스토리',
  '## 오프라인 Codex 절차'
];
for (const h of headers) {
  if (!content.includes(h)) {
    console.error('Missing header:', h);
    process.exit(1);
  }
}
