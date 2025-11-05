import express from 'express';
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
const port = process.env.PORT || 5000;

// HTTP роут
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Створюємо HTTP-сервер на базі Express
const server = createServer(app);

// WebSocket сервер на тому ж HTTP-сервері
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    // Розсилка всім клієнтам
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
