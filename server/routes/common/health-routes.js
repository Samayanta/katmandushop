const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  // Check MongoDB connection
  const mongoStatus = {
    connected: mongoose.connection.readyState === 1,
    state: mongoose.connection.readyState
  };

  const healthStatus = {
    status: mongoStatus.connected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: mongoStatus.connected ? 'connected' : 'error',
        state: mongoStatus.state
      }
    },
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100 + ' MB'
    },
    environment: process.env.NODE_ENV
  };

  res.status(healthStatus.status === 'healthy' ? 200 : 503).json(healthStatus);
});

module.exports = router;
