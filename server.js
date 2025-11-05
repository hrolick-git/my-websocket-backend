import WebSocket, { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 5000;

// Підтримка WebSocket на будь-якому доступному хості і порту
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on ws://0.0.0.0:${PORT}`);

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());

    // Шлемо всім клієнтам
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
