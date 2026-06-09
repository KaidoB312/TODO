require('dotenv').config();

process.on('uncaughtException', function (err) {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});
process.on('unhandledRejection', function (reason) {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

console.log('Starting server...');
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);

try {
  var express = require('express');
  var path = require('path');
  var pool = require('./db');
  var todosRouter = require('./routes/todos');

  var app = express();
  var PORT = process.env.PORT || 3000;

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '.')));
  app.use('/api/todos', todosRouter);

  pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `).then(function () {
    console.log('Table ready');
  }).catch(function (err) {
    console.error('Table error:', err.message);
  });

  var server = app.listen(PORT, function () {
    console.log('Listening on port ' + PORT);
  });

  server.on('error', function (err) {
    console.error('Server error:', err);
  });

  console.log('Startup complete');
} catch (e) {
  console.error('STARTUP CRASH:', e);
  process.exit(1);
}
