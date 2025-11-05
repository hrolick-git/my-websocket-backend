import express from 'express';
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();

// Порт задається Railway через змінну середовища
const port = process.env.PORT || 8080;

// HTTP роут
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Створюємо HTTP сервер на базі Express
const server = createServer(app);

// WebSocket сервер на тому ж HTTP сервері, під шляхом /ws
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());

    // Розсилка всім підключеним клієнтам
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Запуск сервера
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
