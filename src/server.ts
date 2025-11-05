// server.ts
import WebSocket, { WebSocketServer } from "ws";

// Використовуємо порт з Railway, або 8080 за замовчуванням
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

// Масив для останніх 50 повідомлень
const messages: string[] = [];

const wss = new WebSocketServer({ port: PORT, path: "/ws" });

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");

  // Надсилаємо історію новому клієнту
  messages.forEach((msg) => ws.send(msg));

  ws.on("message", (message) => {
    const msg = message.toString();

    // Додаємо до історії
    messages.push(msg);
    if (messages.length > 50) messages.shift(); // залишаємо лише останні 50

    // Ретранслюємо всім клієнтам
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
