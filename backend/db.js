const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./wellnesstracker.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    steps INTEGER DEFAULT 0,
    stepsGoal INTEGER DEFAULT 10000,
    activity INTEGER DEFAULT 0,
    activityGoal INTEGER DEFAULT 60,
    mood TEXT DEFAULT '',
    exercises TEXT DEFAULT '[]',
    photoUri TEXT DEFAULT NULL,
    photoBrightness REAL
  )`);
});

module.exports = db;