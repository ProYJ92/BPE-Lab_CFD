const fs = require('fs');
const path = require('path');

// Extract menuStructure from script.js to build breadcrumbs
function loadMenuStructure() {
  const script = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  const match = script.match(/const menuStructure = ([\s\S]*?\n\s*\]\s*);/);
  if (!match) return [];
  try {
    const menu = eval('(' + match[1] + ')');
    return menu;
  } catch (e) {
    console.error('Failed to parse menuStructure:', e);
    return [];
  }
}

function findPathInMenu(items, currentPath) {
  for (const item of items) {
    if (item.path && currentPath.endsWith(item.path)) {
      return [item];
    }
    if (item.children) {
      const childPath = findPathInMenu(item.children, currentPath);
      if (childPath.length) {
        return [item, ...childPath];
      }
    }
  }
  return [];
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractInfo(filePath, menu) {
  const content = fs.readFileSync(filePath, 'utf8');
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? stripHtml(titleMatch[1]) : path.basename(filePath);
  const pMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const snippet = pMatch ? stripHtml(pMatch[1]).slice(0, 150) : '';
  const bodyTextMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = bodyTextMatch ? stripHtml(bodyTextMatch[1]) : '';

  let breadcrumb = [];
  if (path.basename(filePath) === 'index.html') {
    breadcrumb = ['홈'];
  } else {
    const found = findPathInMenu(menu, path.basename(filePath));
    if (found.length) {
      breadcrumb = ['홈', ...found.map(i => i.name_ko)];
    } else {
      breadcrumb = ['홈', title.split(' - ')[0]];
    }
  }

  const keywords = title.replace(/[^\w가-힣 ]/g, '').split(/\s+/);

  return {
    url: path.basename(filePath),
    title,
    breadcrumb,
    keywords,
    content_snippet: snippet,
    full_text: bodyText.slice(0, 1000)
  };
}

function generate() {
  const menu = loadMenuStructure();
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
  const results = files.map(file => extractInfo(path.join(__dirname, file), menu));
  fs.writeFileSync(path.join(__dirname, 'search_index.json'), JSON.stringify(results, null, 4));
}

generate();
