import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

interface Message {
  user: string;
  text: string;
}

// Зберігаємо останні 50 повідомлень
const messages: Message[] = [];

const server = http.createServer();
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Надсилаємо останні повідомлення при підключенні
  ws.send(JSON.stringify(messages));

  ws.on('message', (data) => {
    const message: Message = JSON.parse(data.toString());
    messages.push(message);
    if (messages.length > 50) messages.shift();

    // Відправляємо всім клієнтам
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
