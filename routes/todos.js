var express = require('express');
var router = express.Router();
var db = require('../db');

router.get('/', function (req, res) {
  var todos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
  res.json(todos);
});

router.post('/', function (req, res) {
  var text = req.body.text;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  var result = db.prepare('INSERT INTO todos (text) VALUES (?)').run(text.trim());
  var todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(todo);
});

router.put('/:id', function (req, res) {
  var id = parseInt(req.params.id, 10);
  var todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  var text = req.body.text !== undefined ? req.body.text : todo.text;
  var completed = req.body.completed !== undefined ? (req.body.completed ? 1 : 0) : todo.completed;

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text must be a non-empty string' });
  }

  db.prepare('UPDATE todos SET text = ?, completed = ? WHERE id = ?').run(text.trim(), completed, id);
  var updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/completed', function (req, res) {
  var result = db.prepare('DELETE FROM todos WHERE completed = 1').run();
  res.json({ deleted: true, count: result.changes });
});

router.delete('/:id', function (req, res) {
  var id = parseInt(req.params.id, 10);
  var todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  res.json({ deleted: true, id: id });
});

module.exports = router;
