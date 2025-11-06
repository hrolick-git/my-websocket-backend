import WebSocket, { WebSocketServer } from "ws";
import http from "http";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

interface Message {
  id: string;
  user: string;
  color: string;
  text: string;
  farmTag?: string;
  time: string;
  selling?: boolean;
  sold?: boolean;
}

const messages: Message[] = [];

const server = http.createServer();
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("New client connected");

  // 🔹 Надсилаємо історію
  ws.send(JSON.stringify({ type: "history", data: messages }));

  ws.on("message", (data) => {
    const payload = JSON.parse(data.toString());

    if (payload.type === "message" && payload.data) {
      const message = payload.data as Message;
      messages.push(message);
      if (messages.length > 50) messages.shift();

      // 🔹 Розсилаємо нове повідомлення всім
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "message", data: message }));
        }
      });
    }
  });

  ws.on("close", () => console.log("Client disconnected"));
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
