var express = require('express');
var router = express.Router();
var pool = require('../db');

router.get('/', async function (req, res) {
  try {
    var result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async function (req, res) {
  var text = req.body.text;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    var result = await pool.query(
      'INSERT INTO todos (text) VALUES ($1) RETURNING *',
      [text.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async function (req, res) {
  var id = parseInt(req.params.id, 10);

  try {
    var todoResult = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    var todo = todoResult.rows[0];

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    var text = req.body.text !== undefined ? req.body.text : todo.text;
    var completed = req.body.completed !== undefined ? (req.body.completed ? true : false) : todo.completed;

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text must be a non-empty string' });
    }

    var updateResult = await pool.query(
      'UPDATE todos SET text = $1, completed = $2 WHERE id = $3 RETURNING *',
      [text.trim(), completed, id]
    );
    res.json(updateResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/completed', async function (req, res) {
  try {
    var result = await pool.query('DELETE FROM todos WHERE completed = TRUE');
    res.json({ deleted: true, count: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async function (req, res) {
  var id = parseInt(req.params.id, 10);

  try {
    var todoResult = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    var todo = todoResult.rows[0];

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.json({ deleted: true, id: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
