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
  console.log("🔗 New client connected");

  // 🔹 Надсилаємо історію
  ws.send(JSON.stringify({ type: "history", data: messages }));

  ws.on("message", (rawData) => {
    try {
      const payload = JSON.parse(rawData.toString());

      // 🟢 Нове повідомлення
      if (payload.type === "message" && payload.data) {
        const msg: Message = payload.data;
        messages.push(msg);
        if (messages.length > 50) messages.shift();

        broadcast({ type: "message", data: msg });
      }

      // 🟢 Оновлення статусу продажу
      if (payload.type === "update" && payload.id) {
        const msg = messages.find((m) => m.id === payload.id);
        if (msg) {
          msg.sold = payload.sold;
          broadcast({ type: "update", data: msg });
        }
      }
    } catch (err) {
      console.error("❌ Error parsing message:", err);
    }
  });

  ws.on("close", () => console.log("❎ Client disconnected"));
});

function broadcast(data: any) {
  const json = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
