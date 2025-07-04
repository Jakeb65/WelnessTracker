const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// GET all entries
app.get('/entries', (req, res) => {
  db.all('SELECT * FROM entries ORDER BY date DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const parsedRows = rows.map(row => ({
      ...row,
      exercises: row.exercises ? JSON.parse(row.exercises) : [],
    }));
    res.json(parsedRows);
  });
});

// GET entry by id
app.get('/entries/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM entries WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Entry not found' });
    row.exercises = row.exercises ? JSON.parse(row.exercises) : [];
    res.json(row);
  });
});

// POST create entry
app.post('/entries', (req, res) => {
  const {
    date = new Date().toISOString().slice(0, 10),
    steps = 0,
    stepsGoal = 10000,
    activity = 0,
    activityGoal = 60,
    mood = '',
    exercises = [],
    photoUri = null,
    photoBrightness = null,
  } = req.body;

  const sql = `
    INSERT INTO entries (date, steps, stepsGoal, activity, activityGoal, mood, exercises, photoUri, photoBrightness)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    date,
    steps,
    stepsGoal,
    activity,
    activityGoal,
    String(mood ?? ''),
    JSON.stringify(exercises),
    photoUri,
    photoBrightness,
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM entries WHERE id = ?', [this.lastID], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      row.exercises = row.exercises ? JSON.parse(row.exercises) : [];
      // photoBrightness już jest w row
      res.json(row);
    });
  });
});

// PUT update entry
app.put('/entries/:id', (req, res) => {
  const id = req.params.id;
  const {
    date,
    steps = 0,
    stepsGoal = 10000,
    activity = 0,
    activityGoal = 60,
    mood = '',
    exercises = [],
    photoUri = null,
    photoBrightness = null,
  } = req.body;

  const sql = `
    UPDATE entries
    SET date = COALESCE(?, date),
        steps = ?,
        stepsGoal = ?,
        activity = ?,
        activityGoal = ?,
        mood = ?,
        exercises = ?,
        photoUri = ?,
        photoBrightness = ?
    WHERE id = ?
  `;
  const params = [
    date,
    steps,
    stepsGoal,
    activity,
    activityGoal,
    String(mood ?? ''),
    JSON.stringify(exercises),
    photoUri,
    photoBrightness,
    id,
  ];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM entries WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Entry not found' });
      row.exercises = row.exercises ? JSON.parse(row.exercises) : [];
      // photoBrightness już jest w row
      res.json(row);
    });
  });
});

// DELETE entry
app.delete('/entries/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM entries WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://192.168.0.130:${PORT}`);
});