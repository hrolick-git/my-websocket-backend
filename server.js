import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const port = process.env.PORT || 5000;

// HTTP сервер
const server = http.createServer(app);

// WebSocket на тому ж сервері
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) client.send(message);
    });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
