const fs = require('fs');
const required = [
  '# Codex 인트로',
  '# 작업 명세',
  '# PR 리뷰 체크리스트',
  '# 개발 가이드',
  '# 커밋 명세',
  '# 수정 히스토리',
  '# 라이선스'
];

const data = fs.readFileSync('AGENTS.md', 'utf8');
for (const head of required) {
  if (!data.includes(head)) {
    console.error(`Missing header: ${head}`);
    process.exit(1);
  }
}
