// 儲存 WebSocket 連接與學生 ID 的關聯
const clients = {};

// 新增 WebSocket 客戶端
const addClient = (studentId, ws) => {
  clients[studentId] = ws;
};

// 移除 WebSocket 客戶端
const removeClient = (studentId) => {
  delete clients[studentId];
};

// 發送消息給特定學生
const sendToStudent = (studentId, message) => {
  const ws = clients[studentId];
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(message);
  }
};

// 發送消息給多個學生
const sendToStudents = (studentIds, message) => {
  studentIds.forEach((id) => sendToStudent(id, message));
};

// 匯出管理函數
module.exports = {
  addClient,
  removeClient,
  sendToStudent,
  sendToStudents,
};
