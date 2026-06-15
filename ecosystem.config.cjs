// PM2 — gerenciador de processos para produção
module.exports = {
  apps: [
    {
      name: 'studio-markin',
      script: './backend/server/index.mjs',
      interpreter: 'node',
      node_args: '--experimental-vm-modules',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5175,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
