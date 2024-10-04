let WSServer = require("ws").Server;
let server = require("http").createServer();
let app = require("./index");
const jwt = require("jsonwebtoken"); // 用來驗證 JWT
const wsManager = require("./ws-manager"); // 引入 ws-manager 模組

// Create web socket server on top of a regular http server
let wss = new WSServer({
  server: server,
});

// 儲存 WebSocket 連接與學生 ID 的關聯
let clients = {};

// Also mount the app here
server.on("request", app);

wss.on("listening", () => {
  console.log("WebSocket 伺服器已啟動，準備接收連接");
});

wss.on("connection", function connection(ws) {
  console.log("A client connected via WebSocket");

  // 客戶端需要發送 JWT token 來驗證身份
  ws.on("message", (message) => {
    try {
      // 嘗試解析 JWT token
      const { token } = JSON.parse(message);
      const decoded = jwt.verify(
        token.split(" ")[1],
        process.env.PASSPORT_SECRET
      );

      const userId = decoded._id;

      // 將該 WebSocket 連接與學生 ID 綁定
      clients[userId] = ws;

      // 將 WebSocket 連接資訊傳遞給 ws-manager 進行管理
      wsManager.addClient(userId, ws);

      console.log(`WebSocket connection associated with user ID: ${userId}`);
    } catch (error) {
      console.log("Invalid token or error decoding the token");
    }
  });

  ws.on("close", () => {
    for (let userId in clients) {
      if (clients[userId] === ws) {
        delete clients[userId];
        wsManager.removeClient(userId); // 移除 ws-manager 中的該學生
        console.log(`WebSocket connection for user ID: ${userId} closed`);
        break;
      }
    }
  });
});

server.listen(8080, function () {
  console.log(`http/ws server listening on 8080`);
});
