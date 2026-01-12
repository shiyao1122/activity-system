const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('e:/ruanniu/activity-system/server/dev.db');

db.serialize(() => {
    db.all("PRAGMA table_info(Task)", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Task Table Columns:');
            rows.forEach(row => {
                console.log(row.name);
            });
        }
    });
});

db.close();
