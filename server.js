const express = require('express');
const path = require('path');
const fs = require('fs');

function loadEnv(p = '.env') {
  try {
    return fs.readFileSync(p, 'utf8')
      .split(/\r?\n/)
      .filter(l => l && !l.startsWith('#'))
      .reduce((a, l) => {
        const [k, v] = l.split('=');
        a[k] = v;
        return a;
      }, {});
  } catch {
    return {};
  }
}

const env = loadEnv();

const app = express();
const PASSWORD = (process.env.ACCESS_PASSWORD || env.ACCESS_PASSWORD || '').trim();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/auth', (req, res) => {
  const input = req.body.password?.trim();
  if (PASSWORD && input === PASSWORD) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
