module.exports = {
  apps : [{
    name: 'PPPolice',
    script: 'index.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'arily',
      host : 'localhost',
      ref  : 'origin/master',
      repo : 'arily@github.com:PPPolice.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
