// Real-time Event Broadcaster using Server-Sent Events (SSE)
const clients = new Set();

export function addClient(res) {
  clients.add(res);

  // Send initial keep-alive
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  res.on('close', () => {
    clients.delete(res);
  });
}

export function broadcastEvent(type, payload = {}) {
  const data = JSON.stringify({
    type,
    data: payload,
    payload,
    message: payload?.message,
    timestamp: new Date().toISOString()
  });

  for (const client of clients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      clients.delete(client);
    }
  }
}
