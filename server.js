import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 5000, host: '0.0.0.0' });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      console.log('Received:', parsed);

      // Відправляємо повідомлення всім підключеним клієнтам
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send(JSON.stringify(parsed));
        }
      });
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log('WebSocket server running on ws://0.0.0.0:5000');
