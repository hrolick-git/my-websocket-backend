// server.ts (компатибільна версія — збереження останніх 50 повідомлень і сумісна обробка)
// Використовуй цей файл замість current server.ts

import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { randomUUID } from 'crypto';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

interface Message {
  id: string;
  user: string;
  color: string;
  text: string;
  farmTag?: string;
  time: string;
  selling?: boolean;
  sold?: boolean;
}

// In-memory buffer останніх 50 повідомлень
const MAX_HISTORY = 50;
const messages: Message[] = [];

const server = http.createServer();
const wss = new WebSocketServer({ server, path: '/ws' });

function sendToAll(obj: any) {
  const s = JSON.stringify(obj);
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(s);
  });
}

wss.on('connection', (ws) => {
  console.log('✅ New client connected');

  // Надсилаємо історію (wrapped) — фронт очікує { type: 'history', data: [...] }
  try {
    ws.send(JSON.stringify({ type: 'history', data: messages }));
  } catch (e) {
    console.error('Failed to send history to new client', e);
  }

  ws.on('message', (raw) => {
    let payload: any;
    try {
      payload = JSON.parse(raw.toString());
    } catch (e) {
      console.error('Bad JSON from client:', e);
      return;
    }

    // Підтримуємо кілька форматів вхідних повідомлень:
    // 1) Старий простий формат: { user, text, ... }
    // 2) Новий обгортаний: { type: 'message', data: { ... } }
    // 3) Інші типи (наприклад mark_sold) — форвардимо іншим клієнтам як є

    // Якщо це wrapper message
    if (payload && payload.type === 'message' && payload.data) {
      const data = payload.data;
      // Якщо у data немає id/time — додаємо
      const msg: Message = {
        id: data.id || randomUUID(),
        user: String(data.user || 'Unknown'),
        color: data.color || '#cccccc',
        text: String(data.text || ''),
        farmTag: data.farmTag,
        time: data.time || new Date().toISOString(),
        selling: !!data.selling,
        sold: !!data.sold,
      };
      // store + broadcast
      messages.push(msg);
      if (messages.length > MAX_HISTORY) messages.splice(0, messages.length - MAX_HISTORY);
      sendToAll({ type: 'message', data: msg });
      return;
    }

    // Якщо це старий прямий формат (має user && text)
    if (payload && typeof payload.user === 'string' && typeof payload.text === 'string') {
      const p = payload;
      const msg: Message = {
        id: p.id || randomUUID(),
        user: p.user,
        color: p.color || '#cccccc',
        text: p.text,
        farmTag: p.farmTag,
        time: p.time || new Date().toISOString(),
        selling: !!p.selling,
        sold: !!p.sold,
      };
      messages.push(msg);
      if (messages.length > MAX_HISTORY) messages.splice(0, messages.length - MAX_HISTORY);
      sendToAll({ type: 'message', data: msg });
      return;
    }

    // Для інших типів (наприклад mark_sold) — передати всім як є (клієнт має змінити локально)
    if (payload && payload.type) {
      // просто ретранслюємо інші події
      sendToAll(payload);
      return;
    }

    console.warn('Unknown payload shape, ignored:', payload);
  });

  ws.on('close', () => {
    console.log('❎ Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WS error', err);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
