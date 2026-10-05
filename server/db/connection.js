const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'gym.db');

let db = null;
let SQL = null;

async function initDb() {
    if (db) return;
    SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
        const filebuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(filebuffer);
    } else {
        db = new SQL.Database();
    }
}

function getDb() {
    if (!db) throw new Error('Database not initialized. Call initDb() first.');
    return db;
}

function save() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
}

function query(sql, params = []) {
    const db = getDb();
    const stmt = db.prepare(sql);
    if (params.length > 0) {
        stmt.bind(params);
    }
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

function queryOne(sql, params = []) {
    const rows = query(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

function run(sql, params = []) {
    const db = getDb();
    db.run(sql, params);
    
    let lastId = null;
    let changes = 0; // sql.js doesn't provide a direct way to get changes easily without an extra query, but let's try getting lastInsertRowid
    
    if (sql.trim().toUpperCase().startsWith('INSERT')) {
        const res = db.exec("SELECT last_insert_rowid() as id");
        if (res.length > 0 && res[0].values.length > 0) {
            lastId = res[0].values[0][0];
        }
    }
    
    save();
    
    return { lastInsertRowid: lastId, changes };
}

function exec(sql) {
    const db = getDb();
    db.exec(sql);
    save();
}

module.exports = {
    initDb,
    getDb,
    query,
    queryOne,
    run,
    exec,
    save
};
