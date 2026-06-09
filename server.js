require('dotenv').config();
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
  console.log('Database table ready');
}).catch(function (err) {
  console.error('Failed to create table:', err.message);
  process.exit(1);
});

app.listen(PORT, function () {
  console.log('Todo server running on port ' + PORT);
});
