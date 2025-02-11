module.exports = {
  apps: [{
    name: 'mern-ecommerce',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 5001
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 5001
    },
    error_file: 'logs/pm2/err.log',
    out_file: 'logs/pm2/out.log',
    time: true,
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Graceful shutdown and startup
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    // Metrics
    metrics: {
      http: true,
      custom_metrics: [{
        id: 'app/requests/count',
        type: 'counter',
        name: 'Requests count',
        unit: 'request'
      }]
    },
    // Monitor configuration
    monitor: {
      cpu: true,
      memory: true,
      http: {
        path: '/health',
        port: 5001
      }
    },
    // Restart strategy
    exp_backoff_restart_delay: 100,
    // Node.js specific
    node_args: '--max-old-space-size=2048',
    // Cluster mode
    increment_var: 'PORT',
    instance_var: 'INSTANCE_ID'
  }]
};
