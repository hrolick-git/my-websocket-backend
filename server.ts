import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';

const PORT = process.env.PORT || 8080;
const server = http.createServer();
const wss = new WebSocketServer({ server, path: '/ws' });

interface Message {
  user: string;
  text: string;
}

const messages: Message[] = [];

wss.on('connection', (ws) => {
  // Надсилаємо новому клієнту історію
  ws.send(JSON.stringify({ type: 'history', data: messages }));

  ws.on('message', (data: WebSocket.RawData) => {
    const msg: Message = JSON.parse(data.toString());

    // Зберігаємо останні 50 повідомлень
    messages.push(msg);
    if (messages.length > 50) messages.shift();

    // Розсилаємо всім
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'message', data: msg }));
      }
    });
  });
});

server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
