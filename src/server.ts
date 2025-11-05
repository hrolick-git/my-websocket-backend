import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

// Отримуємо порт із середовища (Railway надає його)
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

// Масив для останніх 50 повідомлень
const messages: { user: string; text: string }[] = [];

// Створюємо HTTP сервер
const server = http.createServer();

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Відправляємо останні 50 повідомлень при підключенні
  ws.send(JSON.stringify({ type: 'history', messages }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      messages.push(message);

      // Зберігаємо лише останні 50
      if (messages.length > 50) messages.shift();

      // Розсилаємо всім клієнтам
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    } catch (err) {
      console.error('Failed to process message', err);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`HTTP + WS server running on port ${PORT}`);
});
