const fs = require('fs');
const content = fs.readFileSync('AGENTS.md', 'utf8');
const headers = content.match(/^## /gm) || [];
if (headers.length < 7) {
  console.error('AGENTS.md must contain at least 7 second-level headers');
  process.exit(1);
}
if (!content.includes('오프라인 Codex 절차')) {
  console.error('AGENTS.md must include "오프라인 Codex 절차" example');
  process.exit(1);
}
console.log('AGENTS.md verification passed');
