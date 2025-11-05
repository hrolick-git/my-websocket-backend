// server.js
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const port = process.env.PORT || 5000;

const server = http.createServer(app); // HTTP сервер, Railway надає HTTPS автоматично
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  ws.on('message', (message) => {
    // Розсилаємо всім
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) client.send(message);
    });
  });
});

server.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});
