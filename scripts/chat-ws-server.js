import { WebSocketServer } from 'ws';

const port = parseInt(process.env.CHAT_WS_PORT || '3001', 10);
const wss = new WebSocketServer({ port });

const rooms = new Map();

function getRoomClients(room) {
  if (!rooms.has(room)) {
    rooms.set(room, new Set());
  }
  return rooms.get(room);
}

function broadcastToRoom(room, payload) {
  const clients = getRoomClients(room);
  const message = JSON.stringify(payload);
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
}

wss.on('connection', (ws) => {
  let joinedRoom = 'Spanish-beginner';

  getRoomClients(joinedRoom).add(ws);

  ws.send(JSON.stringify({
    type: 'connected',
    room: joinedRoom,
    message: 'Connected to language room.',
  }));

  ws.on('message', async (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === 'join_room') {
        getRoomClients(joinedRoom).delete(ws);
        joinedRoom = data.room || 'Spanish-beginner';
        getRoomClients(joinedRoom).add(ws);
        ws.send(JSON.stringify({ type: 'joined_room', room: joinedRoom }));
        return;
      }

      if (data.type === 'chat_message') {
        const payload = {
          type: 'chat_message',
          room: joinedRoom,
          userId: data.userId || null,
          userName: data.userName || 'Learner',
          message: data.message || '',
          createdAt: new Date().toISOString(),
        };

        broadcastToRoom(joinedRoom, payload);
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid WebSocket payload.',
      }));
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    getRoomClients(joinedRoom).delete(ws);
  });
});

console.log(`Chat WebSocket server running on ws://localhost:${port}`);
