const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./wellnesstracker.db');

db.serialize(() => {
  db.get("PRAGMA table_info(entries)", (err, row) => {
    if (err) throw err;
    db.all("PRAGMA table_info(entries)", (err, columns) => {
      if (err) throw err;
      const hasPhotoUri = columns.some(col => col.name === 'photoUri');
      if (!hasPhotoUri) {
        db.run("ALTER TABLE entries ADD COLUMN photoUri TEXT DEFAULT NULL", err => {
          if (err) throw err;
          console.log('Dodano kolumnę photoUri.');
          db.close();
        });
      } else {
        console.log('Kolumna photoUri już istnieje.');
        db.close();
      }
    });
  });
});
