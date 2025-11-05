import WebSocket from 'ws';

const PORT = process.env.PORT || 5000;

const wss = new WebSocket.Server({ port: PORT, host: "0.0.0.0" });

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log(`WebSocket server running on port ${PORT}`);
