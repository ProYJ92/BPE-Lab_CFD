const express = require('express');
const path = require('path');

const app = express();
const PASSWORD = process.env.ACCESS_PASSWORD;

app.use(express.json());
app.use(express.static(__dirname));

app.post('/validate-password', (req, res) => {
  const { password } = req.body || {};
  if (PASSWORD && password === PASSWORD) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
