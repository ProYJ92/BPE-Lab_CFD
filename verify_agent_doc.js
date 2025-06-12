#!/usr/bin/env node
const fs = require('fs');
const required = [
  '## 1. 프로젝트 개요',
  '## 2. 파일 구조',
  '## 3. 디자인·코딩 규칙',
  '## 4. 개발 워크플로',
  '## 5. 테스트 & 품질',
  '## 6. 수정 히스토리',
  '## 7. 체크리스트'
];
const doc = fs.readFileSync('AGENTS.md', 'utf8');
const miss = required.filter(h => !doc.includes(h));
if (miss.length) {
  console.error('AGENTS.md 누락:', miss);
  process.exit(1);
}

