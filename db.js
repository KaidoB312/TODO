var Database = require('better-sqlite3');
var path = require('path');

var DB_PATH = path.join(__dirname, 'todos.db');
var db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec('\n  CREATE TABLE IF NOT EXISTS todos (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    text TEXT NOT NULL,\n    completed INTEGER NOT NULL DEFAULT 0,\n    created_at TEXT NOT NULL DEFAULT (datetime(\'now\'))\n  )\n');

module.exports = db;
