require('dotenv').config();
var express = require('express');
var path = require('path');
var todosRouter = require('./routes/todos');

var app = express();
var PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

app.use('/api/todos', todosRouter);

app.listen(PORT, function () {
  console.log('Todo server running at http://localhost:' + PORT);
});
