// server.ts
import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { randomUUID } from 'crypto';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

interface ChatMessage {
  id: string;
  user: string;
  color: string;
  text: string;
  farmTag?: string;
  time: string; // ISO string
  selling?: boolean;
  sold?: boolean;
}

// Зберігаємо останні 50 повідомлень
const messages: ChatMessage[] = [];

const server = http.createServer();
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('✅ New client connected');

  // Надсилаємо історію тільки новому клієнту
  ws.send(JSON.stringify({ type: 'history', data: messages }));

  ws.on('message', (data) => {
    try {
      const payload = JSON.parse(data.toString());

      // Перевіряємо тип
      if (payload.type === 'message') {
        const msg: ChatMessage = {
          id: randomUUID(),
          user: payload.user,
          color: payload.color || '#ffffff',
          text: payload.text,
          farmTag: payload.farmTag,
          time: new Date().toISOString(),
          selling: payload.selling,
          sold: payload.sold,
        };

        // Додаємо в історію
        messages.push(msg);
        if (messages.length > 50) messages.shift();

        // Розсилаємо всім
        const out = JSON.stringify({ type: 'message', data: msg });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(out);
          }
        });
      }
    } catch (err) {
      console.error('❌ Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    console.log('❎ Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});