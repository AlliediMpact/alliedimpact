// Simple WebSocket server for development/testing
// Run with: node scripts/ws-server.js

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.WS_PORT || 3001;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Mock data generators
function generateMockTransaction() {
  const types = ['invest', 'loan'];
  const statuses = ['pending', 'completed', 'processing'];
  const names = ['John D.', 'Sarah M.', 'Mike R.', 'Lisa K.', 'Tom W.'];
  
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: types[Math.floor(Math.random() * types.length)],
    userName: names[Math.floor(Math.random() * names.length)],
    amount: Math.floor(Math.random() * 10000) + 100,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    timestamp: Date.now(),
  };
}

function generateStats() {
  return {
    totalVolume: Math.floor(Math.random() * 1000000) + 500000,
    activeUsers: Math.floor(Math.random() * 100) + 50,
    completedToday: Math.floor(Math.random() * 500) + 100,
  };
}

function generatePriceUpdate(symbol) {
  const basePrice = {
    BTC: 45000,
    ETH: 3000,
    USDT: 1,
  };
  
  const price = basePrice[symbol] + (Math.random() - 0.5) * 100;
  const change = (Math.random() - 0.5) * 5;
  
  return {
    symbol,
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
  };
}

// Broadcast to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Handle new WebSocket connections
wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);

  // Send initial stats
  ws.send(JSON.stringify({
    type: 'stats:update',
    data: generateStats(),
    timestamp: Date.now(),
  }));

  // Handle messages from clients
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      
      // Handle different message types
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Simulate live transaction feed
setInterval(() => {
  if (clients.size > 0) {
    broadcast({
      type: 'transaction:new',
      data: generateMockTransaction(),
      timestamp: Date.now(),
    });
  }
}, 5000); // New transaction every 5 seconds

// Update stats periodically
setInterval(() => {
  if (clients.size > 0) {
    broadcast({
      type: 'stats:update',
      data: generateStats(),
      timestamp: Date.now(),
    });
  }
}, 10000); // Update stats every 10 seconds

// Update prices
setInterval(() => {
  if (clients.size > 0) {
    ['BTC', 'ETH', 'USDT'].forEach((symbol) => {
      broadcast({
        type: 'price:update',
        data: generatePriceUpdate(symbol),
        timestamp: Date.now(),
      });
    });
  }
}, 3000); // Update prices every 3 seconds

// Start the server
server.listen(PORT, () => {
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
  console.log('Waiting for client connections...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down WebSocket server...');
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});
